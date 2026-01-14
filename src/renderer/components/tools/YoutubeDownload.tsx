import { useState, useEffect, useRef } from 'react'
import { Youtube, Play, FolderOpen, Wifi, WifiOff, Music, Film, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useI18n } from '@/hooks/useI18n'
import { toast } from '@/stores/toastStore'

interface VideoFormat {
  format_id: string
  type: string
  resolution: string
  height: number
  ext: string
  filesize: number | null
  vcodec: string
  acodec: string
}

interface VideoInfo {
  title: string
  description: string
  duration: number
  thumbnail: string
  uploader: string
  upload_date: string
  view_count: number
  formats: VideoFormat[]
  url: string
}

const VIDEO_FORMATS = [
  { value: 'mp4', label: 'MP4', description: 'Most compatible' },
  { value: 'webm', label: 'WebM', description: 'Web optimized' },
  { value: 'mkv', label: 'MKV', description: 'High quality container' },
  { value: 'mov', label: 'MOV', description: 'Apple QuickTime' },
  { value: 'avi', label: 'AVI', description: 'Legacy format' }
]

const AUDIO_FORMATS = [
  { value: 'mp3', label: 'MP3', description: 'Most compatible' },
  { value: 'm4a', label: 'M4A', description: 'Apple devices' },
  { value: 'wav', label: 'WAV', description: 'Lossless' },
  { value: 'flac', label: 'FLAC', description: 'Lossless compressed' },
  { value: 'aac', label: 'AAC', description: 'High quality' },
  { value: 'opus', label: 'Opus', description: 'Modern codec' }
]

