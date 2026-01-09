import { useState, useCallback } from 'react'
import { Play, Clock, FolderOpen, Scissors, FileVideo, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import { FileDropZone } from '../shared/FileDropZone'
import { ProcessingStatus } from '../shared/ProcessingStatus'
import { useTask, getDefaultOutputPath } from '@/hooks/useTask'
import { useI18n } from '@/hooks/useI18n'
import { VIDEO_FILTERS, AUDIO_FILTERS } from '@shared/constants'
import { MediaInfo } from '@shared/types'
import { formatBytes } from '@/lib/utils'

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

function parseTime(timeStr: string): number {
  const parts = timeStr.split(':')
  let seconds = 0

  if (parts.length === 3) {
    // HH:MM:SS.mmm
    seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2])
  } else if (parts.length === 2) {
    // MM:SS.mmm
    seconds = parseInt(parts[0]) * 60 + parseFloat(parts[1])
  } else {
    seconds = parseFloat(parts[0]) || 0
  }

  return seconds
}

export function MediaTrim(): JSX.Element {
  const t = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [outputPath, setOutputPath] = useState<string>('')
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null)
  const [startTime, setStartTime] = useState<string>('00:00.000')
  const [endTime, setEndTime] = useState<string>('00:00.000')
  const [isLoadingInfo, setIsLoadingInfo] = useState(false)

  const { isProcessing, progress, error, result, execute, reset } = useTask({
    taskType: 'video:trim'
  })

  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0]
      setFile(selectedFile)
      const firstFilePath = window.api.file.getFilePath(selectedFile)
      setOutputPath(getDefaultOutputPath(firstFilePath, '_trimmed'))

      // Get media info
      setIsLoadingInfo(true)
      try {
        const info = await window.api.media.info(firstFilePath)
        setMediaInfo(info)
        setStartTime('00:00.000')
        setEndTime(formatTime(info.duration))
      } catch (err) {
        console.error('Failed to get media info:', err)
      } finally {
        setIsLoadingInfo(false)
      }
    }
  }, [])

  const handleSelectOutput = async () => {
    const ext = file?.name.split('.').pop() || 'mp4'
    const isVideo = VIDEO_FILTERS[0].extensions.includes(ext.toLowerCase())
    const filters = isVideo ? VIDEO_FILTERS : AUDIO_FILTERS

    const path = await window.api.file.saveFile({
      defaultPath: outputPath,
      filters
    })
    if (path) setOutputPath(path)
  }

  const handleProcess = async () => {
    if (!file || !outputPath) return
    const filePath = window.api.file.getFilePath(file)

    const start = parseTime(startTime)
    const end = parseTime(endTime)

    await execute(() => window.api.media.trim(filePath, outputPath, start, end))
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setOutputPath('')
    setMediaInfo(null)
    setStartTime('00:00.000')
    setEndTime('00:00.000')
  }

  const handleOpenResult = () => {
    if (result) {
      const dir = result.substring(0, Math.max(result.lastIndexOf('/'), result.lastIndexOf('\\')))
      window.api.file.openPath(dir)
    }
  }

  const duration = mediaInfo?.duration || 0
  const startSeconds = parseTime(startTime)
  const endSeconds = parseTime(endTime)
  const trimDuration = Math.max(0, endSeconds - startSeconds)
  const isValid = startSeconds < endSeconds && endSeconds <= duration

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400">
          <Scissors className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{t.media.trim}</h1>
          <p className="text-gray-400 text-sm">{t.media.trimDesc}</p>
        </div>
      </div>

      {!result && (
        <>
          {/* Drop Zone */}
          <FileDropZone
            accept={{
              'video/*': VIDEO_FILTERS[0].extensions.map((e) => `.${e}`),
              'audio/*': AUDIO_FILTERS[0].extensions.map((e) => `.${e}`)
            }}
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
                  <FileVideo className="w-5 h-5 text-rose-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{file.name}</p>
                  </div>
                  <span className="text-gray-400 text-sm">{formatBytes(file.size)}</span>
                </div>

                {/* Media Info */}
                {isLoadingInfo && (
                  <div className="px-5 py-4 border-b border-white/10">
                    <p className="text-gray-500 text-sm">{t.app.processing}</p>
                  </div>
                )}

                {mediaInfo && (
                  <div className="px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">{t.media.duration}:</span>
                        <span className="text-gray-300">{formatTime(mediaInfo.duration)}</span>
                      </div>
                      {mediaInfo.width && mediaInfo.height && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">{t.media.resolution}:</span>
                          <span className="text-gray-300">{mediaInfo.width}x{mediaInfo.height}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{t.media.format}:</span>
                        <span className="text-gray-300">{mediaInfo.format}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Options Section */}
                {mediaInfo && (
                  <div className="p-5 space-y-5">
                    {/* Trim Range */}
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {t.media.trimRange}
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1.5">{t.media.startTime}</label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                              type="text"
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              placeholder="00:00.000"
                              className="w-full px-3 py-2.5 pl-10 rounded-lg text-white text-sm"
                              style={{ background: 'rgba(50, 50, 55, 0.9)', border: '1px solid rgba(255,255,255,0.12)' }}
                              disabled={isProcessing}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1.5">{t.media.endTime}</label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                              type="text"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              placeholder="00:00.000"
                              className="w-full px-3 py-2.5 pl-10 rounded-lg text-white text-sm"
                              style={{ background: 'rgba(50, 50, 55, 0.9)', border: '1px solid rgba(255,255,255,0.12)' }}
                              disabled={isProcessing}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Duration Preview */}
                      <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(50, 50, 55, 0.6)' }}>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{t.media.outputDuration}</span>
                          <span className={isValid ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                            {isValid ? formatTime(trimDuration) : t.media.invalidRange}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        {t.media.timeFormatHint}
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
                )}

                {/* Action Button */}
                {mediaInfo && (
                  <div className="px-5 pb-5">
                    <button
                      onClick={handleProcess}
                      disabled={isProcessing || !outputPath || !isValid}
                      className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
                    >
                      <Play className="w-4 h-4" />
                      {t.media.startTrim}
                    </button>
                  </div>
                )}
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
