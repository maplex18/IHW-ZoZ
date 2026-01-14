import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// File dialog API
const fileApi = {
  openFile: (options?: { multiple?: boolean; filters?: { name: string; extensions: string[] }[] }) =>
    ipcRenderer.invoke('dialog:openFile', options),
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  saveFile: (options?: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) =>
    ipcRenderer.invoke('dialog:saveFile', options),
  openPath: (path: string) => ipcRenderer.invoke('shell:openPath', path),
  getFilePath: (file: File) => webUtils.getPathForFile(file)
}

// PDF operations API
const pdfApi = {
  merge: (files: string[], outputPath: string) =>
    ipcRenderer.invoke('pdf:merge', files, outputPath),
  split: (file: string, outputDir: string, options?: { ranges?: string; everyNPages?: number }) =>
    ipcRenderer.invoke('pdf:split', file, outputDir, options),
  compress: (file: string, outputPath: string, quality: number) =>
    ipcRenderer.invoke('pdf:compress', file, outputPath, quality),
  toImages: (file: string, outputDir: string, format?: 'png' | 'jpg', dpi?: number) =>
    ipcRenderer.invoke('pdf:toImages', file, outputDir, format, dpi),
  rotate: (file: string, outputPath: string, angle: number, pages?: number[]) =>
    ipcRenderer.invoke('pdf:rotate', file, outputPath, angle, pages),
  encrypt: (file: string, outputPath: string, password: string) =>
    ipcRenderer.invoke('pdf:encrypt', file, outputPath, password),
  decrypt: (file: string, outputPath: string, password: string) =>
    ipcRenderer.invoke('pdf:decrypt', file, outputPath, password),
  crack: (
    file: string,
    outputPath: string,
    options?: {
      method?: 'dictionary' | 'bruteforce' | 'custom'
      maxLength?: number
      charset?: 'digits' | 'lowercase' | 'uppercase' | 'alphanumeric'
      customPasswords?: string[]
    }
  ) => ipcRenderer.invoke('pdf:crack', file, outputPath, options)
}

// Media operations API
const mediaApi = {
  info: (file: string) => ipcRenderer.invoke('media:info', file),
  videoCompress: (
    file: string,
    outputPath: string,
    options?: { quality?: number; preset?: string; resolution?: string }
  ) => ipcRenderer.invoke('media:videoCompress', file, outputPath, options),
  videoConvert: (file: string, outputPath: string, format: string) =>
    ipcRenderer.invoke('media:videoConvert', file, outputPath, format),
  audioConvert: (
    file: string,
    outputPath: string,
    options: { format: string; bitrate?: string; sampleRate?: number }
  ) => ipcRenderer.invoke('media:audioConvert', file, outputPath, options),
  audioExtract: (file: string, outputPath: string, format?: string) =>
    ipcRenderer.invoke('media:audioExtract', file, outputPath, format),
  videoToGif: (
    file: string,
    outputPath: string,
    options?: { fps?: number; width?: number; startTime?: number; duration?: number }
  ) => ipcRenderer.invoke('media:videoToGif', file, outputPath, options)
}

// Image operations API
const imageApi = {
  info: (file: string) => ipcRenderer.invoke('image:info', file),
  createGif: (
    files: string[],
    outputPath: string,
    options?: { frameDelay?: number; loop?: number }
  ) => ipcRenderer.invoke('image:createGif', files, outputPath, options),
  resize: (
    file: string,
    outputPath: string,
    options: { width?: number; height?: number; keepAspectRatio?: boolean; quality?: number }
  ) => ipcRenderer.invoke('image:resize', file, outputPath, options),
  crop: (
    file: string,
    outputPath: string,
    options: { x: number; y: number; width: number; height: number; quality?: number }
  ) => ipcRenderer.invoke('image:crop', file, outputPath, options),
  getColors: (file: string, numColors?: number) =>
    ipcRenderer.invoke('image:getColors', file, numColors),
  rotate: (
    file: string,
    outputPath: string,
    options: { angle: number; expand?: boolean; fillColor?: string; quality?: number }
  ) => ipcRenderer.invoke('image:rotate', file, outputPath, options),
  flip: (
    file: string,
    outputPath: string,
    options?: { horizontal?: boolean; quality?: number }
  ) => ipcRenderer.invoke('image:flip', file, outputPath, options),
  enlarge: (
    file: string,
    outputPath: string,
    options?: { scaleFactor?: number; quality?: number }
  ) => ipcRenderer.invoke('image:enlarge', file, outputPath, options)
}

// Download operations API
const downloadApi = {
  checkNetwork: () => ipcRenderer.invoke('download:checkNetwork'),
  getVideoInfo: (url: string) => ipcRenderer.invoke('download:getVideoInfo', url),
  download: (
    url: string,
    outputPath: string,
    options?: {
      resolution?: string
      format?: string
      audioOnly?: boolean
      audioFormat?: string
    }
  ) => ipcRenderer.invoke('download:video', url, outputPath, options)
}

// Task management API
const taskApi = {
  cancel: (taskId: string) => ipcRenderer.invoke('task:cancel', taskId),
  cleanup: (filePath: string) => ipcRenderer.invoke('task:cleanup', filePath)
}

// Event listeners
const events = {
  onProgress: (callback: (data: { taskId: string; progress: number; message?: string }) => void) => {
    const handler = (_: unknown, data: { taskId: string; progress: number; message?: string }) =>
      callback(data)
    ipcRenderer.on('task:progress', handler)
    return () => ipcRenderer.removeListener('task:progress', handler)
  }
}

// Custom APIs for renderer
const api = {
  file: fileApi,
  pdf: pdfApi,
  media: mediaApi,
  image: imageApi,
  download: downloadApi,
  task: taskApi,
  events
}

// Use `contextBridge` APIs to expose Electron APIs to renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
