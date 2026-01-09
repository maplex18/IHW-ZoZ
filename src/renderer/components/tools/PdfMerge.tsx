import { useState, useCallback } from 'react'
import { ArrowUp, ArrowDown, Trash2, Play } from 'lucide-react'
import { FileDropZone } from '../shared/FileDropZone'
import { ProcessingStatus } from '../shared/ProcessingStatus'
import { useTask, filesToPaths, getDefaultOutputPath } from '@/hooks/useTask'
import { PDF_FILTERS } from '@shared/constants'

export function PdfMerge(): JSX.Element {
  const [files, setFiles] = useState<File[]>([])
  const [outputPath, setOutputPath] = useState<string>('')

  const { isProcessing, progress, error, result, execute, reset } = useTask({
    taskType: 'pdf:merge'
  })

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    // FileDropZone already accumulates files, so just use the new list directly
    setFiles(newFiles)
    // Set default output path based on first file
    if (newFiles.length > 0 && !outputPath) {
      const firstFilePath = window.api.file.getFilePath(newFiles[0])
      setOutputPath(getDefaultOutputPath(firstFilePath, '_merged'))
    }
  }, [outputPath])

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex >= 0 && newIndex < files.length) {
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]]
      setFiles(newFiles)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSelectOutput = async () => {
    const path = await window.api.file.saveFile({
      defaultPath: outputPath,
      filters: PDF_FILTERS
    })
    if (path) setOutputPath(path)
  }

  const handleProcess = async () => {
    if (files.length < 2 || !outputPath) return
    const paths = filesToPaths(files)
    await execute(() => window.api.pdf.merge(paths, outputPath))
  }

  const handleReset = () => {
    reset()
    setFiles([])
    setOutputPath('')
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
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Merge PDF</h1>
        <p className="text-gray-400">Combine multiple PDF files into one document</p>
      </div>

      {!result && (
        <>
          <FileDropZone
            accept={{ 'application/pdf': ['.pdf'] }}
            onFilesSelected={handleFilesSelected}
            multiple={true}
            disabled={isProcessing}
            hideFileList={true}
          />

          {files.length > 0 && (
            <div className="card">
              <h3 className="font-medium text-gray-200 mb-4">
                Files to merge ({files.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                  >
                    <span className="text-gray-500 w-6 text-center">{index + 1}</span>
                    <span className="flex-1 text-gray-200 truncate">{file.name}</span>
                    <span className="text-gray-500 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveFile(index, 'up')}
                        disabled={index === 0 || isProcessing}
                        className="p-1.5 hover:bg-white/10 rounded disabled:opacity-30"
                      >
                        <ArrowUp className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => moveFile(index, 'down')}
                        disabled={index === files.length - 1 || isProcessing}
                        className="p-1.5 hover:bg-white/10 rounded disabled:opacity-30"
                      >
                        <ArrowDown className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => removeFile(index)}
                        disabled={isProcessing}
                        className="p-1.5 hover:bg-red-500/20 rounded disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.length >= 2 && (
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
                Merge PDFs
              </button>
            </div>
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
