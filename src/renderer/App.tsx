import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import Home from './pages/Home'
import PdfTools from './pages/PdfTools'
import MediaTools from './pages/MediaTools'
import ImageTools from './pages/ImageTools'
import Settings from './pages/Settings'

function App(): JSX.Element {
  return (
    <div className="dark h-screen overflow-hidden">
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
