import { useState, useCallback } from 'react'
import { Play, Eye, EyeOff } from 'lucide-react'
import { FileDropZone } from '../shared/FileDropZone'
import { ProcessingStatus } from '../shared/ProcessingStatus'
import { useTask, getDefaultOutputPath } from '@/hooks/useTask'
import { PDF_FILTERS } from '@shared/constants'

export function PdfDecrypt(): JSX.Element {
  const [file, setFile] = useState<File | null>(null)
  const [outputPath, setOutputPath] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const { isProcessing, progress, error, result, execute, reset } = useTask({
    taskType: 'pdf:decrypt'
  })

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      const firstFilePath = window.api.file.getFilePath(files[0])
      setOutputPath(getDefaultOutputPath(firstFilePath, '_decrypted'))
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
    if (!file || !outputPath || !password) return
    const filePath = window.api.file.getFilePath(file)
    await execute(() => window.api.pdf.decrypt(filePath, outputPath, password))
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setOutputPath('')
    setPassword('')
  }

  const handleOpenResult = () => {
    if (result) {
      const dir = result.substring(0, Math.max(result.lastIndexOf('/'), result.lastIndexOf('\\')))
      window.api.file.openPath(dir)
    }
  }

  const canProcess = file && outputPath && password

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Decrypt PDF</h1>
        <p className="text-gray-400">Remove password protection from PDF</p>
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
                <h3 className="font-medium text-gray-200">Password</h3>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">
                    Enter the PDF password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter current password..."
                      className="input-field w-full pr-10"
                      disabled={isProcessing}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
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
                    Browse
                  </button>
                </div>

                <button
                  onClick={handleProcess}
                  disabled={isProcessing || !canProcess}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Decrypt PDF
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
