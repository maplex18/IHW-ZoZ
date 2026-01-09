import { useState, useCallback } from 'react'
import { Play } from 'lucide-react'
import { FileDropZone } from '../shared/FileDropZone'
import { ProcessingStatus } from '../shared/ProcessingStatus'
import { ResizePreview } from '../shared/ImagePreview'
import { useTask, getDefaultOutputPath } from '@/hooks/useTask'
import { IMAGE_FILTERS } from '@shared/constants'
import { useI18n } from '@/hooks/useI18n'

export function ImageResize(): JSX.Element {
  const t = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [outputPath, setOutputPath] = useState<string>('')
  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)
  const [originalWidth, setOriginalWidth] = useState<number>(0)
  const [originalHeight, setOriginalHeight] = useState<number>(0)
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true)
  const [quality, setQuality] = useState<number>(95)

  const { isProcessing, progress, error, result, execute, reset } = useTask({
    taskType: 'image:resize'
  })

  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0]
      setFile(selectedFile)
      const filePath = window.api.file.getFilePath(selectedFile)
      setOutputPath(getDefaultOutputPath(filePath, '_resized'))

      // Get image dimensions
      try {
        const info = await window.api.image.info(filePath) as { width: number; height: number }
        setOriginalWidth(info.width)
        setOriginalHeight(info.height)
        setWidth(info.width)
        setHeight(info.height)
      } catch (err) {
        console.error('Failed to get image info:', err)
      }
    }
  }, [])

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth)
    if (keepAspectRatio && originalWidth > 0) {
      const ratio = originalHeight / originalWidth
      setHeight(Math.round(newWidth * ratio))
    }
  }

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight)
    if (keepAspectRatio && originalHeight > 0) {
      const ratio = originalWidth / originalHeight
      setWidth(Math.round(newHeight * ratio))
    }
  }

  const handleResize = (newWidth: number, newHeight: number) => {
    setWidth(newWidth)
    setHeight(newHeight)
  }

  const handleSelectOutput = async () => {
    const path = await window.api.file.saveFile({
      defaultPath: outputPath,
      filters: IMAGE_FILTERS
    })
    if (path) setOutputPath(path)
  }

  const handleProcess = async () => {
    if (!file || !outputPath) return
    const filePath = window.api.file.getFilePath(file)
    await execute(() =>
      window.api.image.resize(filePath, outputPath, { width, height, keepAspectRatio, quality })
    )
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setOutputPath('')
    setWidth(0)
    setHeight(0)
    setOriginalWidth(0)
    setOriginalHeight(0)
    setKeepAspectRatio(true)
    setQuality(95)
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
        <h1 className="text-2xl font-bold text-gray-100 mb-2">{t.image.resize}</h1>
        <p className="text-gray-400">{t.image.resizeDesc}</p>
      </div>

      {!result && (
        <>
          <FileDropZone
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'] }}
            onFilesSelected={handleFilesSelected}
            multiple={false}
            disabled={isProcessing}
            hideFileList={true}
          />

          {file && (
            <>
              <ResizePreview
                file={file}
                width={width}
                height={height}
                originalWidth={originalWidth}
                originalHeight={originalHeight}
                keepAspectRatio={keepAspectRatio}
                onResize={handleResize}
              />

              <div className="card space-y-4">
                <h3 className="font-medium text-gray-200">{t.file.options}</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">{t.image.width}</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                      className="input-field w-full"
                      min={1}
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">{t.image.height}</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                      className="input-field w-full"
                      min={1}
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepAspectRatio}
                    onChange={(e) => setKeepAspectRatio(e.target.checked)}
                    disabled={isProcessing}
                  />
                  <span className="text-gray-300">{t.image.keepAspectRatio}</span>
                </label>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">
                    {t.image.quality}: {quality}%
                  </label>
                  <input
                    type="range"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full"
                    min={1}
                    max={100}
                    disabled={isProcessing}
                  />
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
                  disabled={isProcessing || !outputPath || width <= 0 || height <= 0}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {t.image.resize}
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
