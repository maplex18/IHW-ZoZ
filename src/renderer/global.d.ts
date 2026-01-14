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
    watermark: {
      text?: string
      image?: string
      opacity?: number
      position?: 'center' | 'top-left' | 'top' | 'top-right' | 'left' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right'
      scale?: number
    }
  ) => Promise<string>
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
  videoToGif: (
    file: string,
    outputPath: string,
    options?: { fps?: number; width?: number; startTime?: number; duration?: number }
  ) => Promise<string>
}

interface ImageApi {
  info: (file: string) => Promise<{ width: number; height: number; format: string }>
  createGif: (
    files: string[],
    outputPath: string,
    options?: { frameDelay?: number; loop?: number }
  ) => Promise<string>
  resize: (
    file: string,
    outputPath: string,
    options: { width?: number; height?: number; keepAspectRatio?: boolean; quality?: number }
  ) => Promise<string>
  crop: (
    file: string,
    outputPath: string,
    options: { x: number; y: number; width: number; height: number; quality?: number }
  ) => Promise<string>
  getColors: (file: string, numColors?: number) => Promise<Array<{
    rgb: { r: number; g: number; b: number }
    hex: string
    count: number
  }>>
  rotate: (
    file: string,
    outputPath: string,
    options: { angle: number; expand?: boolean; fillColor?: string; quality?: number }
  ) => Promise<string>
  flip: (
    file: string,
    outputPath: string,
    options?: { horizontal?: boolean; quality?: number }
  ) => Promise<string>
  enlarge: (
    file: string,
    outputPath: string,
    options?: { scaleFactor?: number; quality?: number }
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

interface Api {
  file: FileApi
  pdf: PdfApi
  media: MediaApi
  image: ImageApi
  download: DownloadApi
  events: Events
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}

export {}
