// Task types
export type TaskType =
  | 'pdf:merge'
  | 'pdf:split'
  | 'pdf:compress'
  | 'pdf:toImages'
  | 'pdf:rotate'
  | 'pdf:encrypt'
  | 'pdf:decrypt'
  | 'pdf:crack'
  | 'pdf:watermark'
  | 'pdf:ocr'
  | 'video:compress'
  | 'video:convert'
  | 'video:toGif'
  | 'audio:compress'
  | 'audio:convert'
  | 'audio:extract'
  | 'image:createGif'
  | 'image:resize'
  | 'image:crop'
  | 'image:getColors'
  | 'image:rotate'
  | 'image:flip'
  | 'image:enlarge'
  | 'download:youtube'

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

export interface Task {
  id: string
  type: TaskType
  status: TaskStatus
  input: FileInfo[]
  output?: FileInfo
  options: Record<string, unknown>
  progress: number
  error?: string
  createdAt: Date
  completedAt?: Date
}

// File types
export interface FileInfo {
  path: string
  name: string
  size: number
  type: string
  lastModified?: Date
}

// PDF specific types
export interface PdfInfo {
  pageCount: number
  title?: string
  author?: string
  subject?: string
  creator?: string
  producer?: string
  creationDate?: Date
  modificationDate?: Date
  encrypted: boolean
}

// Media specific types
export interface MediaInfo {
  duration: number
  format: string
  size: number
  bitrate?: number
  // Video specific
  width?: number
  height?: number
  fps?: number
  videoCodec?: string
  // Audio specific
  audioCodec?: string
  sampleRate?: number
  channels?: number
}

// Settings types
export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  defaultOutputDir: string
  autoCleanTempFiles: boolean
  maxConcurrentTasks: number
  // PDF settings
  pdfDefaultQuality: number
  pdfDefaultDpi: number
  // Video settings
  videoDefaultQuality: number
  videoDefaultPreset: string
  // Audio settings
  audioDefaultFormat: string
  audioDefaultBitrate: string
  // Onboarding
  hasCompletedOnboarding: boolean
}

// Tool categories
export interface ToolCategory {
  id: string
  name: string
  icon: string
  tools: Tool[]
}

export interface Tool {
  id: string
  name: string
  description: string
  icon: string
  path: string
  category: 'pdf' | 'media' | 'image'
}
