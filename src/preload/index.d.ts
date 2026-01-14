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
  encrypt: (file: string, outputPath: string, password: string) => Promise<string>
  decrypt: (file: string, outputPath: string, password: string) => Promise<string>
  crack: (
    file: string,
    outputPath: string,
    options?: {
      method?: 'dictionary' | 'bruteforce' | 'custom'
      maxLength?: number
      charset?: 'digits' | 'lowercase' | 'uppercase' | 'alphanumeric'
      customPasswords?: string[]
    }
  ) => Promise<{
    success: boolean
    password: string | null
    message: string
    outputPath: string | null
  }>
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
  videoToGif: (
    file: string,
    outputPath: string,
    options?: { fps?: number; width?: number; startTime?: number; duration?: number }
  ) => Promise<string>
}

interface ProgressData {
  taskId: string
  progress: number
  message?: string
}

interface Events {
  onProgress: (callback: (data: ProgressData) => void) => () => void
}

interface VideoFormat {
  format_id: string
  type: string
  resolution: string
  height: number
  ext: string
  filesize: number | null
  vcodec: string
  acodec: string
}

interface VideoInfo {
  title: string
  description: string
  duration: number
  thumbnail: string
  uploader: string
  upload_date: string
  view_count: number
  formats: VideoFormat[]
  url: string
}

interface DownloadResult {
  success: boolean
  outputPath: string
  title: string
  duration: number
  message: string
}

interface NetworkStatus {
  connected: boolean
  host: string | null
  message: string
}

interface DownloadApi {
  checkNetwork: () => Promise<NetworkStatus>
  getVideoInfo: (url: string) => Promise<VideoInfo>
  download: (
    url: string,
    outputPath: string,
    options?: {
      resolution?: string
      format?: string
      audioOnly?: boolean
      audioFormat?: string
    }
  ) => Promise<DownloadResult>
}

interface TaskApi {
  cancel: (taskId: string) => Promise<{ cancelled: boolean; taskId: string }>
  cleanup: (filePath: string) => Promise<{ cleaned: boolean; filePath: string }>
}

interface Api {
  file: FileApi
  pdf: PdfApi
  media: MediaApi
  download: DownloadApi
  task: TaskApi
  events: Events
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
