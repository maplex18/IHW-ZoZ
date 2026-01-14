import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'

export function Onboarding(): JSX.Element {
  const updateSetting = useSettingsStore((s) => s.updateSetting)
  const language = useSettingsStore((s) => s.language)
  const isZhTW = language === 'zh-TW'

  const handleStart = () => {
    updateSetting('hasCompletedOnboarding', true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg mx-4"
      >
        {/* Card */}
        <div className="bg-gradient-to-b from-gray-800/95 to-gray-900/95 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Progress bar */}
          <div className="h-1 bg-white/10">
            <motion.div
              className="h-full bg-primary-500"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Content */}
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-primary-500/20 text-primary-400">
                  <Shield className="w-12 h-12" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-3">
                {isZhTW ? '歡迎使用 IHW-ZoZ' : 'Welcome to IHW-ZoZ'}
              </h2>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed mb-6">
                {isZhTW
                  ? '本地媒體處理工具，所有處理都在你的電腦上完成，不會上傳到任何伺服器。'
                  : 'Local media processing tool. All processing happens on your computer, nothing is uploaded.'}
              </p>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 flex justify-center">
            <button
              onClick={handleStart}
              className="px-8 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-400 text-white font-medium transition-colors"
            >
              {isZhTW ? '開始使用' : 'Get Started'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
