import { Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/hooks/useI18n'

export function Header(): JSX.Element {
  const t = useI18n()

  return (
    <header className="h-12 flex items-center justify-between px-4 header drag-region">
      {/* macOS traffic lights spacing */}
      <div className="w-20" />

      {/* App title */}
      <div className="flex items-center gap-2 drag-none">
        <h1 className="text-lg font-semibold text-gray-100">{t.app.name}</h1>
        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">{t.app.version}</span>
      </div>

      {/* Right side actions */}
      <div className="w-20 flex justify-end drag-none">
        <Link
          to="/settings"
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-gray-100"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </header>
  )
}
