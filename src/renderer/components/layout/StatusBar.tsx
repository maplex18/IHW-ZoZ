import { useTaskStore } from '@/stores/taskStore'
import { useI18n } from '@/hooks/useI18n'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'

export function StatusBar(): JSX.Element {
  const t = useI18n()
  const tasks = useTaskStore((state) => state.tasks)

  const processingTasks = tasks.filter((task) => task.status === 'processing')
  const pendingTasks = tasks.filter((task) => task.status === 'pending')
  const completedTasks = tasks.filter((task) => task.status === 'completed')
  const failedTasks = tasks.filter((task) => task.status === 'failed')

  const currentTask = processingTasks[0]
  const progress = currentTask?.progress || 0

  return (
    <footer className="h-8 flex items-center justify-between px-4 statusbar text-xs text-gray-400">
      {/* Left: Current task progress */}
      <div className="flex items-center gap-3">
        {currentTask ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-400" />
            <span>{t.app.processing}</span>
            <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-gray-500">{Math.round(progress)}%</span>
          </>
        ) : (
          <span>{t.app.ready}</span>
        )}
      </div>

      {/* Right: Task counts */}
      <div className="flex items-center gap-4">
        {pendingTasks.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            {pendingTasks.length} {t.status.pending}
          </span>
        )}
        {processingTasks.length > 0 && (
          <span className="flex items-center gap-1 text-primary-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            {processingTasks.length} {t.status.processing}
          </span>
        )}
        {completedTasks.length > 0 && (
          <span className="flex items-center gap-1 text-green-400">
            <CheckCircle className="w-3 h-3" />
            {completedTasks.length} {t.status.completed}
          </span>
        )}
        {failedTasks.length > 0 && (
          <span className="flex items-center gap-1 text-red-400">
            <AlertCircle className="w-3 h-3" />
            {failedTasks.length} {t.status.failed}
          </span>
        )}
      </div>
    </footer>
  )
}
