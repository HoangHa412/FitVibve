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
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} font-sans antialiased text-foreground bg-background`}>
        <AuthProvider>
          {children}
          <AIChatBubble />
          <Toaster position="top-center" richColors />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
