import { ElectronAPI } from '@electron-toolkit/preload'

interface FileApi {
  openFile: (options?: {
    multiple?: boolean
    filters?: { name: string; extensions: string[] }[]
  }) => Promise<string[] | null>
  openDirectory: () => Promise<string | null>
  saveFile: (options?: {
    defaultPath?: string
    filters?: { name: string; extensions: string[] }[]
  }) => Promise<string | null>
  openPath: (path: string) => Promise<string>
  getFilePath: (file: File) => string
}

interface PdfApi {
  merge: (files: string[], outputPath: string) => Promise<string>
  split: (
    file: string,
    outputDir: string,
    options?: { ranges?: string; everyNPages?: number }
  ) => Promise<string[]>
  compress: (file: string, outputPath: string, quality: number) => Promise<string>
  toImages: (
    file: string,
    outputDir: string,
    format?: 'png' | 'jpg',
    dpi?: number
  ) => Promise<string[]>
  rotate: (file: string, outputPath: string, angle: number, pages?: number[]) => Promise<string>
  addWatermark: (
    file: string,
    outputPath: string,
    watermark: { text?: string; image?: string; opacity?: number }
  ) => Promise<string>
  encrypt: (file: string, outputPath: string, password: string) => Promise<string>
  decrypt: (file: string, outputPath: string, password: string) => Promise<string>
  ocr: (file: string, outputPath: string, language?: string) => Promise<string>
}

interface MediaInfo {
  duration: number
  format: string
  size: number
  bitrate?: number
  width?: number
  height?: number
  fps?: number
  videoCodec?: string
  audioCodec?: string
  sampleRate?: number
  channels?: number
}

interface MediaApi {
  info: (file: string) => Promise<MediaInfo>
  videoCompress: (
    file: string,
    outputPath: string,
    options?: { quality?: number; preset?: string; resolution?: string }
  ) => Promise<string>
  videoConvert: (file: string, outputPath: string, format: string) => Promise<string>
  audioConvert: (
    file: string,
    outputPath: string,
    options: { format: string; bitrate?: string; sampleRate?: number }
  ) => Promise<string>
  audioExtract: (file: string, outputPath: string, format?: string) => Promise<string>
  trim: (file: string, outputPath: string, startTime: number, endTime: number) => Promise<string>
}

interface ProgressData {
  taskId: string
  progress: number
  message?: string
}

interface Events {
  onProgress: (callback: (data: ProgressData) => void) => () => void
}

interface Api {
  file: FileApi
  pdf: PdfApi
  media: MediaApi
  events: Events
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}

export {}
