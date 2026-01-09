import { Routes, Route, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Film, FileVideo, FileAudio, AudioLines, Scissors, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/useI18n'
import {
  VideoCompress,
  VideoConvert,
  AudioConvert,
  AudioExtract,
  MediaTrim
} from '@/components/tools'

function MediaToolsIndex(): JSX.Element {
  const t = useI18n()

  const mediaTools = [
    {
      id: 'video-compress',
      icon: Film,
      label: t.media.videoCompress,
      description: t.media.videoCompressDesc,
      path: '/media/video-compress',
      color: 'bg-blue-500/20 text-blue-400'
    },
    {
      id: 'video-convert',
      icon: FileVideo,
      label: t.media.videoConvert,
      description: t.media.videoConvertDesc,
      path: '/media/video-convert',
      color: 'bg-indigo-500/20 text-indigo-400'
    },
    {
      id: 'audio-convert',
      icon: FileAudio,
      label: t.media.audioConvert,
      description: t.media.audioConvertDesc,
      path: '/media/audio-convert',
      color: 'bg-purple-500/20 text-purple-400'
    },
    {
      id: 'audio-extract',
      icon: AudioLines,
      label: t.media.audioExtract,
      description: t.media.audioExtractDesc,
      path: '/media/audio-extract',
      color: 'bg-pink-500/20 text-pink-400'
    },
    {
      id: 'trim',
      icon: Scissors,
      label: t.media.trim,
      description: t.media.trimDesc,
      path: '/media/trim',
      color: 'bg-rose-500/20 text-rose-400'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{t.media.title}</h1>
        <p className="text-gray-300">{t.media.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {mediaTools.map((tool) => (
          <Link key={tool.id} to={tool.path}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="tool-card flex items-center gap-4"
            >
              <div className={cn('p-3 rounded-xl', tool.color)}>
                <tool.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">{tool.label}</h3>
                <p className="text-sm text-gray-300">{tool.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Supported formats */}
      <div className="card">
        <h3 className="font-medium text-white mb-4">{t.media.supportedFormats}</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'MP3', 'WAV', 'FLAC', 'AAC', 'OGG', 'M4A', 'WMA', 'AIFF', 'ALAC', 'OPUS',
            'AMR', 'AC3', 'DTS', 'APE', 'WV', 'MKA', 'WebM', 'MIDI', 'CAF'
          ].map((format) => (
            <span
              key={format}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/15 text-gray-200 border border-white/15"
            >
              {format}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MediaTools(): JSX.Element {
  return (
    <Routes>
      <Route index element={<MediaToolsIndex />} />
      <Route path="video-compress" element={<VideoCompress />} />
      <Route path="video-convert" element={<VideoConvert />} />
      <Route path="audio-convert" element={<AudioConvert />} />
      <Route path="audio-extract" element={<AudioExtract />} />
      <Route path="trim" element={<MediaTrim />} />
    </Routes>
  )
}
