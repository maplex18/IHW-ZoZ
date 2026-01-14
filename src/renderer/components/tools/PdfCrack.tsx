import { useState, useCallback } from 'react'
import { Play, Key } from 'lucide-react'
import { FileDropZone } from '../shared/FileDropZone'
import { ProcessingStatus } from '../shared/ProcessingStatus'
import { useTask, getDefaultOutputPath } from '@/hooks/useTask'
import { PDF_FILTERS } from '@shared/constants'
import { useI18n } from '@/hooks/useI18n'

type CrackMethod = 'dictionary' | 'bruteforce' | 'custom'
type Charset = 'digits' | 'lowercase' | 'uppercase' | 'alphanumeric'

interface CrackResult {
  success: boolean
  password: string | null
  message: string
  outputPath: string | null
}

export function PdfCrack(): JSX.Element {
  const t = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [outputPath, setOutputPath] = useState<string>('')
  const [method, setMethod] = useState<CrackMethod>('dictionary')
  const [maxLength, setMaxLength] = useState<number>(4)
  const [charset, setCharset] = useState<Charset>('digits')
  const [customPasswords, setCustomPasswords] = useState<string>('')
  const [foundPassword, setFoundPassword] = useState<string | null>(null)
  const [crackResult, setCrackResult] = useState<CrackResult | null>(null)

  const { isProcessing, progress, error, execute, reset } = useTask({
    taskType: 'pdf:crack'
  })

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      const firstFilePath = window.api.file.getFilePath(files[0])
      setOutputPath(getDefaultOutputPath(firstFilePath, '_cracked'))
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

    const options: {
      method: CrackMethod
      maxLength?: number
      charset?: Charset
      customPasswords?: string[]
    } = { method }

    if (method === 'bruteforce') {
      options.maxLength = maxLength
      options.charset = charset
    } else if (method === 'custom') {
      options.customPasswords = customPasswords
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    }

    const result = await execute(() =>
      window.api.pdf.crack(filePath, outputPath, options)
    )

    if (result) {
      setCrackResult(result)
      if (result.success && result.password) {
        setFoundPassword(result.password)
      }
    }
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setOutputPath('')
    setFoundPassword(null)
    setCustomPasswords('')
    setCrackResult(null)
  }

  const handleOpenResult = () => {
    if (crackResult?.outputPath) {
      const dir = crackResult.outputPath.substring(
        0,
        Math.max(crackResult.outputPath.lastIndexOf('/'), crackResult.outputPath.lastIndexOf('\\'))
      )
      window.api.file.openPath(dir)
    }
  }

  const canProcess = file && outputPath && (method !== 'custom' || customPasswords.trim().length > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 mb-2">{t.pdf.crack}</h1>
        <p className="text-gray-400">{t.pdf.crackDesc}</p>
      </div>

      {!crackResult && (
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
                <h3 className="font-medium text-gray-200 mb-4">{t.pdf.crackSelectedFile}</h3>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <span className="flex-1 text-gray-200 truncate">{file.name}</span>
                  <span className="text-gray-500 text-sm">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>

              <div className="card space-y-4">
                <h3 className="font-medium text-gray-200">{t.pdf.crackMethod}</h3>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('dictionary')}
                    className={`p-3 rounded-lg border transition-colors ${
                      method === 'dictionary'
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                    }`}
                    disabled={isProcessing}
                  >
                    <div className="font-medium">{t.pdf.crackDictionary}</div>
                    <div className="text-xs text-gray-400 mt-1">{t.pdf.crackDictionaryDesc}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('bruteforce')}
                    className={`p-3 rounded-lg border transition-colors ${
                      method === 'bruteforce'
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                    }`}
                    disabled={isProcessing}
                  >
                    <div className="font-medium">{t.pdf.crackBruteforce}</div>
                    <div className="text-xs text-gray-400 mt-1">{t.pdf.crackBruteforceDesc}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('custom')}
                    className={`p-3 rounded-lg border transition-colors ${
                      method === 'custom'
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                    }`}
                    disabled={isProcessing}
                  >
                    <div className="font-medium">{t.pdf.crackCustom}</div>
                    <div className="text-xs text-gray-400 mt-1">{t.pdf.crackCustomDesc}</div>
                  </button>
                </div>

                {method === 'bruteforce' && (
                  <div className="space-y-4 p-4 bg-white/5 rounded-lg">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">
                        {t.pdf.crackMaxLength}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="6"
                        value={maxLength}
                        onChange={(e) => setMaxLength(parseInt(e.target.value))}
                        className="w-full"
                        disabled={isProcessing}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1</span>
                        <span className="text-purple-400">{maxLength}</span>
                        <span>6</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 block mb-2">{t.pdf.crackCharset}</label>
                      <select
                        value={charset}
                        onChange={(e) => setCharset(e.target.value as Charset)}
                        className="input-field w-full"
                        disabled={isProcessing}
                      >
                        <option value="digits">{t.pdf.crackDigits}</option>
                        <option value="lowercase">{t.pdf.crackLowercase}</option>
                        <option value="uppercase">{t.pdf.crackUppercase}</option>
                        <option value="alphanumeric">{t.pdf.crackAlphanumeric}</option>
                      </select>
                    </div>

                    <div className="text-xs text-yellow-400/80 bg-yellow-500/10 p-2 rounded">
                      {t.pdf.crackWarning}
                    </div>
                  </div>
                )}

                {method === 'custom' && (
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 block">{t.pdf.crackCustomList}</label>
                    <textarea
                      value={customPasswords}
                      onChange={(e) => setCustomPasswords(e.target.value)}
                      placeholder={t.pdf.crackCustomPlaceholder}
                      className="input-field w-full h-32 resize-none font-mono text-sm"
                      disabled={isProcessing}
                    />
                  </div>
                )}
              </div>

              <div className="card space-y-4">
                <h3 className="font-medium text-gray-200">{t.pdf.crackOutput}</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={outputPath}
                    onChange={(e) => setOutputPath(e.target.value)}
                    placeholder={t.pdf.crackOutputPlaceholder}
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
                  disabled={isProcessing || !canProcess}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {t.pdf.crackStart}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {foundPassword && crackResult?.success && (
        <div className="card bg-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-green-400" />
            <div>
              <h3 className="font-medium text-green-300">{t.pdf.crackFound}</h3>
              <p className="text-green-200 font-mono text-lg mt-1">{foundPassword}</p>
            </div>
          </div>
        </div>
      )}

      <ProcessingStatus
        isProcessing={isProcessing}
        progress={progress}
        error={error}
        result={crackResult?.success ? crackResult.outputPath : null}
        onOpenResult={handleOpenResult}
        onReset={handleReset}
      />
    </div>
  )
}
