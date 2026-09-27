import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'sonner'
import AIChatBubble from '@/components/ai/AIChatBubble'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: 'FitVibe - Nền tảng Sức khỏe & Thể dục',
  description: 'Quản lý sức khỏe toàn diện với các công cụ theo dõi BMI, ghi nhận cân nặng và kế hoạch tập luyện cá nhân hóa',
  generator: 'FitVibe Platform',
  icons: {
    icon: [
      {
        url: '/favicon.ico?v=2026',
        sizes: 'any',
      },
      {
        url: '/icon.svg?v=2026',
        type: 'image/svg+xml',
      },
      {
        url: '/icon-light-32x32.png?v=2026',
        sizes: '32x32',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png?v=2026',
        sizes: '32x32',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    shortcut: '/favicon.ico?v=2026',
    apple: '/apple-icon.png?v=2026',
  },
}

import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased text-foreground bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
            <AIChatBubble />
            <Toaster position="top-center" richColors />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
