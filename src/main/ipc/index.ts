import { IpcMain, dialog, BrowserWindow, shell } from 'electron'
import { PythonBridge } from '../services/python-bridge'

export function registerIpcHandlers(ipcMain: IpcMain, pythonBridge: PythonBridge): void {
  // File dialogs
  ipcMain.handle('dialog:openFile', async (_, options) => {
    const win = BrowserWindow.getFocusedWindow()
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openFile', ...(options?.multiple ? ['multiSelections'] as const : [])],
      filters: options?.filters || []
    })
    return result.canceled ? null : result.filePaths
  })

  ipcMain.handle('dialog:openDirectory', async () => {
    const win = BrowserWindow.getFocusedWindow()
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openDirectory', 'createDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('dialog:saveFile', async (_, options) => {
    const win = BrowserWindow.getFocusedWindow()
    const result = await dialog.showSaveDialog(win!, {
      defaultPath: options?.defaultPath,
      filters: options?.filters || []
    })
    return result.canceled ? null : result.filePath
  })

  // Shell operations
  ipcMain.handle('shell:openPath', async (_, path: string) => {
    return shell.openPath(path)
  })

  // PDF Operations
  ipcMain.handle('pdf:merge', async (_, files: string[], outputPath: string) => {
    return pythonBridge.pdfMerge(files, outputPath)
  })

  ipcMain.handle('pdf:split', async (_, file: string, outputDir: string, options) => {
    return pythonBridge.pdfSplit(file, outputDir, options)
  })

  ipcMain.handle('pdf:compress', async (_, file: string, outputPath: string, quality: number) => {
    return pythonBridge.pdfCompress(file, outputPath, quality)
  })

  ipcMain.handle('pdf:toImages', async (_, file: string, outputDir: string, format, dpi) => {
    return pythonBridge.pdfToImages(file, outputDir, format, dpi)
  })

  ipcMain.handle('pdf:rotate', async (_, file: string, outputPath: string, angle: number, pages) => {
    return pythonBridge.pdfRotate(file, outputPath, angle, pages)
  })

  ipcMain.handle('pdf:encrypt', async (_, file: string, outputPath: string, password: string) => {
    return pythonBridge.pdfEncrypt(file, outputPath, password)
  })

  ipcMain.handle('pdf:decrypt', async (_, file: string, outputPath: string, password: string) => {
    return pythonBridge.pdfDecrypt(file, outputPath, password)
  })

  ipcMain.handle('pdf:crack', async (_, file: string, outputPath: string, options) => {
    return pythonBridge.pdfCrack(file, outputPath, options || {})
  })

  // Media Operations
  ipcMain.handle('media:info', async (_, file: string) => {
    return pythonBridge.mediaInfo(file)
  })

  ipcMain.handle('media:videoCompress', async (_, file: string, outputPath: string, options) => {
    return pythonBridge.videoCompress(file, outputPath, options)
  })

  ipcMain.handle('media:videoConvert', async (_, file: string, outputPath: string, format: string) => {
    return pythonBridge.videoConvert(file, outputPath, format)
  })

  ipcMain.handle('media:audioConvert', async (_, file: string, outputPath: string, options) => {
    return pythonBridge.audioConvert(file, outputPath, options)
  })

  ipcMain.handle('media:audioExtract', async (_, file: string, outputPath: string, format: string) => {
    return pythonBridge.audioExtract(file, outputPath, format)
  })

  ipcMain.handle('media:videoToGif', async (_, file: string, outputPath: string, options) => {
    return pythonBridge.videoToGif(file, outputPath, options || {})
  })

  // Image Operations
  ipcMain.handle('image:info', async (_, file: string) => {
    return pythonBridge.imageInfo(file)
  })

  ipcMain.handle('image:createGif', async (_, files: string[], outputPath: string, options) => {
    return pythonBridge.imageCreateGif(files, outputPath, options)
  })

  ipcMain.handle('image:resize', async (_, file: string, outputPath: string, options) => {
    return pythonBridge.imageResize(file, outputPath, options)
  })

  ipcMain.handle('image:crop', async (_, file: string, outputPath: string, options) => {
    return pythonBridge.imageCrop(file, outputPath, options)
  })

  ipcMain.handle('image:getColors', async (_, file: string, numColors: number) => {
    return pythonBridge.imageGetColors(file, numColors)
  })

  ipcMain.handle('image:rotate', async (_, file: string, outputPath: string, options) => {
    return pythonBridge.imageRotate(file, outputPath, options)
  })

  ipcMain.handle('image:flip', async (_, file: string, outputPath: string, options) => {
    return pythonBridge.imageFlip(file, outputPath, options)
  })

  ipcMain.handle('image:enlarge', async (_, file: string, outputPath: string, options) => {
    return pythonBridge.imageEnlarge(file, outputPath, options)
  })

  // Download Operations
  ipcMain.handle('download:checkNetwork', async () => {
    return pythonBridge.downloadCheckNetwork()
  })

  ipcMain.handle('download:getVideoInfo', async (_, url: string) => {
    return pythonBridge.downloadGetVideoInfo(url)
  })

  ipcMain.handle('download:video', async (_, url: string, outputPath: string, options) => {
    return pythonBridge.downloadVideo(url, outputPath, options || {})
  })

  // Task Management Operations
  ipcMain.handle('task:cancel', async (_, taskId: string) => {
    return pythonBridge.cancelTask(taskId)
  })

  ipcMain.handle('task:cleanup', async (_, filePath: string) => {
    return pythonBridge.cleanupFile(filePath)
  })

  // Progress events
  pythonBridge.on('progress', (data) => {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((win) => {
      win.webContents.send('task:progress', data)
    })
  })
}
