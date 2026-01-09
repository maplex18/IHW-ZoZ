import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Task, TaskStatus, TaskType, FileInfo } from '@shared/types'
import { generateId } from '../lib/utils'

interface TaskStore {
  tasks: Task[]
  activeTaskId: string | null

  addTask: (type: TaskType, input: FileInfo[], options?: Record<string, unknown>) => string
  updateTask: (id: string, updates: Partial<Task>) => void
  updateProgress: (id: string, progress: number) => void
  completeTask: (id: string, output?: FileInfo) => void
  failTask: (id: string, error: string) => void
  cancelTask: (id: string) => void
  removeTask: (id: string) => void
  clearCompletedTasks: () => void
  setActiveTask: (id: string | null) => void
  getTask: (id: string) => Task | undefined
  getPendingTasks: () => Task[]
  getProcessingTasks: () => Task[]
}

export const useTaskStore = create<TaskStore>()(persist((set, get) => ({
  tasks: [],
  activeTaskId: null,

  addTask: (type, input, options = {}) => {
    const id = generateId()
    const task: Task = {
      id,
      type,
      status: 'pending',
      input,
      options,
      progress: 0,
      createdAt: new Date()
    }
    set((state) => ({ tasks: [...state.tasks, task] }))
    return id
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
    }))
  },

  updateProgress: (id, progress) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, progress: Math.min(100, Math.max(0, progress)) } : t
      )
    }))
  },

  completeTask: (id, output) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'completed' as TaskStatus,
              progress: 100,
              output,
              completedAt: new Date()
            }
          : t
      )
    }))
  },

  failTask: (id, error) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'failed' as TaskStatus,
              error,
              completedAt: new Date()
            }
          : t
      )
    }))
  },

  cancelTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id && t.status === 'processing'
          ? { ...t, status: 'cancelled' as TaskStatus, completedAt: new Date() }
          : t
      )
    }))
  },

  removeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      activeTaskId: state.activeTaskId === id ? null : state.activeTaskId
    }))
  },

  clearCompletedTasks: () => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.status !== 'completed' && t.status !== 'failed')
    }))
  },

  setActiveTask: (id) => set({ activeTaskId: id }),

  getTask: (id) => get().tasks.find((t) => t.id === id),

  getPendingTasks: () => get().tasks.filter((t) => t.status === 'pending'),

  getProcessingTasks: () => get().tasks.filter((t) => t.status === 'processing')
}), {
  name: 'ihw-zoz-tasks',
  partialize: (state) => ({
    // Keep all tasks but limit to last 100 to prevent localStorage bloat
    tasks: state.tasks.slice(-100)
  })
}))
