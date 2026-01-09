import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Onboarding } from './components/Onboarding'
import { useSettingsStore } from './stores/settingsStore'
import Home from './pages/Home'
import PdfTools from './pages/PdfTools'
import MediaTools from './pages/MediaTools'
import ImageTools from './pages/ImageTools'
import Settings from './pages/Settings'

function App(): JSX.Element {
  const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding)

  return (
    <div className="dark h-screen overflow-hidden">
      {!hasCompletedOnboarding && <Onboarding />}
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pdf/*" element={<PdfTools />} />
          <Route path="/media/*" element={<MediaTools />} />
          <Route path="/image/*" element={<ImageTools />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App
