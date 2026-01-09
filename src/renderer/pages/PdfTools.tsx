import { Routes, Route, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Combine,
  Scissors,
  Minimize2,
  Image,
  RotateCw,
  Droplet,
  Lock,
  Unlock,
  ScanText,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/useI18n'
import {
  PdfMerge,
  PdfSplit,
  PdfCompress,
  PdfToImages,
  PdfRotate,
  PdfWatermark,
  PdfEncrypt,
  PdfDecrypt,
  PdfOcr
} from '@/components/tools'

function PdfToolsIndex(): JSX.Element {
  const t = useI18n()

  const pdfTools = [
    { id: 'merge', icon: Combine, label: t.pdf.merge, desc: t.pdf.mergeDesc, path: '/pdf/merge', color: 'bg-red-500/20 text-red-400' },
    { id: 'split', icon: Scissors, label: t.pdf.split, desc: t.pdf.splitDesc, path: '/pdf/split', color: 'bg-orange-500/20 text-orange-400' },
    { id: 'compress', icon: Minimize2, label: t.pdf.compress, desc: t.pdf.compressDesc, path: '/pdf/compress', color: 'bg-yellow-500/20 text-yellow-400' },
    { id: 'to-images', icon: Image, label: t.pdf.toImages, desc: t.pdf.toImagesDesc, path: '/pdf/to-images', color: 'bg-green-500/20 text-green-400' },
    { id: 'rotate', icon: RotateCw, label: t.pdf.rotate, desc: t.pdf.rotateDesc, path: '/pdf/rotate', color: 'bg-teal-500/20 text-teal-400' },
    { id: 'watermark', icon: Droplet, label: t.pdf.watermark, desc: t.pdf.watermarkDesc, path: '/pdf/watermark', color: 'bg-cyan-500/20 text-cyan-400' },
    { id: 'encrypt', icon: Lock, label: t.pdf.encrypt, desc: t.pdf.encryptDesc, path: '/pdf/encrypt', color: 'bg-blue-500/20 text-blue-400' },
    { id: 'decrypt', icon: Unlock, label: t.pdf.decrypt, desc: t.pdf.decryptDesc, path: '/pdf/decrypt', color: 'bg-indigo-500/20 text-indigo-400' },
    { id: 'ocr', icon: ScanText, label: t.pdf.ocr, desc: t.pdf.ocrDesc, path: '/pdf/ocr', color: 'bg-purple-500/20 text-purple-400' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{t.pdf.title}</h1>
        <p className="text-gray-300">{t.pdf.selectTool}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {pdfTools.map((tool) => (
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

export default function PdfTools(): JSX.Element {
  return (
    <Routes>
      <Route index element={<PdfToolsIndex />} />
      <Route path="merge" element={<PdfMerge />} />
      <Route path="split" element={<PdfSplit />} />
      <Route path="compress" element={<PdfCompress />} />
      <Route path="to-images" element={<PdfToImages />} />
      <Route path="rotate" element={<PdfRotate />} />
      <Route path="watermark" element={<PdfWatermark />} />
      <Route path="encrypt" element={<PdfEncrypt />} />
      <Route path="decrypt" element={<PdfDecrypt />} />
      <Route path="ocr" element={<PdfOcr />} />
    </Routes>
  )
}
