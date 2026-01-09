import { useState, useCallback } from 'react'
import { Play, FlipHorizontal, FlipVertical } from 'lucide-react'
import { FileDropZone } from '../shared/FileDropZone'
import { ProcessingStatus } from '../shared/ProcessingStatus'
import { ImagePreview } from '../shared/ImagePreview'
import { useTask, getDefaultOutputPath } from '@/hooks/useTask'
import { IMAGE_FILTERS } from '@shared/constants'
import { useI18n } from '@/hooks/useI18n'

export function ImageFlip(): JSX.Element {
  const t = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [outputPath, setOutputPath] = useState<string>('')
  const [horizontal, setHorizontal] = useState<boolean>(true)
  const [quality, setQuality] = useState<number>(95)

  const { isProcessing, progress, error, result, execute, reset } = useTask({
    taskType: 'image:flip'
  })

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      const filePath = window.api.file.getFilePath(files[0])
      setOutputPath(getDefaultOutputPath(filePath, '_flipped'))
    }
  }, [])

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
    await execute(() => window.api.image.flip(filePath, outputPath, { horizontal, quality }))
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setOutputPath('')
    setHorizontal(true)
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
        <h1 className="text-2xl font-bold text-gray-100 mb-2">{t.image.flip}</h1>
        <p className="text-gray-400">{t.image.flipDesc}</p>
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
              <ImagePreview file={file} maxHeight="250px" />

              <div className="card space-y-4">
                <h3 className="font-medium text-gray-200">Flip Direction</h3>

                <div className="flex gap-3">
                  <button
                    onClick={() => setHorizontal(true)}
                    disabled={isProcessing}
                    className={`flex-1 p-4 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                      horizontal
                        ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                        : 'border-white/10 hover:border-white/20 text-gray-400'
                    }`}
                  >
                    <FlipHorizontal className="w-8 h-8" />
                    <span>{t.image.flipHorizontal}</span>
                  </button>
                  <button
                    onClick={() => setHorizontal(false)}
                    disabled={isProcessing}
                    className={`flex-1 p-4 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                      !horizontal
                        ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                        : 'border-white/10 hover:border-white/20 text-gray-400'
                    }`}
                  >
                    <FlipVertical className="w-8 h-8" />
                    <span>{t.image.flipVertical}</span>
                  </button>
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
                  disabled={isProcessing || !outputPath}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {t.image.flip}
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
