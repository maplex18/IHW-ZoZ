import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingScreenProps {
  onLoadComplete?: () => void
  minDuration?: number
}

export function LoadingScreen({ onLoadComplete, minDuration = 1500 }: LoadingScreenProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // 模擬載入進度
    const duration = minDuration
    const interval = 30
    const steps = duration / interval
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      // 使用 easeOutQuart 讓進度條更自然
      const t = currentStep / steps
      const eased = 1 - Math.pow(1 - t, 4)
      setProgress(Math.min(eased * 100, 100))

      if (currentStep >= steps) {
        clearInterval(timer)
        setTimeout(() => {
          setIsVisible(false)
        }, 200)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [minDuration])

  const handleExitComplete = () => {
    onLoadComplete?.()
  }

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
        >
          {/* 背景漸層 */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
          </div>

          {/* Logo 和動畫 */}
          <div className="relative z-10 flex flex-col items-center">
            {/* 動態 Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative mb-8"
            >
              {/* 外圈旋轉動畫 */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-4"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="70 200"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#639BFF" />
                      <stop offset="100%" stopColor="#639BFF00" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

              {/* 中心圖標 */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30 flex items-center justify-center backdrop-blur-sm">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>

            {/* 應用名稱 */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-center mb-8"
            >
              <h1 className="text-2xl font-bold text-white mb-1">IHW-ZoZ</h1>
              <p className="text-sm text-gray-400">本地媒體處理工具</p>
            </motion.div>

            {/* 進度條 */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="relative"
            >
              <div className="w-[200px] h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* 進度百分比 */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xs text-gray-500 text-center mt-3"
              >
                {Math.round(progress)}%
              </motion.p>
            </motion.div>

            {/* 載入提示文字 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="mt-6"
            >
              <LoadingText />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function LoadingText(): JSX.Element {
  const [dotCount, setDotCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4)
    }, 400)
    return () => clearInterval(timer)
  }, [])

  const dots = '.'.repeat(dotCount)

  return (
    <p className="text-sm text-gray-500 h-5">
      正在載入{dots}
    </p>
  )
}
