import { useState, useCallback } from 'react'
import { Play, ZoomIn } from 'lucide-react'
import { FileDropZone } from '../shared/FileDropZone'
import { ProcessingStatus } from '../shared/ProcessingStatus'
import { ImagePreview } from '../shared/ImagePreview'
import { useTask, getDefaultOutputPath } from '@/hooks/useTask'
import { IMAGE_FILTERS } from '@shared/constants'
import { useI18n } from '@/hooks/useI18n'

export function ImageEnlarger(): JSX.Element {
  const t = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [outputPath, setOutputPath] = useState<string>('')
  const [originalWidth, setOriginalWidth] = useState<number>(0)
  const [originalHeight, setOriginalHeight] = useState<number>(0)
  const [scaleFactor, setScaleFactor] = useState<number>(2)
  const [quality, setQuality] = useState<number>(95)

  const { isProcessing, progress, error, result, execute, reset } = useTask({
    taskType: 'image:enlarge'
  })

  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0]
      setFile(selectedFile)
      const filePath = window.api.file.getFilePath(selectedFile)
      setOutputPath(getDefaultOutputPath(filePath, `_${scaleFactor}x`))

      try {
        const info = await window.api.image.info(filePath) as { width: number; height: number }
        setOriginalWidth(info.width)
        setOriginalHeight(info.height)
      } catch (err) {
        console.error('Failed to get image info:', err)
      }
    }
  }, [scaleFactor])

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
      window.api.image.enlarge(filePath, outputPath, { scaleFactor, quality })
    )
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setOutputPath('')
    setOriginalWidth(0)
    setOriginalHeight(0)
    setScaleFactor(2)
    setQuality(95)
  }

  const handleOpenResult = () => {
    if (result) {
      const dir = result.substring(0, Math.max(result.lastIndexOf('/'), result.lastIndexOf('\\')))
      window.api.file.openPath(dir)
    }
  }

  const newWidth = originalWidth * scaleFactor
  const newHeight = originalHeight * scaleFactor

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 mb-2">{t.image.enlarger}</h1>
        <p className="text-gray-400">{t.image.enlargerDesc}</p>
      </div>

      {!result && (
        <>
          <FileDropZone
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp'] }}
            onFilesSelected={handleFilesSelected}
            multiple={false}
            disabled={isProcessing}
            hideFileList={true}
          />

          {file && (
            <>
              <ImagePreview file={file} maxHeight="250px" />

              <div className="card space-y-4">
                <h3 className="font-medium text-gray-200">{t.image.scaleFactor}</h3>

                <div className="flex gap-3">
                  {[2, 3, 4].map((factor) => (
                    <button
                      key={factor}
                      onClick={() => setScaleFactor(factor)}
                      disabled={isProcessing}
                      className={`flex-1 p-4 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                        scaleFactor === factor
                          ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                          : 'border-white/10 hover:border-white/20 text-gray-400'
                      }`}
                    >
                      <ZoomIn className="w-6 h-6" />
                      <span className="text-lg font-semibold">{factor}x</span>
                    </button>
                  ))}
                </div>

                {originalWidth > 0 && (
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Output Size</div>
                    <div className="text-gray-200">
                      {newWidth} x {newHeight} pixels
                    </div>
                  </div>
                )}

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
                  disabled={isProcessing || !outputPath}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {t.image.enlarger}
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
