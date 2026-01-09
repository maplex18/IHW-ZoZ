import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText,
  Play,
  Combine,
  Scissors,
  Minimize2,
  Image,
  Film,
  FileVideo,
  FileAudio,
  AudioLines,
  ArrowRight,
  Maximize2,
  Crop,
  ZoomIn
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/useI18n'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function Home(): JSX.Element {
  const t = useI18n()

  const quickTools = [
    {
      icon: Combine,
      label: t.pdf.merge,
      path: '/pdf/merge',
      color: 'bg-red-500/20 text-red-400',
      hoverBorder: 'hover:border-red-400/50',
      hoverBg: 'hover:bg-red-500/10'
    },
    {
      icon: Scissors,
      label: t.pdf.split,
      path: '/pdf/split',
      color: 'bg-orange-500/20 text-orange-400',
      hoverBorder: 'hover:border-orange-400/50',
      hoverBg: 'hover:bg-orange-500/10'
    },
    {
      icon: Minimize2,
      label: t.pdf.compress,
      path: '/pdf/compress',
      color: 'bg-yellow-500/20 text-yellow-400',
      hoverBorder: 'hover:border-yellow-400/50',
      hoverBg: 'hover:bg-yellow-500/10'
    },
    {
      icon: Image,
      label: t.pdf.toImages,
      path: '/pdf/to-images',
      color: 'bg-green-500/20 text-green-400',
      hoverBorder: 'hover:border-green-400/50',
      hoverBg: 'hover:bg-green-500/10'
    },
    {
      icon: Film,
      label: t.media.videoCompress,
      path: '/media/video-compress',
      color: 'bg-blue-500/20 text-blue-400',
      hoverBorder: 'hover:border-blue-400/50',
      hoverBg: 'hover:bg-blue-500/10'
    },
    {
      icon: FileVideo,
      label: t.media.videoConvert,
      path: '/media/video-convert',
      color: 'bg-indigo-500/20 text-indigo-400',
      hoverBorder: 'hover:border-indigo-400/50',
      hoverBg: 'hover:bg-indigo-500/10'
    },
    {
      icon: FileAudio,
      label: t.media.audioConvert,
      path: '/media/audio-convert',
      color: 'bg-purple-500/20 text-purple-400',
      hoverBorder: 'hover:border-purple-400/50',
      hoverBg: 'hover:bg-purple-500/10'
    },
    {
      icon: AudioLines,
      label: t.media.audioExtract,
      path: '/media/audio-extract',
      color: 'bg-pink-500/20 text-pink-400',
      hoverBorder: 'hover:border-pink-400/50',
      hoverBg: 'hover:bg-pink-500/10'
    }
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6"
      >
        <h1 className="text-3xl font-bold text-white mb-3">
          {t.home.title}
        </h1>
        <p className="text-gray-300 text-base max-w-lg mx-auto">
          {t.home.subtitle}
        </p>
      </motion.div>

      {/* Category cards */}
      <div className="grid grid-cols-3 gap-5">
        <Link to="/pdf">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-2xl p-5 cursor-pointer group transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(45, 45, 50, 0.95) 50%)',
              border: '1px solid rgba(239, 68, 68, 0.25)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-red-500/25 text-red-400 group-hover:bg-red-500/35 transition-all w-fit">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">{t.home.pdfTools}</h2>
                <p className="text-gray-300 text-xs">{t.home.pdfDesc}</p>
              </div>
            </div>
          </motion.div>
        </Link>

        <Link to="/media">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-2xl p-5 cursor-pointer group transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(45, 45, 50, 0.95) 50%)',
              border: '1px solid rgba(59, 130, 246, 0.25)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-blue-500/25 text-blue-400 group-hover:bg-blue-500/35 transition-all w-fit">
                <Play className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">{t.home.mediaTools}</h2>
                <p className="text-gray-300 text-xs">{t.home.mediaDesc}</p>
              </div>
            </div>
          </motion.div>
        </Link>

        <Link to="/image">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-2xl p-5 cursor-pointer group transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(45, 45, 50, 0.95) 50%)',
              border: '1px solid rgba(168, 85, 247, 0.25)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-purple-500/25 text-purple-400 group-hover:bg-purple-500/35 transition-all w-fit">
                <Image className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">{t.home.imageTools}</h2>
                <p className="text-gray-300 text-xs">{t.home.imageDesc}</p>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Quick access tools */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-medium text-gray-200">{t.home.quickAccess}</h2>
          <div className="h-px flex-1 ml-4 bg-gradient-to-r from-white/20 to-transparent" />
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-4 gap-4"
        >
          {quickTools.map((tool) => (
            <Link key={tool.path} to={tool.path}>
              <motion.div
                variants={item}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'rounded-xl border border-white/15 p-4 cursor-pointer group transition-all duration-300',
                  tool.hoverBorder,
                  tool.hoverBg
                )}
                style={{
                  background: 'rgba(42, 42, 48, 0.95)'
                }}
              >
                <div className={cn('p-3 rounded-xl w-fit mb-3', tool.color)}>
                  <tool.icon className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-white text-sm">{tool.label}</h3>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
