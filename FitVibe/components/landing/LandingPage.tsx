'use client'

import { useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(true)

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-between selection:bg-primary/30 selection:text-primary">
      {/* Dynamic Background Glow Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[15%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] -right-[15%] w-[45%] h-[60%] bg-teal-500/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 rotate-3 hover:rotate-0 transition-transform">
            <span className="text-2xl">🌿</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-foreground">
            FitVibe<span className="text-primary italic">.</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Hệ thống trực tuyến v2.5
          </span>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 lg:py-12 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
        {/* Left Column: Brand & Value Props */}
        <div className="flex-1 max-w-2xl space-y-8 animate-in text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest shadow-sm">
            <span>⚡</span> Nền tảng Fitness & Dinh Dưỡng Thông Minh
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.15]">
            Định hình vóc dáng,{' '}
            <span className="text-gradient">bứt phá giới hạn</span> cùng AI & HLV.
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
            Lộ trình tập luyện khoa học, tính toán Calo tự động, video HD chuẩn động tác và đội ngũ Huấn luyện viên chuyên môn cao đồng hành cùng bạn 24/7.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {[
              { icon: '🤖', title: 'AI Assistant', desc: 'Gợi ý thực đơn & lịch tập tức thì' },
              { icon: '🗺️', title: 'Lộ trình HD', desc: 'Chấm điểm bài tập qua video' },
              { icon: '👨‍🏫', title: 'HLV 1-on-1', desc: 'Chứng chỉ NASM / ACSM chuẩn quốc tế' },
            ].map((f, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/60 hover:border-primary/40 hover:-translate-y-1 transition-all text-left shadow-sm"
              >
                <div className="text-2xl mb-2">{f.icon}</div>
                <h4 className="font-bold text-foreground text-sm mb-1">{f.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Metrics / Social Proof */}
          <div className="pt-4 border-t border-border/50 flex flex-wrap items-center justify-center lg:justify-start gap-8 sm:gap-12">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">10,000+</p>
              <p className="text-xs text-muted-foreground font-semibold">Học viên tham gia</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-primary">98%</p>
              <p className="text-xs text-muted-foreground font-semibold">Tỷ lệ đạt mục tiêu</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-teal-500">24/7</p>
              <p className="text-xs text-muted-foreground font-semibold">Hỗ trợ AI & HLV</p>
            </div>
          </div>
        </div>

        {/* Right Column: Glassmorphism Auth Card */}
        <div className="w-full max-w-md animate-in" style={{ animationDelay: '0.15s' }}>
          <div className="glass rounded-[2.5rem] p-8 sm:p-10 border border-white/30 dark:border-white/10 shadow-2xl relative overflow-hidden">
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

            {/* Toggle Switch */}
            <div className="flex p-1.5 rounded-2xl bg-secondary/60 mb-6 border border-border/50">
              <button
                type="button"
                onClick={() => setShowLogin(true)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  showLogin
                    ? 'bg-card text-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  !showLogin
                    ? 'bg-card text-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Đăng ký tài khoản
              </button>
            </div>

            {/* Forms */}
            {showLogin ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-2xl font-black text-foreground">Chào mừng trở lại!</h3>
                  <p className="text-xs text-muted-foreground mt-1">Nhập thông tin đăng nhập để tiếp tục trải nghiệm.</p>
                </div>
                <LoginForm />
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <h3 className="text-2xl font-black text-foreground">Tạo tài khoản mới</h3>
                  <p className="text-xs text-muted-foreground mt-1">Bắt đầu hành trình nâng cao sức khỏe ngay hôm nay.</p>
                </div>
                <SignupForm onSuccess={() => setShowLogin(true)} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-muted-foreground opacity-60 border-t border-border/30">
        © 2026 FitVibe Platform. All rights reserved. Nền tảng thể hình & dinh dưỡng thông minh.
      </footer>
    </div>
  )
}
