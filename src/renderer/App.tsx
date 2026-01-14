import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Onboarding } from './components/Onboarding'
import { LoadingScreen } from './components/LoadingScreen'
import { ToastContainer } from './components/Toast'
import { useSettingsStore } from './stores/settingsStore'
import Home from './pages/Home'
import PdfTools from './pages/PdfTools'
import MediaTools from './pages/MediaTools'
import ImageTools from './pages/ImageTools'
import DownloadTools from './pages/DownloadTools'
import History from './pages/History'
import Settings from './pages/Settings'

function App(): JSX.Element {
  const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding)
  const [isLoading, setIsLoading] = useState(true)

  if (isLoading) {
    return (
      <div className="dark h-screen overflow-hidden bg-black">
        <LoadingScreen onLoadComplete={() => setIsLoading(false)} />
      </div>
    )
  }

  return (
    <div className="dark h-screen overflow-hidden bg-black">
      <ToastContainer />
      {!hasCompletedOnboarding && <Onboarding />}
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pdf/*" element={<PdfTools />} />
          <Route path="/media/*" element={<MediaTools />} />
          <Route path="/image/*" element={<ImageTools />} />
          <Route path="/download/*" element={<DownloadTools />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          {/* Catch-all route: redirect to home for unmatched paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App
