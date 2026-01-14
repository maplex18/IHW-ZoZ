import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ArrowRight, FileText, Play, Image, Download } from 'lucide-react'
import { useTaskStore } from '@/stores/taskStore'
import { useI18n } from '@/hooks/useI18n'
import { TaskType } from '@shared/types'
import { cn } from '@/lib/utils'

// 根據 TaskType 獲取對應的頁面路徑
function getTaskPath(type: TaskType): string {
  const pathMap: Record<TaskType, string> = {
    'pdf:merge': '/pdf/merge',
    'pdf:split': '/pdf/split',
    'pdf:compress': '/pdf/compress',
    'pdf:toImages': '/pdf/to-images',
    'pdf:rotate': '/pdf/rotate',
    'pdf:encrypt': '/pdf/encrypt',
    'pdf:decrypt': '/pdf/decrypt',
    'pdf:crack': '/pdf/crack',
    'pdf:watermark': '/pdf/watermark',
    'pdf:ocr': '/pdf/ocr',
    'video:compress': '/media/video-compress',
    'video:convert': '/media/video-convert',
    'video:toGif': '/media/video-to-gif',
    'audio:compress': '/media/audio-compress',
    'audio:convert': '/media/audio-convert',
    'audio:extract': '/media/audio-extract',
    'image:createGif': '/image/gif-maker',
    'image:resize': '/image/resize',
    'image:crop': '/image/crop',
    'image:getColors': '/image/color-picker',
    'image:rotate': '/image/rotate',
    'image:flip': '/image/flip',
    'image:enlarge': '/image/enlarge',
    'download:youtube': '/download/youtube'
  }
  return pathMap[type] || '/'
}

// 根據 TaskType 獲取顏色配置
function getTaskColor(type: TaskType): { bg: string; text: string; border: string; progress: string } {
  if (type.startsWith('pdf:')) {
    return {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/30',
      progress: 'bg-red-500'
    }
  }
  if (type.startsWith('video:') || type.startsWith('audio:')) {
    return {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      progress: 'bg-blue-500'
    }
  }
  if (type.startsWith('image:')) {
    return {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      progress: 'bg-purple-500'
    }
  }
  if (type.startsWith('download:')) {
    return {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/30',
      progress: 'bg-green-500'
    }
  }
  return {
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    border: 'border-gray-500/30',
    progress: 'bg-gray-500'
  }
}

// 根據 TaskType 獲取圖標
function getTaskIcon(type: TaskType) {
  if (type.startsWith('pdf:')) return FileText
  if (type.startsWith('video:') || type.startsWith('audio:')) return Play
  if (type.startsWith('image:')) return Image
  if (type.startsWith('download:')) return Download
  return FileText
}

interface TaskNameMap {
  [key: string]: string
}

export default function ActiveTasks(): JSX.Element | null {
  const navigate = useNavigate()
  const t = useI18n()
  const tasks = useTaskStore((state) => state.tasks)

  // 使用 useMemo 避免每次渲染都創建新數組導致無限循環
  const processingTasks = useMemo(
    () => tasks.filter((task) => task.status === 'processing'),
    [tasks]
  )

  // 根據 TaskType 獲取顯示名稱
  const getTaskName = (type: TaskType): string => {
    const nameMap: TaskNameMap = {
      'pdf:merge': t.pdf.merge,
      'pdf:split': t.pdf.split,
      'pdf:compress': t.pdf.compress,
      'pdf:toImages': t.pdf.toImages,
      'pdf:rotate': t.pdf.rotate,
      'pdf:encrypt': t.pdf.encrypt,
      'pdf:decrypt': t.pdf.decrypt,
      'pdf:crack': t.pdf.crack,
      'pdf:watermark': t.pdf.merge, // 暫時用合併
      'pdf:ocr': t.pdf.ocr,
      'video:compress': t.media.videoCompress,
      'video:convert': t.media.videoConvert,
      'video:toGif': t.media.videoToGif,
      'audio:compress': t.media.audioConvert,
      'audio:convert': t.media.audioConvert,
      'audio:extract': t.media.audioExtract,
      'image:createGif': t.image.gifMaker,
      'image:resize': t.image.resize,
      'image:crop': t.image.crop,
      'image:getColors': t.image.colorPicker,
      'image:rotate': t.image.rotate,
      'image:flip': t.image.flip,
      'image:enlarge': t.image.enlarger,
      'download:youtube': t.download.youtube
    }
    return nameMap[type] || type
  }

  // 如果沒有正在處理的任務，不顯示
  if (processingTasks.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          <h2 className="text-sm font-medium text-gray-200">{t.home.activeTasks}</h2>
          <span className="text-xs text-gray-500">({processingTasks.length})</span>
        </div>
        <span className="text-xs text-gray-500">{t.home.clickToView}</span>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {processingTasks.map((task) => {
            const colors = getTaskColor(task.type)
            const Icon = getTaskIcon(task.type)
            const taskName = getTaskName(task.type)
            const fileName = task.input[0]?.name || ''

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => navigate(getTaskPath(task.type))}
                className={cn(
                  'relative overflow-hidden rounded-xl border p-4 cursor-pointer',
                  'transition-all duration-200 hover:scale-[1.02]',
                  colors.bg,
                  colors.border
                )}
              >
                {/* 進度條背景 */}
                <div
                  className={cn(
                    'absolute left-0 top-0 h-full opacity-20 transition-all duration-300',
                    colors.progress
                  )}
                  style={{ width: `${task.progress}%` }}
                />

                {/* 內容 */}
                <div className="relative flex items-center gap-3">
                  {/* 圖標 */}
                  <div className={cn('p-2 rounded-lg', colors.bg)}>
                    <Icon className={cn('w-5 h-5', colors.text)} />
                  </div>

                  {/* 任務資訊 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm font-medium', colors.text)}>
                        {taskName}
                      </span>
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">
                        {fileName}
                      </span>
                    </div>

                    {/* 進度條 */}
                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={cn('h-full rounded-full', colors.progress)}
                        initial={{ width: 0 }}
                        animate={{ width: `${task.progress}%` }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* 進度百分比 */}
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm font-mono font-medium', colors.text)}>
                      {Math.round(task.progress)}%
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
