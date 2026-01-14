import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { StatusBar } from './StatusBar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps): JSX.Element {
  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header with drag region */}
      <Header />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6 bg-black/50">
          {children}
        </main>
      </div>

      {/* Status bar */}
      <StatusBar />
    </div>
  )
}
