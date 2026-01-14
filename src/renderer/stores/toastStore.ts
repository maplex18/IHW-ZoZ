import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

let toastId = 0

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastId}`
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }))
    return id
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  }
}))

// 便捷函數，可以在任何地方直接調用
export const toast = {
  success: (title: string, message?: string, duration = 4000) => {
    return useToastStore.getState().addToast({ type: 'success', title, message, duration })
  },
  error: (title: string, message?: string, duration = 6000) => {
    return useToastStore.getState().addToast({ type: 'error', title, message, duration })
  },
  warning: (title: string, message?: string, duration = 5000) => {
    return useToastStore.getState().addToast({ type: 'warning', title, message, duration })
  },
  info: (title: string, message?: string, duration = 4000) => {
    return useToastStore.getState().addToast({ type: 'info', title, message, duration })
  }
}
