import { Routes, Route, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Youtube, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/useI18n'
import { YoutubeDownload } from '@/components/tools'

function DownloadToolsIndex(): JSX.Element {
  const t = useI18n()

  const downloadTools = [
    {
      id: 'youtube',
      icon: Youtube,
      label: t.download.youtube,
      description: t.download.youtubeDesc,
      path: '/download/youtube',
      color: 'bg-red-500/20 text-red-400'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{t.download.title}</h1>
        <p className="text-gray-300">{t.download.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {downloadTools.map((tool) => (
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

      {/* Info card */}
      <div className="card">
        <h3 className="font-medium text-white mb-4">{t.download.supportedFeatures}</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>{t.download.feature1}</p>
          <p>{t.download.feature2}</p>
          <p>{t.download.feature3}</p>
        </div>
      </div>
    </div>
  )
}

export default function DownloadTools(): JSX.Element {
  return (
    <Routes>
      <Route index element={<DownloadToolsIndex />} />
      <Route path="youtube" element={<YoutubeDownload />} />
    </Routes>
  )
}
