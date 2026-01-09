import { useState, useCallback } from 'react'
import { Play, RotateCw, RotateCcw } from 'lucide-react'
import { FileDropZone } from '../shared/FileDropZone'
import { ProcessingStatus } from '../shared/ProcessingStatus'
import { useTask, getDefaultOutputPath } from '@/hooks/useTask'
import { PDF_FILTERS } from '@shared/constants'

type RotationAngle = 90 | 180 | 270

export function PdfRotate(): JSX.Element {
  const [file, setFile] = useState<File | null>(null)
  const [outputPath, setOutputPath] = useState<string>('')
  const [angle, setAngle] = useState<RotationAngle>(90)
  const [pageMode, setPageMode] = useState<'all' | 'specific'>('all')
  const [specificPages, setSpecificPages] = useState<string>('')

  const { isProcessing, progress, error, result, execute, reset } = useTask({
    taskType: 'pdf:rotate'
  })

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      const firstFilePath = window.api.file.getFilePath(files[0])
      setOutputPath(getDefaultOutputPath(firstFilePath, '_rotated'))
    }
  }, [])

  const handleSelectOutput = async () => {
    const path = await window.api.file.saveFile({
      defaultPath: outputPath,
      filters: PDF_FILTERS
    })
    if (path) setOutputPath(path)
  }

  const handleProcess = async () => {
    if (!file || !outputPath) return
    const filePath = window.api.file.getFilePath(file)

    let pages: number[] | undefined
    if (pageMode === 'specific' && specificPages) {
      // Parse page numbers like "1, 3, 5-7" into array
      pages = []
      const parts = specificPages.split(',').map((s) => s.trim())
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map((n) => parseInt(n.trim()))
          for (let i = start; i <= end; i++) {
            pages.push(i)
          }
        } else {
          pages.push(parseInt(part))
        }
      }
    }

    await execute(() => window.api.pdf.rotate(filePath, outputPath, angle, pages))
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setOutputPath('')
    setAngle(90)
    setPageMode('all')
    setSpecificPages('')
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
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Rotate PDF</h1>
        <p className="text-gray-400">Rotate PDF pages to any angle</p>
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
                  <label className="text-sm text-gray-400 block mb-2">Pages to Rotate</label>
                  <div className="flex gap-4 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pageMode"
                        checked={pageMode === 'all'}
                        onChange={() => setPageMode('all')}
                        disabled={isProcessing}
                      />
                      <span className="text-gray-300">All pages</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pageMode"
                        checked={pageMode === 'specific'}
                        onChange={() => setPageMode('specific')}
                        disabled={isProcessing}
                      />
                      <span className="text-gray-300">Specific pages</span>
                    </label>
                  </div>
                  {pageMode === 'specific' && (
                    <input
                      type="text"
                      value={specificPages}
                      onChange={(e) => setSpecificPages(e.target.value)}
                      placeholder="e.g., 1, 3, 5-7"
                      className="input-field w-full"
                      disabled={isProcessing}
                    />
                  )}
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
                    Browse
                  </button>
                </div>

                <button
                  onClick={handleProcess}
                  disabled={isProcessing || !outputPath}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Rotate PDF
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
