import { useState, useCallback } from 'react'
import { Play, RotateCw, RotateCcw } from 'lucide-react'
import { FileDropZone } from '../shared/FileDropZone'
import { ProcessingStatus } from '../shared/ProcessingStatus'
import { ImagePreview } from '../shared/ImagePreview'
import { useTask, getDefaultOutputPath } from '@/hooks/useTask'
import { IMAGE_FILTERS } from '@shared/constants'
import { useI18n } from '@/hooks/useI18n'

export function ImageRotate(): JSX.Element {
  const t = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [outputPath, setOutputPath] = useState<string>('')
  const [angle, setAngle] = useState<number>(90)
  const [expand, setExpand] = useState<boolean>(true)
  const [quality, setQuality] = useState<number>(95)

  const { isProcessing, progress, error, result, execute, reset } = useTask({
    taskType: 'image:rotate'
  })

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      const filePath = window.api.file.getFilePath(files[0])
      setOutputPath(getDefaultOutputPath(filePath, '_rotated'))
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
    await execute(() =>
      window.api.image.rotate(filePath, outputPath, { angle, expand, quality })
    )
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setOutputPath('')
    setAngle(90)
    setExpand(true)
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
        <h1 className="text-2xl font-bold text-gray-100 mb-2">{t.image.rotate}</h1>
        <p className="text-gray-400">{t.image.rotateDesc}</p>
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
                <h3 className="font-medium text-gray-200">Rotation Options</h3>

                <div>
                  <label className="text-sm text-gray-400 block mb-3">Rotation Angle</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAngle(90)}
                      disabled={isProcessing}
                      className={`flex-1 p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                        angle === 90
                          ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                          : 'border-white/10 hover:border-white/20 text-gray-400'
                      }`}
                    >
                      <RotateCw className="w-6 h-6" />
                      <span>90° CW</span>
                    </button>
                    <button
                      onClick={() => setAngle(180)}
                      disabled={isProcessing}
                      className={`flex-1 p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                        angle === 180
                          ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                          : 'border-white/10 hover:border-white/20 text-gray-400'
                      }`}
                    >
                      <RotateCw className="w-6 h-6" />
                      <span>180°</span>
                    </button>
                    <button
                      onClick={() => setAngle(270)}
                      disabled={isProcessing}
                      className={`flex-1 p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                        angle === 270
                          ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                          : 'border-white/10 hover:border-white/20 text-gray-400'
                      }`}
                    >
                      <RotateCcw className="w-6 h-6" />
                      <span>90° CCW</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Custom Angle</label>
                  <input
                    type="number"
                    value={angle}
                    onChange={(e) => setAngle(parseInt(e.target.value) || 0)}
                    className="input-field w-full"
                    min={-360}
                    max={360}
                    disabled={isProcessing}
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expand}
                    onChange={(e) => setExpand(e.target.checked)}
                    disabled={isProcessing}
                  />
                  <span className="text-gray-300">Expand canvas to fit rotated image</span>
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
                  disabled={isProcessing || !outputPath}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {t.image.rotate}
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
