import { useState, useCallback } from 'react'
import { Play, Film, FolderOpen, FileVideo, Settings2, Sliders } from 'lucide-react'
import { motion } from 'framer-motion'
import { FileDropZone } from '../shared/FileDropZone'
import { ProcessingStatus } from '../shared/ProcessingStatus'
import { useTask, getDefaultOutputPath } from '@/hooks/useTask'
import { useSettingsStore } from '@/stores/settingsStore'
import { useI18n } from '@/hooks/useI18n'
import { VIDEO_FILTERS, VIDEO_PRESETS, VIDEO_RESOLUTIONS } from '@shared/constants'
import { formatBytes } from '@/lib/utils'

export function VideoCompress(): JSX.Element {
  const t = useI18n()
  const { videoDefaultQuality, videoDefaultPreset } = useSettingsStore()
  const [file, setFile] = useState<File | null>(null)
  const [outputPath, setOutputPath] = useState<string>('')
  const [quality, setQuality] = useState<number>(videoDefaultQuality)
  const [preset, setPreset] = useState<string>(videoDefaultPreset)
  const [resolution, setResolution] = useState<string>('')

  const { isProcessing, progress, error, result, execute, reset } = useTask({
    taskType: 'video:compress'
  })

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0])
      const firstFilePath = window.api.file.getFilePath(files[0])
      setOutputPath(getDefaultOutputPath(firstFilePath, '_compressed'))
    }
  }, [])

  const handleSelectOutput = async () => {
    const path = await window.api.file.saveFile({
      defaultPath: outputPath,
      filters: VIDEO_FILTERS
    })
    if (path) setOutputPath(path)
  }

  const handleProcess = async () => {
    if (!file || !outputPath) return
    const filePath = window.api.file.getFilePath(file)

    const options: { quality: number; preset: string; resolution?: string } = {
      quality,
      preset
    }
    if (resolution) {
      options.resolution = resolution
    }

    await execute(() => window.api.media.videoCompress(filePath, outputPath, options))
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setOutputPath('')
    setQuality(videoDefaultQuality)
    setPreset(videoDefaultPreset)
    setResolution('')
  }

  const handleOpenResult = () => {
    if (result) {
      const dir = result.substring(0, Math.max(result.lastIndexOf('/'), result.lastIndexOf('\\')))
      window.api.file.openPath(dir)
    }
  }

  const getQualityLabel = () => {
    if (quality <= 18) return t.settings.presetVeryslow
    if (quality <= 23) return t.settings.presetSlow
    if (quality <= 28) return t.settings.presetMedium
    if (quality <= 35) return t.settings.presetFast
    return t.settings.presetUltrafast
  }

  const getQualityColor = () => {
    if (quality <= 18) return 'text-green-400'
    if (quality <= 23) return 'text-blue-400'
    if (quality <= 28) return 'text-yellow-400'
    if (quality <= 35) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
          <Film className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{t.media.videoCompress}</h1>
          <p className="text-gray-400 text-sm">{t.media.videoCompressDesc}</p>
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
                  <FileVideo className="w-5 h-5 text-blue-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{file.name}</p>
                  </div>
                  <span className="text-gray-400 text-sm">{formatBytes(file.size)}</span>
                </div>

                {/* Options Section */}
                <div className="p-5 space-y-5">
                  {/* Quality Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{t.settings.qualityCrf}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getQualityColor()}`}>{quality}</span>
                        <span className="text-xs text-gray-500">({getQualityLabel()})</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min={0}
                        max={51}
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                        disabled={isProcessing}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>{t.media.highQuality}</span>
                        <span>{t.media.smallFile}</span>
                      </div>
                    </div>
                  </div>

                  {/* Preset & Resolution Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                        <Settings2 className="w-4 h-4 text-gray-400" />
                        {t.settings.encodingPreset}
                      </label>
                      <select
                        value={preset}
                        onChange={(e) => setPreset(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg text-white text-sm transition-all"
                        style={{ background: 'rgba(50, 50, 55, 0.9)', border: '1px solid rgba(255,255,255,0.12)' }}
                        disabled={isProcessing}
                      >
                        {VIDEO_PRESETS.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                        <FileVideo className="w-4 h-4 text-gray-400" />
                        {t.media.resolution}
                      </label>
                      <select
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg text-white text-sm transition-all"
                        style={{ background: 'rgba(50, 50, 55, 0.9)', border: '1px solid rgba(255,255,255,0.12)' }}
                        disabled={isProcessing}
                      >
                        <option value="">{t.media.keepOriginal}</option>
                        {VIDEO_RESOLUTIONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
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
                    style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                  >
                    <Play className="w-4 h-4" />
                    {t.media.startCompress}
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
