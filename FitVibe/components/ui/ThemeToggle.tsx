'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

interface ThemeToggleProps {
  variant?: 'pill' | 'icon' | 'badge'
  className?: string
  showLabel?: boolean
}

export default function ThemeToggle({
  variant = 'pill',
  className = '',
  showLabel = true,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark')

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  if (!mounted) {
    // SSR placeholder to prevent hydration mismatch
    return (
      <div
        className={`h-9 px-3 rounded-full bg-secondary/50 border border-border/40 animate-pulse inline-flex items-center gap-2 ${className}`}
        aria-hidden="true"
      >
        <span className="w-4 h-4 rounded-full bg-muted-foreground/30" />
        {showLabel && variant !== 'icon' && (
          <span className="w-10 h-3 rounded bg-muted-foreground/20 hidden sm:inline-block" />
        )}
      </div>
    )
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`p-2.5 rounded-xl border border-border/60 bg-secondary/70 hover:bg-secondary text-foreground transition-all duration-300 active:scale-90 shadow-xs hover:shadow-md hover:border-primary/40 backdrop-blur-md group ${className}`}
        title={isDark ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
        aria-label="Chuyển đổi giao diện Sáng / Tối"
      >
        {isDark ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-400 group-hover:rotate-45 transition-transform duration-300"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-700 group-hover:-rotate-12 transition-transform duration-300"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-full border border-border/70 bg-card/80 hover:bg-card text-foreground transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md hover:border-primary/40 backdrop-blur-md group text-xs font-bold ${className}`}
      title={isDark ? 'Chuyển sang Giao diện Sáng (Light Mode)' : 'Chuyển sang Giao diện Tối (Dark Mode)'}
      aria-label="Chuyển đổi giao diện Sáng / Tối"
    >
      {isDark ? (
        <>
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/15 text-amber-400 group-hover:rotate-45 transition-transform duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          </span>
          {showLabel && (
            <span className="text-foreground/90 group-hover:text-foreground">
              Giao diện Sáng
            </span>
          )}
        </>
      ) : (
        <>
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-900/10 dark:bg-white/10 text-slate-700 dark:text-slate-200 group-hover:-rotate-12 transition-transform duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </span>
          {showLabel && (
            <span className="text-foreground/90 group-hover:text-foreground">
              Giao diện Tối
            </span>
          )}
        </>
      )}
    </button>
  )
}
