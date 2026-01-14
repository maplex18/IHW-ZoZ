import { NavLink } from 'react-router-dom'
import { Home, FileText, Play, Image, Download, History, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/useI18n'

export function Sidebar(): JSX.Element {
  const t = useI18n()

  const navItems = [
    { path: '/', icon: Home, label: t.nav.home },
    { path: '/pdf', icon: FileText, label: t.nav.pdfTools },
    { path: '/media', icon: Play, label: t.nav.mediaTools },
    { path: '/image', icon: Image, label: t.nav.imageTools },
    { path: '/download', icon: Download, label: t.nav.downloadTools },
    { path: '/history', icon: History, label: t.nav.history }
  ]

  return (
    <aside className="w-56 sidebar flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-500/25 text-primary-400 border border-primary-500/50'
                  : 'text-gray-200 hover:text-white hover:bg-white/15 border border-transparent'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-white/10">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary-500/25 text-primary-400 border border-primary-500/50'
                : 'text-gray-200 hover:text-white hover:bg-white/15 border border-transparent'
            )
          }
        >
          <Settings className="w-5 h-5" />
          <span>{t.nav.settings}</span>
        </NavLink>
      </div>
    </aside>
  )
}