export function YoutubeDownload(): JSX.Element {
  const t = useI18n()

  // State
  const [url, setUrl] = useState('')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [isLoadingInfo, setIsLoadingInfo] = useState(false)
  const [infoError, setInfoError] = useState<string | null>(null)
  const [isNetworkConnected, setIsNetworkConnected] = useState<boolean | null>(null)
  const [outputPath, setOutputPath] = useState('')
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false)
  const [thumbnailError, setThumbnailError] = useState(false)

  // Options
  const [resolution, setResolution] = useState<string>('')
  const [videoFormat, setVideoFormat] = useState('mp4')
  const [audioOnly, setAudioOnly] = useState(false)
  const [audioFormat, setAudioFormat] = useState('mp3')

  // Get available resolutions from video info
  const availableResolutions = videoInfo?.formats
    ?.filter(f => f.type === 'video' && f.height)
    ?.sort((a, b) => b.height - a.height)
    ?.map(f => f.resolution) || []

  // Download state (custom instead of useTask for better progress tracking)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Check network on mount
  useEffect(() => {
    checkNetwork()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  const checkNetwork = async () => {
    try {
      const status = await window.api.download.checkNetwork()
      setIsNetworkConnected(status.connected)
    } catch {
      setIsNetworkConnected(false)
    }
  }

  // Fetch video info
  const handleFetchInfo = async () => {
    if (!url.trim()) return

    setIsLoadingInfo(true)
    setVideoInfo(null)
    setInfoError(null)
    setThumbnailLoaded(false)
    setThumbnailError(false)

    try {
      const info = await window.api.download.getVideoInfo(url)
      setVideoInfo(info)

      // Set default resolution to highest available (prefer 1080p or lower for faster download)
      if (info.formats && info.formats.length > 0) {
        const videoFormats = info.formats
          .filter((f: VideoFormat) => f.type === 'video' && f.height)
          .sort((a: VideoFormat, b: VideoFormat) => b.height - a.height)

        // Prefer 1080p if available, otherwise use highest
        const preferred = videoFormats.find((f: VideoFormat) => f.height === 1080)
        const defaultRes = preferred ? preferred.resolution : videoFormats[0]?.resolution
        if (defaultRes) {
          setResolution(defaultRes)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch video info'
      setInfoError(errorMessage)
      toast.error('無法獲取影片資訊', errorMessage)
    } finally {
      setIsLoadingInfo(false)
    }
  }

  const handleSelectOutput = async () => {
    const path = await window.api.file.openDirectory()
    if (path) setOutputPath(path)
  }

  const handleDownload = async () => {
    if (!videoInfo || !outputPath) return

    setIsProcessing(true)
    setProgress(0)
    setProgressMessage('')
    setError(null)
    setResult(null)

    // Subscribe to progress events
    unsubscribeRef.current = window.api.events.onProgress((data) => {
      setProgress(data.progress)
      if (data.message) {
        setProgressMessage(data.message)
      }
    })

    try {
      const downloadResult = await window.api.download.download(url, outputPath, {
        resolution,
        format: audioOnly ? audioFormat : videoFormat,
        audioOnly,
        audioFormat
      })
      setResult(downloadResult.outputPath)
      setProgress(100)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed'
      setError(errorMessage)
      toast.error('下載失敗', errorMessage)
    } finally {
      setIsProcessing(false)
      // Unsubscribe from progress events
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }

  const handleReset = () => {
    setIsProcessing(false)
    setProgress(0)
    setProgressMessage('')
    setError(null)
    setResult(null)
    setUrl('')
    setVideoInfo(null)
    setOutputPath('')
    setInfoError(null)
    setResolution('')
    setAudioOnly(false)
  }

  const handleOpenResult = () => {
    if (outputPath) {
      window.api.file.openPath(outputPath)
    }
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Extract video ID from YouTube URL and construct thumbnail URL
  const getThumbnailUrl = (youtubeUrl: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/
    ]
    for (const pattern of patterns) {
      const match = youtubeUrl.match(pattern)
      if (match && match[1]) {
        // Use img.youtube.com which has less restrictions
        return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
      }
    }
    return null
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-red-500/20 text-red-400">
          <Youtube className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{t.download.youtube}</h1>
          <p className="text-gray-400 text-sm">{t.download.youtubeDesc}</p>
        </div>
        {/* Network status */}
        <div className="flex items-center gap-2 text-sm">
          {isNetworkConnected === null ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : isNetworkConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-green-400">{t.download.networkConnected}</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-red-400">{t.download.networkDisconnected}</span>
            </>
          )}
        </div>
      </div>

      {!result && (
        <>
          {/* URL Input */}
          <div className="card">
            <label className="text-sm text-gray-300 mb-2 block">{t.download.urlLabel}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.download.urlPlaceholder}
                className="flex-1 px-3 py-2.5 rounded-lg text-white text-sm"
                style={{ background: 'rgba(50, 50, 55, 0.9)', border: '1px solid rgba(255,255,255,0.12)' }}
                disabled={isProcessing || !isNetworkConnected}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchInfo()}
              />
              <button
                onClick={handleFetchInfo}
                disabled={!url.trim() || isLoadingInfo || isProcessing || !isNetworkConnected}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
              >
                {isLoadingInfo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t.download.fetchInfo
                )}
              </button>
            </div>
            {infoError && (
              <p className="text-red-400 text-sm mt-2">{infoError}</p>
            )}
          </div>

          {/* Video Info & Options */}
          {videoInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Video Preview */}
              <div className="card flex gap-4">
                {/* Thumbnail with loading state */}
                <div className="w-48 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                  {getThumbnailUrl(url) && !thumbnailError && (
                    <img
                      src={getThumbnailUrl(url)!}
                      alt={videoInfo.title}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${thumbnailLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                      onLoad={() => setThumbnailLoaded(true)}
                      onError={() => setThumbnailError(true)}
                    />
                  )}
                  {(!thumbnailLoaded || thumbnailError) && (
                    <div className="w-full h-full flex items-center justify-center">
                      {thumbnailError ? (
                        <Youtube className="w-10 h-10 text-red-400/50" />
                      ) : (
                        <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium line-clamp-2">{videoInfo.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{videoInfo.uploader}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {formatDuration(videoInfo.duration)}
                  </p>
                </div>
              </div>

              {/* Download Options */}
              <div className="card space-y-5">
                {/* Audio Only Toggle */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setAudioOnly(false)}
                    disabled={isProcessing}
                    className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-all ${!audioOnly ? 'bg-red-500/20 ring-1 ring-red-500/50 text-red-400' : 'bg-white/5 text-gray-400'
                      }`}
                  >
                    <Film className="w-5 h-5" />
                    {t.download.video}
                  </button>
                  <button
                    onClick={() => setAudioOnly(true)}
                    disabled={isProcessing}
                    className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-all ${audioOnly ? 'bg-red-500/20 ring-1 ring-red-500/50 text-red-400' : 'bg-white/5 text-gray-400'
                      }`}
                  >
                    <Music className="w-5 h-5" />
                    {t.download.audioOnly}
                  </button>
                </div>

                {/* Video Options */}
                {!audioOnly && (
                  <>
                    {/* Resolution */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">{t.download.resolution}</label>
                      {availableResolutions.length > 0 ? (
                        <div
                          className="grid gap-2"
                          style={{
                            gridTemplateColumns: `repeat(${availableResolutions.length}, 1fr)`
                          }}
                        >
                          {availableResolutions.map((res) => (
                            <button
                              key={res}
                              onClick={() => setResolution(res)}
                              disabled={isProcessing}
                              className={`py-2.5 rounded-lg text-sm transition-all ${resolution === res
                                ? 'bg-red-500/20 ring-1 ring-red-500/50 text-red-400'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                              {res}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No video formats available</p>
                      )}
                    </div>

                    {/* Video Format */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">{t.download.videoFormat}</label>
                      <div className="grid grid-cols-5 gap-2">
                        {VIDEO_FORMATS.map((f) => (
                          <button
                            key={f.value}
                            onClick={() => setVideoFormat(f.value)}
                            disabled={isProcessing}
                            className={`p-2.5 rounded-lg text-center transition-all ${videoFormat === f.value
                              ? 'bg-red-500/20 ring-1 ring-red-500/50'
                              : 'bg-white/5 hover:bg-white/10'
                              }`}
                          >
                            <div className={`font-medium text-sm ${videoFormat === f.value ? 'text-red-400' : 'text-white'}`}>
                              {f.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">{f.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Audio Format (when audio only) */}
                {audioOnly && (
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">{t.download.audioFormat}</label>
                    <div className="grid grid-cols-6 gap-2">
                      {AUDIO_FORMATS.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => setAudioFormat(f.value)}
                          disabled={isProcessing}
                          className={`p-2.5 rounded-lg text-center transition-all ${audioFormat === f.value
                            ? 'bg-red-500/20 ring-1 ring-red-500/50'
                            : 'bg-white/5 hover:bg-white/10'
                            }`}
                        >
                          <div className={`font-medium text-sm ${audioFormat === f.value ? 'text-red-400' : 'text-white'}`}>
                            {f.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{f.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Output Path */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                    <FolderOpen className="w-4 h-4 text-gray-400" />
                    {t.download.outputPath}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={outputPath}
                      onChange={(e) => setOutputPath(e.target.value)}
                      placeholder={t.download.selectFolder}
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
                      {t.common.browse}
                    </button>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  disabled={isProcessing || !outputPath || (!audioOnly && !resolution)}
                  className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                >
                  <Play className="w-4 h-4" />
                  {t.download.startDownload}
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Processing Status */}
      {(isProcessing || error || result) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          {isProcessing && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
                <span className="text-gray-200">{progressMessage || 'Downloading...'}</span>
                <span className="text-gray-400 ml-auto">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-red-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-red-400">
                <XCircle className="w-5 h-5" />
                <span>Download failed</span>
              </div>
              <p className="text-sm text-gray-400 bg-red-500/10 p-3 rounded-lg">{error}</p>
              <button onClick={handleReset} className="btn-secondary text-sm">
                Try Again
              </button>
            </div>
          )}

          {result && !isProcessing && !error && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>Download completed!</span>
              </div>
              <p className="text-sm text-gray-400 break-all">{result}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleOpenResult}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                >
                  <FolderOpen className="w-4 h-4" />
                  Open Location
                </button>
                <button onClick={handleReset} className="btn-secondary text-sm">
                  Download Another
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
