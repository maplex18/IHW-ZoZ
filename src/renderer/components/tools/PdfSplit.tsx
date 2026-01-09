import { useState, useCallback } from 'react'
import { Play, Folder } from 'lucide-react'
import { FileDropZone } from '../shared/FileDropZone'
import { ProcessingStatus } from '../shared/ProcessingStatus'
import { useTask, filesToPaths, getOutputDir } from '@/hooks/useTask'

type SplitMode = 'ranges' | 'every'

export function PdfSplit(): JSX.Element {
  const [file, setFile] = useState<File | null>(null)
  const [outputDir, setOutputDir] = useState<string>('')
  const [splitMode, setSplitMode] = useState<SplitMode>('ranges')
  const [ranges, setRanges] = useState<string>('1-3, 4-6')
  const [everyNPages, setEveryNPages] = useState<number>(1)

  const { isProcessing, progress, error, result, execute, reset } = useTask({
    taskType: 'pdf:split'
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

    const options = splitMode === 'ranges'
      ? { ranges }
      : { everyNPages }

    await execute(() => window.api.pdf.split(filePath, outputDir, options))
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setOutputDir('')
  }

  const handleOpenResult = () => {
    if (outputDir) {
      window.api.file.openPath(outputDir)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Split PDF</h1>
        <p className="text-gray-400">Split a PDF into multiple files</p>
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
                <h3 className="font-medium text-gray-200">Split Options</h3>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="splitMode"
                      checked={splitMode === 'ranges'}
                      onChange={() => setSplitMode('ranges')}
                      className="text-primary-500"
                      disabled={isProcessing}
                    />
                    <span className="text-gray-300">By page ranges</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="splitMode"
                      checked={splitMode === 'every'}
                      onChange={() => setSplitMode('every')}
                      className="text-primary-500"
                      disabled={isProcessing}
                    />
                    <span className="text-gray-300">Every N pages</span>
                  </label>
                </div>

                {splitMode === 'ranges' ? (
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">
                      Page ranges (e.g., 1-3, 4-6, 7)
                    </label>
                    <input
                      type="text"
                      value={ranges}
                      onChange={(e) => setRanges(e.target.value)}
                      placeholder="1-3, 4-6, 7-10"
                      className="input-field w-full"
                      disabled={isProcessing}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">
                      Split every N pages
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={everyNPages}
                      onChange={(e) => setEveryNPages(parseInt(e.target.value) || 1)}
                      className="input-field w-32"
                      disabled={isProcessing}
                    />
                  </div>
                )}
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
                  Split PDF
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
