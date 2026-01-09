import { useState, useCallback } from 'react'
import { Play } from 'lucide-react'
import { FileDropZone } from '../shared/FileDropZone'
import { ProcessingStatus } from '../shared/ProcessingStatus'
import { useTask, getDefaultOutputPath } from '@/hooks/useTask'
import { PDF_FILTERS } from '@shared/constants'

const OCR_LANGUAGES = [
  { value: 'eng', label: 'English' },
  { value: 'chi_tra', label: '繁體中文' },
  { value: 'chi_sim', label: '简体中文' },
  { value: 'jpn', label: '日本語' },
  { value: 'kor', label: '한국어' },
  { value: 'fra', label: 'Français' },
  { value: 'deu', label: 'Deutsch' },
  { value: 'spa', label: 'Español' },
  { value: 'por', label: 'Português' },
  { value: 'rus', label: 'Русский' },
  { value: 'ara', label: 'العربية' },
  { value: 'tha', label: 'ไทย' },
  { value: 'vie', label: 'Tiếng Việt' }
]

export function PdfOcr(): JSX.Element {
  const [file, setFile] = useState<File | null>(null)
  const [outputPath, setOutputPath] = useState<string>('')
  const [language, setLanguage] = useState<string>('eng')

  const { isProcessing, progress, error, result, execute, reset } = useTask({
    taskType: 'pdf:ocr'
  })

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      const firstFilePath = window.api.file.getFilePath(files[0])
      setOutputPath(getDefaultOutputPath(firstFilePath, '_ocr'))
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
    await execute(() => window.api.pdf.ocr(filePath, outputPath, language))
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setOutputPath('')
    setLanguage('eng')
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
        <h1 className="text-2xl font-bold text-gray-100 mb-2">OCR</h1>
        <p className="text-gray-400">Extract text from scanned PDF using optical character recognition</p>
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
                <h3 className="font-medium text-gray-200">OCR Options</h3>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Document Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="input-field w-full"
                    disabled={isProcessing}
                  >
                    {OCR_LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Select the primary language of the document for better accuracy
                  </p>
                </div>

                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <p className="text-blue-400 text-sm">
                    OCR works best with scanned documents. Processing time depends on the number of pages.
                  </p>
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
                  Start OCR
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
