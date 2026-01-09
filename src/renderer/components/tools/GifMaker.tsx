import { useState, useCallback } from 'react'
import { Play, GripVertical, X } from 'lucide-react'
import { FileDropZone } from '../shared/FileDropZone'
import { ProcessingStatus } from '../shared/ProcessingStatus'
import { ImagePreviewGrid } from '../shared/ImagePreview'
import { useTask, filesToPaths, getOutputDir } from '@/hooks/useTask'
import { IMAGE_FILTERS } from '@shared/constants'
import { useI18n } from '@/hooks/useI18n'

export function GifMaker(): JSX.Element {
  const t = useI18n()
  const [files, setFiles] = useState<File[]>([])
  const [outputPath, setOutputPath] = useState<string>('')
  const [frameDelay, setFrameDelay] = useState<number>(100)
  const [loop, setLoop] = useState<number>(0)

  const { isProcessing, progress, error, result, execute, reset } = useTask({
    taskType: 'image:createGif'
  })

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
    if (!outputPath && newFiles.length > 0) {
      const firstFilePath = window.api.file.getFilePath(newFiles[0])
      const dir = getOutputDir(firstFilePath)
      setOutputPath(`${dir}/animation.gif`)
    }
  }, [outputPath])

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleMoveFile = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= files.length) return

    setFiles((prev) => {
      const newFiles = [...prev]
      const temp = newFiles[fromIndex]
      newFiles[fromIndex] = newFiles[toIndex]
      newFiles[toIndex] = temp
      return newFiles
    })
  }

  const handleSelectOutput = async () => {
    const path = await window.api.file.saveFile({
      defaultPath: outputPath,
      filters: [{ name: 'GIF', extensions: ['gif'] }]
    })
    if (path) setOutputPath(path)
  }

  const handleProcess = async () => {
    if (files.length < 2 || !outputPath) return
    const paths = filesToPaths(files)
    await execute(() => window.api.image.createGif(paths, outputPath, { frameDelay, loop }))
  }

  const handleReset = () => {
    reset()
    setFiles([])
    setOutputPath('')
    setFrameDelay(100)
    setLoop(0)
  }

  const handleOpenResult = () => {
    if (result) {
      const dir = result.substring(0, Math.max(result.lastIndexOf('/'), result.lastIndexOf('\\')))
      window.api.file.openPath(dir)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 mb-2">{t.image.gifMaker}</h1>
        <p className="text-gray-400">{t.image.gifMakerDesc}</p>
      </div>

      {!result && (
        <>
          <FileDropZone
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.tiff', '.tif'] }}
            onFilesSelected={handleFilesSelected}
            multiple={true}
            disabled={isProcessing}
            hideFileList={true}
          />
          <p className="text-xs text-gray-500 -mt-4">Supported formats: JPG, PNG, GIF, BMP, WEBP, TIFF (SVG not supported)</p>

          {files.length > 0 && (
            <>
              <ImagePreviewGrid files={files} onRemove={handleRemoveFile} />

              <div className="card space-y-4">
                <h3 className="font-medium text-gray-200">{t.file.options}</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">
                      {t.image.frameDelay}
                    </label>
                    <input
                      type="number"
                      value={frameDelay}
                      onChange={(e) => setFrameDelay(Math.max(10, parseInt(e.target.value) || 100))}
                      className="input-field w-full"
                      min={10}
                      max={5000}
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">
                      {t.image.loop}
                    </label>
                    <select
                      value={loop}
                      onChange={(e) => setLoop(parseInt(e.target.value))}
                      className="input-field w-full"
                      disabled={isProcessing}
                    >
                      <option value={0}>Infinite</option>
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card space-y-4">
                <h3 className="font-medium text-gray-200">Output</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={outputPath}
                    onChange={(e) => setOutputPath(e.target.value)}
                    placeholder="Select output path..."
                    className="input-field flex-1"
                    disabled={isProcessing}
                  />
                  <button
                    onClick={handleSelectOutput}
                    className="btn-secondary"
                    disabled={isProcessing}
                  >
                    {t.media.browse}
                  </button>
                </div>

                <button
                  onClick={handleProcess}
                  disabled={isProcessing || files.length < 2 || !outputPath}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Create GIF
                </button>
              </div>
            </>
          )}
        </>
      )}

      <ProcessingStatus
        isProcessing={isProcessing}
        progress={progress}
        error={error}
        result={result}
        onOpenResult={handleOpenResult}
        onReset={handleReset}
      />
    </div>
  )
}
