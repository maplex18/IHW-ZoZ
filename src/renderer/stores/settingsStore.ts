import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppSettings } from '@shared/types'
import { DEFAULT_SETTINGS } from '@shared/constants'

interface SettingsStore extends AppSettings {
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSetting: (key, value) => {
        set({ [key]: value })
      },

      resetSettings: () => {
        set(DEFAULT_SETTINGS)
      }
    }),
    {
      name: 'ihw-zoz-settings'
    }
  )
)
