import { useState, useCallback } from 'react'
import { Play } from 'lucide-react'
import { FileDropZone } from '../shared/FileDropZone'
import { ProcessingStatus } from '../shared/ProcessingStatus'
import { CropPreview } from '../shared/ImagePreview'
import { useTask, getDefaultOutputPath } from '@/hooks/useTask'
import { IMAGE_FILTERS } from '@shared/constants'
import { useI18n } from '@/hooks/useI18n'

export function ImageCrop(): JSX.Element {
  const t = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [outputPath, setOutputPath] = useState<string>('')
  const [originalWidth, setOriginalWidth] = useState<number>(0)
  const [originalHeight, setOriginalHeight] = useState<number>(0)
  const [x, setX] = useState<number>(0)
  const [y, setY] = useState<number>(0)
  const [cropWidth, setCropWidth] = useState<number>(0)
  const [cropHeight, setCropHeight] = useState<number>(0)
  const [quality, setQuality] = useState<number>(95)

  const { isProcessing, progress, error, result, execute, reset } = useTask({
    taskType: 'image:crop'
  })

  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0]
      setFile(selectedFile)
      const filePath = window.api.file.getFilePath(selectedFile)
      setOutputPath(getDefaultOutputPath(filePath, '_cropped'))

      try {
        const info = await window.api.image.info(filePath) as { width: number; height: number }
        setOriginalWidth(info.width)
        setOriginalHeight(info.height)
        setX(0)
        setY(0)
        setCropWidth(info.width)
        setCropHeight(info.height)
      } catch (err) {
        console.error('Failed to get image info:', err)
      }
    }
  }, [])

  const handleCropChange = (newX: number, newY: number, newWidth: number, newHeight: number) => {
    setX(newX)
    setY(newY)
    setCropWidth(newWidth)
    setCropHeight(newHeight)
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
      window.api.image.crop(filePath, outputPath, { x, y, width: cropWidth, height: cropHeight, quality })
    )
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setOutputPath('')
    setOriginalWidth(0)
    setOriginalHeight(0)
    setX(0)
    setY(0)
    setCropWidth(0)
    setCropHeight(0)
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
        <h1 className="text-2xl font-bold text-gray-100 mb-2">{t.image.crop}</h1>
        <p className="text-gray-400">{t.image.cropDesc}</p>
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
              <CropPreview
                file={file}
                x={x}
                y={y}
                cropWidth={cropWidth}
                cropHeight={cropHeight}
                originalWidth={originalWidth}
                originalHeight={originalHeight}
                onCropChange={handleCropChange}
              />

              <div className="card space-y-4">
                <h3 className="font-medium text-gray-200">Crop Region</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">X Position</label>
                    <input
                      type="number"
                      value={x}
                      onChange={(e) => setX(Math.max(0, parseInt(e.target.value) || 0))}
                      className="input-field w-full"
                      min={0}
                      max={originalWidth - 1}
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Y Position</label>
                    <input
                      type="number"
                      value={y}
                      onChange={(e) => setY(Math.max(0, parseInt(e.target.value) || 0))}
                      className="input-field w-full"
                      min={0}
                      max={originalHeight - 1}
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">{t.image.width}</label>
                    <input
                      type="number"
                      value={cropWidth}
                      onChange={(e) => setCropWidth(Math.max(1, parseInt(e.target.value) || 1))}
                      className="input-field w-full"
                      min={1}
                      max={originalWidth - x}
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">{t.image.height}</label>
                    <input
                      type="number"
                      value={cropHeight}
                      onChange={(e) => setCropHeight(Math.max(1, parseInt(e.target.value) || 1))}
                      className="input-field w-full"
                      min={1}
                      max={originalHeight - y}
                      disabled={isProcessing}
                    />
                  </div>
                </div>

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
                  disabled={isProcessing || !outputPath || cropWidth <= 0 || cropHeight <= 0}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {t.image.crop}
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
