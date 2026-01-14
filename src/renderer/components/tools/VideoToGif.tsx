import { useState, useCallback, useEffect } from 'react'
import { Play, FileVideo, FolderOpen, Image } from 'lucide-react'
import { motion } from 'framer-motion'
import { FileDropZone } from '../shared/FileDropZone'
import { ProcessingStatus } from '../shared/ProcessingStatus'
import { useTask, getDefaultOutputPath } from '@/hooks/useTask'
import { useI18n } from '@/hooks/useI18n'
import { VIDEO_FILTERS } from '@shared/constants'
import { formatBytes } from '@/lib/utils'

interface MediaInfo {
  duration: number
  width?: number
  height?: number
  fps?: number
}

const GIF_WIDTH_OPTIONS = [
  { value: 320, label: '320px', description: 'Small' },
  { value: 480, label: '480px', description: 'Medium' },
  { value: 640, label: '640px', description: 'Large' },
  { value: 800, label: '800px', description: 'X-Large' }
]

const GIF_FPS_OPTIONS = [
  { value: 5, label: '5 FPS', description: 'Smaller file' },
  { value: 10, label: '10 FPS', description: 'Balanced' },
  { value: 15, label: '15 FPS', description: 'Smoother' },
  { value: 20, label: '20 FPS', description: 'High quality' }
]

export function VideoToGif(): JSX.Element {
  const t = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [outputPath, setOutputPath] = useState<string>('')
  const [width, setWidth] = useState<number>(480)
  const [fps, setFps] = useState<number>(10)
  const [startTime, setStartTime] = useState<string>('')
  const [duration, setDuration] = useState<string>('')
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null)

  const { isProcessing, progress, error, result, execute, reset } = useTask({
    taskType: 'video:toGif'
  })

  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      const firstFilePath = window.api.file.getFilePath(files[0])
      setOutputPath(getDefaultOutputPath(firstFilePath, '_gif', 'gif'))

      // Get media info
      try {
        const info = await window.api.media.info(firstFilePath)
        setMediaInfo(info)
      } catch {
        setMediaInfo(null)
      }
    }
  }, [])

  const handleSelectOutput = async () => {
    const path = await window.api.file.saveFile({
      defaultPath: outputPath,
      filters: [{ name: 'GIF Files', extensions: ['gif'] }]
    })
    if (path) setOutputPath(path)
  }

  const parseTime = (timeStr: string): number | undefined => {
    if (!timeStr.trim()) return undefined
    const parts = timeStr.split(':').map(Number)
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
    return parseFloat(timeStr) || undefined
  }

  const handleProcess = async () => {
    if (!file || !outputPath) return
    const filePath = window.api.file.getFilePath(file)

    const options: { fps: number; width: number; startTime?: number; duration?: number } = {
      fps,
      width
    }

    const parsedStart = parseTime(startTime)
    const parsedDuration = parseTime(duration)

    if (parsedStart !== undefined) {
      options.startTime = parsedStart
    }
    if (parsedDuration !== undefined) {
      options.duration = parsedDuration
    }

    await execute(() => window.api.media.videoToGif(filePath, outputPath, options))
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setOutputPath('')
    setWidth(480)
    setFps(10)
    setStartTime('')
    setDuration('')
    setMediaInfo(null)
  }

  const handleOpenResult = () => {
    if (result) {
      const dir = result.substring(0, Math.max(result.lastIndexOf('/'), result.lastIndexOf('\\')))
      window.api.file.openPath(dir)
    }
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
          <Image className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{t.media.videoToGif}</h1>
          <p className="text-gray-400 text-sm">{t.media.videoToGifDesc}</p>
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
                  <FileVideo className="w-5 h-5 text-emerald-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{file.name}</p>
                    {mediaInfo && (
                      <p className="text-gray-500 text-xs mt-0.5">
                        {mediaInfo.width}x{mediaInfo.height} | {formatDuration(mediaInfo.duration)} | {mediaInfo.fps} FPS
                      </p>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">{formatBytes(file.size)}</span>
                </div>

                {/* Options Section */}
                <div className="p-5 space-y-5">
                  {/* Width Selection */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                      {t.media.gifWidth}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {GIF_WIDTH_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setWidth(opt.value)}
                          disabled={isProcessing}
                          className={`p-3 rounded-lg text-center transition-all ${
                            width === opt.value
                              ? 'bg-emerald-500/20 ring-1 ring-emerald-500/50'
                              : 'hover:bg-white/5'
                          }`}
                          style={{ border: width === opt.value ? 'none' : '1px solid rgba(255,255,255,0.1)' }}
                        >
                          <div className={`font-medium text-sm ${width === opt.value ? 'text-emerald-400' : 'text-white'}`}>
                            {opt.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{opt.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* FPS Selection */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                      {t.media.gifFps}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {GIF_FPS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setFps(opt.value)}
                          disabled={isProcessing}
                          className={`p-3 rounded-lg text-center transition-all ${
                            fps === opt.value
                              ? 'bg-emerald-500/20 ring-1 ring-emerald-500/50'
                              : 'hover:bg-white/5'
                          }`}
                          style={{ border: fps === opt.value ? 'none' : '1px solid rgba(255,255,255,0.1)' }}
                        >
                          <div className={`font-medium text-sm ${fps === opt.value ? 'text-emerald-400' : 'text-white'}`}>
                            {opt.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{opt.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Range (Optional) */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                      {t.media.gifTimeRange}
                      <span className="text-gray-500 text-xs">({t.media.optional})</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">{t.media.startTime}</label>
                        <input
                          type="text"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          placeholder="0:00"
                          className="w-full px-3 py-2.5 rounded-lg text-white text-sm"
                          style={{ background: 'rgba(50, 50, 55, 0.9)', border: '1px solid rgba(255,255,255,0.12)' }}
                          disabled={isProcessing}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">{t.media.gifDuration}</label>
                        <input
                          type="text"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          placeholder="5"
                          className="w-full px-3 py-2.5 rounded-lg text-white text-sm"
                          style={{ background: 'rgba(50, 50, 55, 0.9)', border: '1px solid rgba(255,255,255,0.12)' }}
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{t.media.gifTimeHint}</p>
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
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    <Play className="w-4 h-4" />
                    {t.media.startConvert}
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
