import { useState, useCallback } from 'react'
import { Play, FileVideo, FileAudio, FolderOpen, AudioLines } from 'lucide-react'
import { motion } from 'framer-motion'
import { FileDropZone } from '../shared/FileDropZone'
import { ProcessingStatus } from '../shared/ProcessingStatus'
import { useTask, getDefaultOutputPath } from '@/hooks/useTask'
import { useSettingsStore } from '@/stores/settingsStore'
import { useI18n } from '@/hooks/useI18n'
import { VIDEO_FILTERS, AUDIO_OUTPUT_FORMATS } from '@shared/constants'
import { formatBytes } from '@/lib/utils'

export function AudioExtract(): JSX.Element {
  const t = useI18n()
  const { audioDefaultFormat } = useSettingsStore()
  const [file, setFile] = useState<File | null>(null)
  const [outputPath, setOutputPath] = useState<string>('')
  const [format, setFormat] = useState<string>(audioDefaultFormat)

  const { isProcessing, progress, error, result, execute, reset } = useTask({
    taskType: 'audio:extract'
  })

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      const firstFilePath = window.api.file.getFilePath(files[0])
      setOutputPath(getDefaultOutputPath(firstFilePath, '_audio', audioDefaultFormat))
    }
  }, [audioDefaultFormat])

  const handleFormatChange = (newFormat: string) => {
    setFormat(newFormat)
    if (file && outputPath) {
      const lastDot = outputPath.lastIndexOf('.')
      if (lastDot !== -1) {
        setOutputPath(outputPath.substring(0, lastDot + 1) + newFormat)
      }
    }
  }

  const handleSelectOutput = async () => {
    const path = await window.api.file.saveFile({
      defaultPath: outputPath,
      filters: [{ name: `${format.toUpperCase()} Files`, extensions: [format] }]
    })
    if (path) setOutputPath(path)
  }

  const handleProcess = async () => {
    if (!file || !outputPath) return
    const filePath = window.api.file.getFilePath(file)
    await execute(() => window.api.media.audioExtract(filePath, outputPath, format))
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setOutputPath('')
    setFormat(audioDefaultFormat)
  }

  const handleOpenResult = () => {
    if (result) {
      const dir = result.substring(0, Math.max(result.lastIndexOf('/'), result.lastIndexOf('\\')))
      window.api.file.openPath(dir)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-pink-500/20 text-pink-400">
          <AudioLines className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{t.media.audioExtract}</h1>
          <p className="text-gray-400 text-sm">{t.media.audioExtractDesc}</p>
        </div>
      </div>

      {!result && (
        <>
          {/* Drop Zone */}
          <FileDropZone
            accept={{ 'video/*': VIDEO_FILTERS[0].extensions.map((e) => `.${e}`) }}
            onFilesSelected={handleFilesSelected}
            multiple={false}
            disabled={isProcessing}
            hideFileList={true}
          />

          {file && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Main Options Card */}
              <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: 'rgba(35, 35, 40, 0.95)' }}>
                {/* Selected File Header */}
                <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
                  <FileVideo className="w-5 h-5 text-pink-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{file.name}</p>
                  </div>
                  <span className="text-gray-400 text-sm">{formatBytes(file.size)}</span>
                </div>

                {/* Options Section */}
                <div className="p-5 space-y-5">
                  {/* Format Selection */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                      <FileAudio className="w-4 h-4 text-gray-400" />
                      {t.media.outputFormat}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {AUDIO_OUTPUT_FORMATS.slice(0, 8).map((f) => (
                        <button
                          key={f.value}
                          onClick={() => handleFormatChange(f.value)}
                          disabled={isProcessing}
                          className={`p-2.5 rounded-lg text-center transition-all ${
                            format === f.value
                              ? 'bg-pink-500/20 ring-1 ring-pink-500/50'
                              : 'hover:bg-white/5'
                          }`}
                          style={{ border: format === f.value ? 'none' : '1px solid rgba(255,255,255,0.1)' }}
                        >
                          <div className={`font-medium text-sm ${format === f.value ? 'text-pink-400' : 'text-white'}`}>
                            {f.label}
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {AUDIO_OUTPUT_FORMATS.find((f) => f.value === format)?.description}
                    </p>
                  </div>

                  {/* Output Path */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                      <FolderOpen className="w-4 h-4 text-gray-400" />
                      {t.media.outputPath}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={outputPath}
                        onChange={(e) => setOutputPath(e.target.value)}
                        placeholder={t.media.outputPath}
                        className="flex-1 px-3 py-2.5 rounded-lg text-white text-sm truncate"
                        style={{ background: 'rgba(50, 50, 55, 0.9)', border: '1px solid rgba(255,255,255,0.12)' }}
                        disabled={isProcessing}
                      />
                      <button
                        onClick={handleSelectOutput}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:bg-white/20"
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                        disabled={isProcessing}
                      >
                        {t.media.browse}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-5 pb-5">
                  <button
                    onClick={handleProcess}
                    disabled={isProcessing || !outputPath}
                    className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}
                  >
                    <Play className="w-4 h-4" />
                    {t.media.startExtract}
                  </button>
                </div>
              </div>
            </motion.div>
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
