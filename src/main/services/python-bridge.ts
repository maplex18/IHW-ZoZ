import { spawn, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import { app } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import ffmpegPath from 'ffmpeg-static'
import ffprobePath from '@ffprobe-installer/ffprobe'

interface PendingRequest {
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
  timeout: NodeJS.Timeout
}

interface JsonRpcRequest {
  jsonrpc: '2.0'
  id: number
  method: string
  params: unknown
}

interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: number
  result?: unknown
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

interface ProgressEvent {
  taskId: string
  progress: number
  message?: string
}

export class PythonBridge extends EventEmitter {
  private process: ChildProcess | null = null
  private messageId = 0
  private pendingRequests = new Map<number, PendingRequest>()
  private buffer = ''
  private isRunning = false
  private readonly REQUEST_TIMEOUT = 300000 // 5 minutes

  constructor() {
    super()
  }

  private getPythonPath(): string {
    // Try to find python3 or python
    return process.platform === 'win32' ? 'python' : 'python3'
  }

  private getScriptPath(): string {
    if (is.dev) {
      return join(app.getAppPath(), 'python', 'main.py')
    }
    return join(process.resourcesPath, 'python', 'main.py')
  }

  private getExecutablePath(): string {
    // Get the path to the packaged Python backend executable
    const ext = process.platform === 'win32' ? '.exe' : ''
    const execName = `ihatework-backend${ext}`

    if (is.dev) {
      // In development, check if executable exists in python/dist
      return join(app.getAppPath(), 'python', 'dist', execName)
    }
    // In production, executable is in resources/python
    return join(process.resourcesPath, 'python', execName)
  }

  private usePackagedExecutable(): boolean {
    // Check if the packaged executable exists
    const execPath = this.getExecutablePath()
    try {
      const fs = require('fs')
      return fs.existsSync(execPath)
    } catch {
      return false
    }
  }

  private getFfmpegPath(): string {
    if (!ffmpegPath) {
      return ''
    }
    // In production, ffmpeg-static binary is in app.asar.unpacked
    if (!is.dev && ffmpegPath.includes('app.asar')) {
      return ffmpegPath.replace('app.asar', 'app.asar.unpacked')
    }
    return ffmpegPath
  }

  private getFfprobePath(): string {
    if (!ffprobePath || !ffprobePath.path) {
      return ''
    }
    // In production, ffprobe binary is in app.asar.unpacked
    if (!is.dev && ffprobePath.path.includes('app.asar')) {
      return ffprobePath.path.replace('app.asar', 'app.asar.unpacked')
    }
    return ffprobePath.path
  }

  async start(): Promise<void> {
    if (this.isRunning) return

    const usePackaged = this.usePackagedExecutable()
    const ffmpegPathValue = this.getFfmpegPath()
    const ffprobePathValue = this.getFfprobePath()

    let command: string
    let args: string[]

    if (usePackaged) {
      // Use the packaged PyInstaller executable
      command = this.getExecutablePath()
      args = []
      console.log(`Starting Python bridge (packaged): ${command}`)
    } else {
      // Use Python interpreter with script (development mode)
      command = this.getPythonPath()
      args = [this.getScriptPath()]
      console.log(`Starting Python bridge (script): ${command} ${args.join(' ')}`)
    }

    try {
      this.process = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
          PYTHONIOENCODING: 'utf-8',
          FFMPEG_PATH: ffmpegPathValue,
          FFPROBE_PATH: ffprobePathValue
        }
      })

      this.process.stdout?.on('data', (data: Buffer) => {
        this.handleOutput(data.toString())
      })

      this.process.stderr?.on('data', (data: Buffer) => {
        console.error('[Python Error]:', data.toString())
      })

      this.process.on('close', (code) => {
        console.log(`Python process exited with code ${code}`)
        this.isRunning = false
        this.rejectAllPending('Python process terminated')
      })

      this.process.on('error', (err) => {
        console.error('Python process error:', err)
        this.isRunning = false
      })

      this.isRunning = true
    } catch (error) {
      console.error('Failed to start Python bridge:', error)
      throw error
    }
  }

  stop(): void {
    if (this.process) {
      this.process.kill()
      this.process = null
    }
    this.isRunning = false
    this.rejectAllPending('Python bridge stopped')
  }

  private handleOutput(data: string): void {
    this.buffer += data
    const lines = this.buffer.split('\n')
    this.buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.trim()) continue

      try {
        const message = JSON.parse(line)

        // Check if it's a progress event
        if (message.type === 'progress') {
          const progressEvent: ProgressEvent = {
            taskId: message.taskId,
            progress: message.progress,
            message: message.message
          }
          this.emit('progress', progressEvent)
          continue
        }

        // Handle JSON-RPC response
        const response = message as JsonRpcResponse
        const pending = this.pendingRequests.get(response.id)

        if (pending) {
          clearTimeout(pending.timeout)
          this.pendingRequests.delete(response.id)

          if (response.error) {
            pending.reject(new Error(response.error.message))
          } else {
            pending.resolve(response.result)
          }
        }
      } catch (e) {
        // Not JSON, might be regular log output
        console.log('[Python]:', line)
      }
    }
  }

  private rejectAllPending(reason: string): void {
    for (const [id, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout)
      pending.reject(new Error(reason))
    }
    this.pendingRequests.clear()
  }

  async call<T>(method: string, params: unknown = {}): Promise<T> {
    if (!this.isRunning) {
      await this.start()
    }

    if (!this.process?.stdin) {
      throw new Error('Python process not available')
    }

    const id = ++this.messageId
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(new Error(`Request timeout: ${method}`))
      }, this.REQUEST_TIMEOUT)

      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeout
      })

      const message = JSON.stringify(request) + '\n'
      this.process!.stdin!.write(message)
    })
  }

  // PDF Operations
  async pdfMerge(files: string[], outputPath: string): Promise<string> {
    return this.call('pdf.merge', { files, outputPath })
  }

  async pdfSplit(
    file: string,
    outputDir: string,
    options: { ranges?: string; everyNPages?: number }
  ): Promise<string[]> {
    return this.call('pdf.split', { file, outputDir, ...options })
  }

  async pdfCompress(file: string, outputPath: string, quality: number): Promise<string> {
    return this.call('pdf.compress', { file, outputPath, quality })
  }

  async pdfToImages(
    file: string,
    outputDir: string,
    format: 'png' | 'jpg' = 'png',
    dpi: number = 150
  ): Promise<string[]> {
    return this.call('pdf.toImages', { file, outputDir, format, dpi })
  }

  async pdfRotate(file: string, outputPath: string, angle: number, pages?: number[]): Promise<string> {
    return this.call('pdf.rotate', { file, outputPath, angle, pages })
  }

  async pdfAddWatermark(
    file: string,
    outputPath: string,
    watermark: { text?: string; image?: string; opacity?: number }
  ): Promise<string> {
    return this.call('pdf.addWatermark', { file, outputPath, ...watermark })
  }

  async pdfEncrypt(file: string, outputPath: string, password: string): Promise<string> {
    return this.call('pdf.encrypt', { file, outputPath, password })
  }

  async pdfDecrypt(file: string, outputPath: string, password: string): Promise<string> {
    return this.call('pdf.decrypt', { file, outputPath, password })
  }

  // Media Operations (via FFmpeg)
  async mediaInfo(file: string): Promise<object> {
    return this.call('media.info', { file })
  }

  async videoCompress(
    file: string,
    outputPath: string,
    options: { quality?: number; preset?: string; resolution?: string }
  ): Promise<string> {
    return this.call('media.videoCompress', { file, outputPath, ...options })
  }

  async videoConvert(file: string, outputPath: string, format: string): Promise<string> {
    return this.call('media.videoConvert', { file, outputPath, format })
  }

  async audioConvert(
    file: string,
    outputPath: string,
    options: { format: string; bitrate?: string; sampleRate?: number }
  ): Promise<string> {
    return this.call('media.audioConvert', { file, outputPath, ...options })
  }

  async audioExtract(file: string, outputPath: string, format: string = 'mp3'): Promise<string> {
    return this.call('media.audioExtract', { file, outputPath, format })
  }

  async mediaTrim(
    file: string,
    outputPath: string,
    startTime: number,
    endTime: number
  ): Promise<string> {
    return this.call('media.trim', { file, outputPath, startTime, endTime })
  }

  // Image Operations
  async imageInfo(file: string): Promise<object> {
    return this.call('image.info', { file })
  }

  async imageCreateGif(
    files: string[],
    outputPath: string,
    options: { frameDelay?: number; loop?: number }
  ): Promise<string> {
    return this.call('image.createGif', { files, outputPath, ...options })
  }

  async imageResize(
    file: string,
    outputPath: string,
    options: { width?: number; height?: number; keepAspectRatio?: boolean; quality?: number }
  ): Promise<string> {
    return this.call('image.resize', { file, outputPath, ...options })
  }

  async imageCrop(
    file: string,
    outputPath: string,
    options: { x: number; y: number; width: number; height: number; quality?: number }
  ): Promise<string> {
    return this.call('image.crop', { file, outputPath, ...options })
  }

  async imageGetColors(file: string, numColors: number = 10): Promise<object[]> {
    return this.call('image.getColors', { file, numColors })
  }

  async imageRotate(
    file: string,
    outputPath: string,
    options: { angle: number; expand?: boolean; fillColor?: string; quality?: number }
  ): Promise<string> {
    return this.call('image.rotate', { file, outputPath, ...options })
  }

  async imageFlip(
    file: string,
    outputPath: string,
    options: { horizontal?: boolean; quality?: number }
  ): Promise<string> {
    return this.call('image.flip', { file, outputPath, ...options })
  }

  async imageEnlarge(
    file: string,
    outputPath: string,
    options: { scaleFactor?: number; quality?: number }
  ): Promise<string> {
    return this.call('image.enlarge', { file, outputPath, ...options })
  }
}
