import { useState, useMemo } from 'react'
import { useTaskStore } from '@/stores/taskStore'
import { useI18n } from '@/hooks/useI18n'
import { Task, TaskStatus, TaskType } from '@shared/types'
import {
  History as HistoryIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Trash2,
  FolderOpen,
  Filter,
  FileText,
  Film,
  Image,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type FilterStatus = 'all' | TaskStatus
type FilterCategory = 'all' | 'pdf' | 'media' | 'image'

const TASK_TYPE_LABELS: Record<TaskType, { zh: string; en: string; ja: string }> = {
  'pdf:merge': { zh: '合併 PDF', en: 'Merge PDF', ja: 'PDF 結合' },
  'pdf:split': { zh: '拆分 PDF', en: 'Split PDF', ja: 'PDF 分割' },
  'pdf:compress': { zh: '壓縮 PDF', en: 'Compress PDF', ja: 'PDF 圧縮' },
  'pdf:toImages': { zh: 'PDF 轉圖片', en: 'PDF to Images', ja: 'PDF を画像に' },
  'pdf:rotate': { zh: '旋轉 PDF', en: 'Rotate PDF', ja: 'PDF 回転' },
  'pdf:watermark': { zh: '加入浮水印', en: 'Add Watermark', ja: '透かし追加' },
  'pdf:encrypt': { zh: '加密 PDF', en: 'Encrypt PDF', ja: 'PDF 暗号化' },
  'pdf:decrypt': { zh: '解密 PDF', en: 'Decrypt PDF', ja: 'PDF 復号化' },
  'pdf:crack': { zh: '破解 PDF 密碼', en: 'Crack PDF Password', ja: 'PDF パスワード解析' },
  'pdf:ocr': { zh: 'OCR 文字辨識', en: 'OCR', ja: 'OCR' },
  'video:compress': { zh: '壓縮影片', en: 'Compress Video', ja: '動画圧縮' },
  'video:convert': { zh: '轉換影片', en: 'Convert Video', ja: '動画変換' },
  'video:toGif': { zh: '影片轉 GIF', en: 'Video to GIF', ja: '動画を GIF に' },
  'audio:compress': { zh: '壓縮音訊', en: 'Compress Audio', ja: 'オーディオ圧縮' },
  'audio:convert': { zh: '轉換音訊', en: 'Convert Audio', ja: 'オーディオ変換' },
  'audio:extract': { zh: '擷取音訊', en: 'Extract Audio', ja: 'オーディオ抽出' },
  'image:createGif': { zh: '製作 GIF', en: 'Create GIF', ja: 'GIF 作成' },
  'image:resize': { zh: '調整大小', en: 'Resize', ja: 'サイズ変更' },
  'image:crop': { zh: '裁剪圖片', en: 'Crop', ja: '切り抜き' },
  'image:getColors': { zh: '擷取顏色', en: 'Get Colors', ja: '色を取得' },
  'image:rotate': { zh: '旋轉圖片', en: 'Rotate', ja: '回転' },
  'image:flip': { zh: '翻轉圖片', en: 'Flip', ja: '反転' },
  'image:enlarge': { zh: '放大圖片', en: 'Enlarge', ja: '拡大' },
  'download:youtube': { zh: 'YouTube 下載', en: 'YouTube Download', ja: 'YouTube ダウンロード' }
}

function getTaskCategory(type: TaskType): 'pdf' | 'media' | 'image' {
  if (type.startsWith('pdf:')) return 'pdf'
  if (type.startsWith('video:') || type.startsWith('audio:')) return 'media'
  return 'image'
}

function getCategoryIcon(category: 'pdf' | 'media' | 'image') {
  switch (category) {
    case 'pdf':
      return FileText
    case 'media':
      return Film
    case 'image':
      return Image
  }
}

function getStatusIcon(status: TaskStatus) {
  switch (status) {
    case 'completed':
      return CheckCircle2
    case 'failed':
      return XCircle
    case 'processing':
      return Loader2
    case 'cancelled':
      return AlertCircle
    default:
      return Clock
  }
}

function getStatusColor(status: TaskStatus) {
  switch (status) {
    case 'completed':
      return 'text-green-400'
    case 'failed':
      return 'text-red-400'
    case 'processing':
      return 'text-blue-400'
    case 'cancelled':
      return 'text-gray-400'
    default:
      return 'text-yellow-400'
  }
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '昨天 ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  } else if (days < 7) {
    return `${days} 天前`
  } else {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

interface TaskItemProps {
  task: Task
  language: string
  onRemove: (id: string) => void
  onOpenFolder: (path: string) => void
}

function TaskItem({ task, language, onRemove, onOpenFolder }: TaskItemProps) {
  const [expanded, setExpanded] = useState(false)
  const StatusIcon = getStatusIcon(task.status)
  const CategoryIcon = getCategoryIcon(getTaskCategory(task.type))
  const statusColor = getStatusColor(task.status)
  const typeLabel = TASK_TYPE_LABELS[task.type]?.[language as 'zh' | 'en' | 'ja'] || task.type

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="rounded-lg overflow-hidden"
      style={{ background: 'rgba(40, 40, 45, 0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Expand Icon */}
        <div className="text-gray-500">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>

        {/* Category Icon */}
        <div className="p-2 rounded-lg bg-white/5">
          <CategoryIcon className="w-4 h-4 text-gray-400" />
        </div>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">{typeLabel}</span>
            {task.status === 'processing' && (
              <span className="text-xs text-blue-400">{task.progress}%</span>
            )}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {task.input.length > 0 && task.input[0].name}
            {task.input.length > 1 && ` +${task.input.length - 1}`}
          </div>
        </div>

        {/* Status */}
        <div className={`flex items-center gap-1.5 ${statusColor}`}>
          <StatusIcon className={`w-4 h-4 ${task.status === 'processing' ? 'animate-spin' : ''}`} />
        </div>

        {/* Time */}
        <div className="text-xs text-gray-500 w-20 text-right">
          {formatDate(task.completedAt || task.createdAt)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {task.output?.path && (
            <button
              onClick={() => onOpenFolder(task.output!.path)}
              className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Open folder"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onRemove(task.id)}
            className="p-1.5 rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-3">
              {/* Input Files */}
              <div>
                <p className="text-xs text-gray-500 mb-1.5">輸入檔案</p>
                <div className="space-y-1">
                  {task.input.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-300 truncate flex-1">{file.name}</span>
                      <span className="text-gray-500">{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Output File */}
              {task.output && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">輸出檔案</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-green-400 truncate flex-1">{task.output.name}</span>
                    <span className="text-gray-500">{formatFileSize(task.output.size)}</span>
                  </div>
                </div>
              )}

              {/* Error */}
              {task.error && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">錯誤訊息</p>
                  <p className="text-xs text-red-400 bg-red-500/10 px-2 py-1.5 rounded">{task.error}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="flex gap-4 text-xs text-gray-500">
                <span>開始：{new Date(task.createdAt).toLocaleString()}</span>
                {task.completedAt && (
                  <span>完成：{new Date(task.completedAt).toLocaleString()}</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function History(): JSX.Element {
  const t = useI18n()
  const { tasks, removeTask, clearCompletedTasks } = useTaskStore()
  const language = t.nav.history === '歷史紀錄' ? 'zh' : t.nav.history === 'History' ? 'en' : 'ja'

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all')

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filterStatus !== 'all' && task.status !== filterStatus) return false
        if (filterCategory !== 'all' && getTaskCategory(task.type) !== filterCategory) return false
        return true
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [tasks, filterStatus, filterCategory])

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      failed: tasks.filter((t) => t.status === 'failed').length,
      processing: tasks.filter((t) => t.status === 'processing').length
    }
  }, [tasks])

  const handleOpenFolder = async (filePath: string) => {
    const dir = filePath.substring(0, filePath.lastIndexOf('/'))
    await window.api.file.openDirectory()
  }

  const handleClearCompleted = () => {
    clearCompletedTasks()
  }

  const statusOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: t.history?.all || '全部' },
    { value: 'completed', label: t.status.completed },
    { value: 'failed', label: t.status.failed },
    { value: 'processing', label: t.status.processing },
    { value: 'pending', label: t.status.pending }
  ]

  const categoryOptions: { value: FilterCategory; label: string }[] = [
    { value: 'all', label: t.history?.all || '全部' },
    { value: 'pdf', label: 'PDF' },
    { value: 'media', label: t.history?.media || '影音' },
    { value: 'image', label: t.history?.image || '圖片' }
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{t.history?.title || '歷史紀錄'}</h1>
            <p className="text-gray-400 text-sm">{t.history?.subtitle || '查看所有處理任務'}</p>
          </div>
        </div>

        {stats.completed > 0 && (
          <button
            onClick={handleClearCompleted}
            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-all flex items-center gap-2 hover:bg-white/10"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Trash2 className="w-4 h-4" />
            {t.history?.clearCompleted || '清除已完成'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-xl p-4" style={{ background: 'rgba(35, 35, 40, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-500">{t.history?.totalTasks || '總任務'}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'rgba(35, 35, 40, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          <p className="text-xs text-gray-500">{t.status.completed}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'rgba(35, 35, 40, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
          <p className="text-xs text-gray-500">{t.status.failed}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'rgba(35, 35, 40, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-2xl font-bold text-blue-400">{stats.processing}</p>
          <p className="text-xs text-gray-500">{t.status.processing}</p>
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex items-center gap-4 p-3 rounded-xl"
        style={{ background: 'rgba(35, 35, 40, 0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <Filter className="w-4 h-4 text-gray-500" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{t.history?.status || '狀態'}:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-2 py-1 rounded text-sm text-white"
            style={{ background: 'rgba(50, 50, 55, 0.9)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{t.history?.category || '類別'}:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
            className="px-2 py-1 rounded text-sm text-white"
            style={{ background: 'rgba(50, 50, 55, 0.9)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1" />
        <span className="text-xs text-gray-500">
          {filteredTasks.length} {t.history?.items || '項'}
        </span>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-gray-500"
            >
              <RefreshCw className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">{t.history?.empty || '沒有任務紀錄'}</p>
            </motion.div>
          ) : (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                language={language}
                onRemove={removeTask}
                onOpenFolder={handleOpenFolder}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
