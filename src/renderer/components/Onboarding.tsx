import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Shield, MousePointer, Settings, Check } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'

const isMac = navigator.platform.toLowerCase().includes('mac')

interface Step {
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  icon: React.ReactNode
  image?: string
}

const macSteps: Step[] = [
  {
    title: '歡迎使用 IHW-ZoZ',
    titleEn: 'Welcome to IHW-ZoZ',
    description: '本地媒體處理工具，所有處理都在你的電腦上完成，不會上傳到任何伺服器。',
    descriptionEn: 'Local media processing tool. All processing happens on your computer, nothing is uploaded.',
    icon: <Shield className="w-12 h-12" />,
  },
  {
    title: 'macOS 安全提示',
    titleEn: 'macOS Security Notice',
    description: '由於本應用尚未經過 Apple 公證，首次開啟時 macOS 會顯示安全警告。這是正常的，請按照下列步驟操作。',
    descriptionEn: 'Since this app is not notarized by Apple, macOS will show a security warning on first launch. This is normal, please follow the steps below.',
    icon: <Shield className="w-12 h-12" />,
  },
  {
    title: '步驟 1：右鍵點擊',
    titleEn: 'Step 1: Right-click',
    description: '在應用程式上按住 Control 鍵並點擊（或右鍵點擊），然後選擇「打開」。',
    descriptionEn: 'Control-click (or right-click) on the app, then select "Open".',
    icon: <MousePointer className="w-12 h-12" />,
  },
  {
    title: '步驟 2：確認打開',
    titleEn: 'Step 2: Confirm Open',
    description: '在彈出的對話框中點擊「打開」按鈕，之後就不會再出現警告了。',
    descriptionEn: 'Click "Open" in the dialog that appears. You won\'t see this warning again.',
    icon: <Check className="w-12 h-12" />,
  },
  {
    title: '或者：使用系統設定',
    titleEn: 'Alternative: System Settings',
    description: '你也可以在「系統設定」→「隱私權與安全性」中找到「強制打開」按鈕。',
    descriptionEn: 'You can also find "Open Anyway" button in System Settings → Privacy & Security.',
    icon: <Settings className="w-12 h-12" />,
  },
]

const defaultSteps: Step[] = [
  {
    title: '歡迎使用 IHW-ZoZ',
    titleEn: 'Welcome to IHW-ZoZ',
    description: '本地媒體處理工具，所有處理都在你的電腦上完成，不會上傳到任何伺服器。',
    descriptionEn: 'Local media processing tool. All processing happens on your computer, nothing is uploaded.',
    icon: <Shield className="w-12 h-12" />,
  },
]

export function Onboarding(): JSX.Element {
  const [currentStep, setCurrentStep] = useState(0)
  const updateSetting = useSettingsStore((s) => s.updateSetting)
  const language = useSettingsStore((s) => s.language)

  const steps = isMac ? macSteps : defaultSteps
  const isLastStep = currentStep === steps.length - 1
  const isZhTW = language === 'zh-TW'

  const handleNext = () => {
    if (isLastStep) {
      updateSetting('hasCompletedOnboarding', true)
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  const handleSkip = () => {
    updateSetting('hasCompletedOnboarding', true)
  }

  const step = steps[currentStep]

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
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-2xl bg-primary-500/20 text-primary-400">
                    {step.icon}
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-3">
                  {isZhTW ? step.title : step.titleEn}
                </h2>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed mb-6">
                  {isZhTW ? step.description : step.descriptionEn}
                </p>

                {/* macOS specific visual guide */}
                {isMac && currentStep === 2 && (
                  <div className="bg-gray-700/50 rounded-xl p-4 mb-6 text-left">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center">
                        <MousePointer className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Control + Click</p>
                        <p className="text-gray-400">{isZhTW ? '或右鍵點擊應用程式' : 'or Right-click on the app'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {isMac && currentStep === 3 && (
                  <div className="bg-gray-700/50 rounded-xl p-4 mb-6">
                    <div className="bg-gray-600/50 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-300 mb-2">
                        {isZhTW ? '在對話框中點擊：' : 'Click in the dialog:'}
                      </p>
                      <div className="inline-block px-4 py-2 bg-primary-500 rounded-lg text-white font-medium">
                        {isZhTW ? '打開' : 'Open'}
                      </div>
                    </div>
                  </div>
                )}

                {isMac && currentStep === 4 && (
                  <div className="bg-gray-700/50 rounded-xl p-4 mb-6 text-left text-sm">
                    <p className="text-gray-300 mb-2">
                      {isZhTW ? '路徑：' : 'Path:'}
                    </p>
                    <p className="text-primary-400 font-mono">
                      {isZhTW
                        ? '系統設定 → 隱私權與安全性 → 安全性'
                        : 'System Settings → Privacy & Security → Security'}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 flex items-center justify-between">
            {/* Skip button */}
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              {isZhTW ? '跳過' : 'Skip'}
            </button>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-white font-medium transition-colors"
              >
                {isLastStep ? (isZhTW ? '開始使用' : 'Get Started') : (isZhTW ? '下一步' : 'Next')}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 pb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary-500' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
