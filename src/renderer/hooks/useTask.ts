import { useState, useCallback, useEffect } from 'react'
import { useTaskStore } from '@/stores/taskStore'
import { TaskType, FileInfo } from '@shared/types'

interface UseTaskOptions {
  taskType: TaskType
  onComplete?: (result: string) => void
  onError?: (error: string) => void
}

interface UseTaskReturn {
  isProcessing: boolean
  progress: number
  error: string | null
  result: string | null
  taskId: string | null
  execute: <T>(apiCall: () => Promise<T>) => Promise<T | null>
  reset: () => void
}

export function useTask({ taskType, onComplete, onError }: UseTaskOptions): UseTaskReturn {
  const { addTask, updateTask, updateProgress, completeTask, failTask, tasks } = useTaskStore()

  // Find existing processing task for this type
  const existingTask = tasks.find(t => t.type === taskType && t.status === 'processing')

  const [isProcessing, setIsProcessing] = useState(!!existingTask)
  const [progress, setProgress] = useState(existingTask?.progress ?? 0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [taskId, setTaskId] = useState<string | null>(existingTask?.id ?? null)

  // Sync state when existing task changes
  useEffect(() => {
    if (existingTask) {
      setIsProcessing(true)
      setProgress(existingTask.progress)
      setTaskId(existingTask.id)
    }
  }, [existingTask?.id, existingTask?.progress])

  // Listen to progress events
  useEffect(() => {
    if (!taskId) return

    const unsubscribe = window.api.events.onProgress((data) => {
      if (data.taskId === taskId) {
        setProgress(data.progress)
        updateProgress(taskId, data.progress)
      }
    })

    return unsubscribe
  }, [taskId, updateProgress])

  const execute = useCallback(
    async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
      setIsProcessing(true)
      setProgress(0)
      setError(null)
      setResult(null)

      const newTaskId = addTask(taskType, [], {})
      setTaskId(newTaskId)
      updateTask(newTaskId, { status: 'processing' })

      try {
        const res = await apiCall()
        setResult(typeof res === 'string' ? res : JSON.stringify(res))
        setProgress(100)
        completeTask(newTaskId, { path: typeof res === 'string' ? res : '', name: '', size: 0, type: '' })
        onComplete?.(typeof res === 'string' ? res : JSON.stringify(res))
        return res
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        setError(errorMessage)
        failTask(newTaskId, errorMessage)
        onError?.(errorMessage)
        return null
      } finally {
        setIsProcessing(false)
      }
    },
    [taskType, addTask, updateTask, completeTask, failTask, onComplete, onError]
  )

  const reset = useCallback(() => {
    setIsProcessing(false)
    setProgress(0)
    setError(null)
    setResult(null)
    setTaskId(null)
  }, [])

  return {
    isProcessing,
    progress,
    error,
    result,
    taskId,
    execute,
    reset
  }
}

// Helper to convert File[] to file paths
export function filesToPaths(files: File[]): string[] {
  return files.map((f) => window.api.file.getFilePath(f))
}

// Helper to get output path from input file
export function getDefaultOutputPath(inputPath: string, suffix: string, newExt?: string): string {
  const lastDot = inputPath.lastIndexOf('.')
  const lastSlash = Math.max(inputPath.lastIndexOf('/'), inputPath.lastIndexOf('\\'))
  const dir = inputPath.substring(0, lastSlash)
  const nameWithoutExt = inputPath.substring(lastSlash + 1, lastDot)
  const ext = newExt || inputPath.substring(lastDot + 1)
  return `${dir}/${nameWithoutExt}${suffix}.${ext}`
}

// Helper to get output directory from input file
export function getOutputDir(inputPath: string): string {
  const lastSlash = Math.max(inputPath.lastIndexOf('/'), inputPath.lastIndexOf('\\'))
  return inputPath.substring(0, lastSlash)
}
