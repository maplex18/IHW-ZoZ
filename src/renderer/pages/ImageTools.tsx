import { Routes, Route, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Film,
  Maximize2,
  Crop,
  Pipette,
  RotateCw,
  FlipHorizontal,
  ZoomIn,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/useI18n'
import {
  GifMaker,
  ImageResize,
  ImageCrop,
  ColorPicker,
  ImageRotate,
  ImageFlip,
  ImageEnlarger
} from '@/components/tools'

function ImageToolsIndex(): JSX.Element {
  const t = useI18n()

  const imageTools = [
    { id: 'gif-maker', icon: Film, label: t.image.gifMaker, desc: t.image.gifMakerDesc, path: '/image/gif-maker', color: 'bg-pink-500/20 text-pink-400' },
    { id: 'resize', icon: Maximize2, label: t.image.resize, desc: t.image.resizeDesc, path: '/image/resize', color: 'bg-purple-500/20 text-purple-400' },
    { id: 'crop', icon: Crop, label: t.image.crop, desc: t.image.cropDesc, path: '/image/crop', color: 'bg-indigo-500/20 text-indigo-400' },
    { id: 'color-picker', icon: Pipette, label: t.image.colorPicker, desc: t.image.colorPickerDesc, path: '/image/color-picker', color: 'bg-blue-500/20 text-blue-400' },
    { id: 'rotate', icon: RotateCw, label: t.image.rotate, desc: t.image.rotateDesc, path: '/image/rotate', color: 'bg-cyan-500/20 text-cyan-400' },
    { id: 'flip', icon: FlipHorizontal, label: t.image.flip, desc: t.image.flipDesc, path: '/image/flip', color: 'bg-teal-500/20 text-teal-400' },
    { id: 'enlarger', icon: ZoomIn, label: t.image.enlarger, desc: t.image.enlargerDesc, path: '/image/enlarger', color: 'bg-green-500/20 text-green-400' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{t.image.title}</h1>
        <p className="text-gray-300">{t.image.selectTool}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {imageTools.map((tool) => (
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
                <p className="text-xs text-gray-400">{tool.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function ImageTools(): JSX.Element {
  return (
    <Routes>
      <Route index element={<ImageToolsIndex />} />
      <Route path="gif-maker" element={<GifMaker />} />
      <Route path="resize" element={<ImageResize />} />
      <Route path="crop" element={<ImageCrop />} />
      <Route path="color-picker" element={<ColorPicker />} />
      <Route path="rotate" element={<ImageRotate />} />
      <Route path="flip" element={<ImageFlip />} />
      <Route path="enlarger" element={<ImageEnlarger />} />
    </Routes>
  )
}
