'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { API_BASE_URL } from '@/lib/api'

interface DashboardLayoutProps {
  children: React.ReactNode
  navItems: { label: string; href: string; icon?: string }[]
}

export default function DashboardLayout({ children, navItems }: DashboardLayoutProps) {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading || !user || !mounted) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const dashboardPath = user.role === 'admin' ? '/admin' : user.role === 'coach' ? '/coach' : '/dashboard'

  const getIconForHref = (href: string, idx: number) => {
    // Prefer explicit icons for known routes; fall back to a sensible default
    switch (href) {
      case '/dashboard':
        return '🏠'
      case '/dashboard/health':
        return '🧬'
      case '/dashboard/weight':
        return '⚖️'
      case '/dashboard/workouts':
        return '🏋️'
      case '/dashboard/meals':
        return '🥦'
      case '/dashboard/routes':
        return '🗺️'
      case '/dashboard/bookmarks':
        return '🔖'
      case '/dashboard/coaches':
        return '👥'
      case '/profile':
      case '/dashboard/profile':
        return '👤'
      default:
        // keep visual variety for other indexes
        const fallbacks = ['✨', '📋', '📊', '📚', '🔎', '🧭']
        return fallbacks[idx % fallbacks.length]
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/30 selection:text-primary">
      {/* Dynamic Background Blob Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[30%] h-[50%] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      {/* Header - Glassmorphism */}
      <header className="glass sticky top-0 z-50 w-full animate-in shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={dashboardPath} className="flex items-center gap-3 group transition-all active:scale-95">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-300">
              <span className="text-xl">🌿</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground bg-clip-text">
              FitVibe<span className="text-primary italic">.</span>
            </h1>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/profile"
              className={`flex items-center gap-3 p-1 pr-3 rounded-full transition-all hover:bg-secondary/50 ${pathname === '/profile' ? 'bg-secondary' : ''}`}
            >
              <div className="w-9 h-9 rounded-full border-2 border-primary/20 overflow-hidden bg-muted flex items-center justify-center shadow-sm">
                {user.avatar_url ? (
                  <img
                    src={`${API_BASE_URL}${user.avatar_url}`}
                    alt="Avatar"
                    className="w-full h-full object-cover scale-110"
                  />
                ) : (
                  <span className="text-sm font-bold text-primary">
                    {user.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold leading-tight">{user.name}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black opacity-70 flex items-center gap-2">
                  <span>
                    {user.role === 'admin' ? '🛡️' : user.role === 'coach' ? '👨‍🏫' : '👤'}
                  </span>
                  <span>
                    {user.role === 'admin' ? 'Admin' : user.role === 'coach' ? 'Huấn luyện viên' : 'Member'}
                  </span>
                </p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-90"
              title="Đăng xuất"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-[1400px] mx-auto min-h-[calc(100vh-64px)] relative z-10">
        {/* Sidebar - Modern & Sleek */}
        <aside className="w-72 hidden lg:block sticky top-16 h-[calc(100vh-64px)] p-6 border-r border-border/50">
          <div className="space-y-1.5 animate-in" style={{ animationDelay: '0.1s' }}>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 ml-4 opacity-50">Menu</p>
            {navItems.map((item, idx) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                    }`}
                  style={{ animationDelay: `${(idx + 1) * 0.05}s` }}
                >
                  <span className={`text-lg transition-transform duration-300 group-hover:scale-110 ${isActive ? 'rotate-0' : '-rotate-6 opacity-60'}`}>
                    {getIconForHref(item.href, idx)}
                  </span>
                  {item.label}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/50 animate-pulse" />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="absolute bottom-10 left-6 right-6 p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/10">
            <h5 className="font-bold text-sm mb-1">FitVibe Pro</h5>
            <p className="text-[10px] text-muted-foreground mb-3">Mở khóa tất cả bài tập đặc biệt</p>
            <button className="w-full py-2 bg-foreground text-background text-[10px] font-bold rounded-xl hover:scale-[1.02] transition-transform">
              Nâng cấp ngay
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-10 animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Nav - Minimalist glass pill */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl z-50 border border-white/20">
        {navItems.slice(0, 5).map((item, idx) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary shadow-lg shadow-primary/40 -translate-y-1' : ''}`}
            >
              <span className="text-xl">{getIconForHref(item.href, idx)}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
