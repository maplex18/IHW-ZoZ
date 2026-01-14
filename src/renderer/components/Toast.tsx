import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { useToastStore, Toast as ToastType } from '@/stores/toastStore'

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
}

const colors = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: 'text-green-400',
    title: 'text-green-300'
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    title: 'text-red-300'
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-400',
    title: 'text-yellow-300'
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    title: 'text-blue-300'
  }
}

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useToastStore((s) => s.removeToast)
  const Icon = icons[toast.type]
  const color = colors[toast.type]

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        removeToast(toast.id)
      }, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, removeToast])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`
        relative w-80 max-w-[calc(100vw-2rem)] p-4 rounded-xl
        ${color.bg} ${color.border} border
        backdrop-blur-xl shadow-lg shadow-black/20
      `}
    >
      <button
        onClick={() => removeToast(toast.id)}
        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>

      <div className="flex gap-3 pr-6">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${color.icon}`} />
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${color.title}`}>{toast.title}</p>
          {toast.message && (
            <p className="mt-1 text-sm text-gray-400 break-words">{toast.message}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}
