import { useState, useCallback } from 'react'
import { Play, Folder } from 'lucide-react'
import { FileDropZone } from '../shared/FileDropZone'
import { ProcessingStatus } from '../shared/ProcessingStatus'
import { useTask, getOutputDir } from '@/hooks/useTask'
import { useSettingsStore } from '@/stores/settingsStore'

type ImageFormat = 'png' | 'jpg'

export function PdfToImages(): JSX.Element {
  const defaultDpi = useSettingsStore((s) => s.pdfDefaultDpi)
  const [file, setFile] = useState<File | null>(null)
  const [outputDir, setOutputDir] = useState<string>('')
  const [format, setFormat] = useState<ImageFormat>('png')
  const [dpi, setDpi] = useState<number>(defaultDpi)

  const { isProcessing, progress, error, result, execute, reset } = useTask({
    taskType: 'pdf:toImages'
  })

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      const firstFilePath = window.api.file.getFilePath(files[0])
      setOutputDir(getOutputDir(firstFilePath))
    }
  }, [])

  const handleSelectOutputDir = async () => {
    const dir = await window.api.file.openDirectory()
    if (dir) setOutputDir(dir)
  }

  const handleProcess = async () => {
    if (!file || !outputDir) return
    const filePath = window.api.file.getFilePath(file)
    await execute(() => window.api.pdf.toImages(filePath, outputDir, format, dpi))
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setOutputDir('')
    setFormat('png')
    setDpi(defaultDpi)
  }

  const handleOpenResult = () => {
    if (outputDir) {
      window.api.file.openPath(outputDir)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 mb-2">PDF to Images</h1>
        <p className="text-gray-400">Convert PDF pages to image files</p>
      </div>

      {!result && (
        <>
          <FileDropZone
            accept={{ 'application/pdf': ['.pdf'] }}
            onFilesSelected={handleFilesSelected}
            multiple={false}
            disabled={isProcessing}
            hideFileList={true}
          />

          {file && (
            <>
              <div className="card">
                <h3 className="font-medium text-gray-200 mb-4">Selected File</h3>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <span className="flex-1 text-gray-200 truncate">{file.name}</span>
                  <span className="text-gray-500 text-sm">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>

              <div className="card space-y-4">
                <h3 className="font-medium text-gray-200">Export Options</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Image Format</label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as ImageFormat)}
                      className="input-field w-full"
                      disabled={isProcessing}
                    >
                      <option value="png">PNG (Lossless)</option>
                      <option value="jpg">JPG (Smaller files)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Resolution (DPI)</label>
                    <select
                      value={dpi}
                      onChange={(e) => setDpi(parseInt(e.target.value))}
                      className="input-field w-full"
                      disabled={isProcessing}
                    >
                      <option value="72">72 DPI (Screen)</option>
                      <option value="150">150 DPI (Medium)</option>
                      <option value="300">300 DPI (Print)</option>
                      <option value="600">600 DPI (High)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card space-y-4">
                <h3 className="font-medium text-gray-200">Output Directory</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={outputDir}
                    onChange={(e) => setOutputDir(e.target.value)}
                    placeholder="Select output directory..."
                    className="input-field flex-1"
                    disabled={isProcessing}
                  />
                  <button
                    onClick={handleSelectOutputDir}
                    className="btn-secondary flex items-center gap-2"
                    disabled={isProcessing}
                  >
                    <Folder className="w-4 h-4" />
                    Browse
                  </button>
                </div>

                <button
                  onClick={handleProcess}
                  disabled={isProcessing || !outputDir}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Convert to Images
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
