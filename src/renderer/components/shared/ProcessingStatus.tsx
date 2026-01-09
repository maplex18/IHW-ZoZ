import { CheckCircle, XCircle, Loader2, FolderOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProcessingStatusProps {
  isProcessing: boolean
  progress: number
  error: string | null
  result: string | null
  onOpenResult?: () => void
  onReset?: () => void
}

export function ProcessingStatus({
  isProcessing,
  progress,
  error,
  result,
  onOpenResult,
  onReset
}: ProcessingStatusProps): JSX.Element | null {
  if (!isProcessing && !error && !result) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="card"
      >
        {isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
              <span className="text-gray-200">Processing...</span>
              <span className="text-gray-400 ml-auto">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-500 rounded-full"
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
              <span>Processing failed</span>
            </div>
            <p className="text-sm text-gray-400 bg-red-500/10 p-3 rounded-lg">{error}</p>
            {onReset && (
              <button onClick={onReset} className="btn-secondary text-sm">
                Try Again
              </button>
            )}
          </div>
        )}

        {result && !isProcessing && !error && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>Processing completed!</span>
            </div>
            <p className="text-sm text-gray-400 break-all">{result}</p>
            <div className="flex gap-2">
              {onOpenResult && (
                <button onClick={onOpenResult} className="btn-primary text-sm flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Open Location
                </button>
              )}
              {onReset && (
                <button onClick={onReset} className="btn-secondary text-sm">
                  Process Another
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
