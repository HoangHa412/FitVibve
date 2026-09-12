'use client'

import { useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(true)

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-between selection:bg-primary/30 selection:text-primary">
      {/* Dynamic Background Glow Blobs with Smooth Floating Animations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[15%] -left-[10%] w-[55%] h-[55%] bg-emerald-500/15 rounded-full blur-[140px] animate-float-slow" />
        <div className="absolute top-[30%] -right-[15%] w-[50%] h-[60%] bg-teal-500/15 rounded-full blur-[160px] animate-float-reverse" />
        <div className="absolute -bottom-[20%] left-[20%] w-[45%] h-[45%] bg-cyan-500/15 rounded-full blur-[150px] animate-float-slow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between animate-fade-in-down">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-11 h-11 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 rotate-3 group-hover:rotate-0 group-hover:scale-105 transition-all duration-300">
            <span className="text-2xl group-hover:scale-110 transition-transform">🌿</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-foreground group-hover:opacity-90 transition-opacity">
            FitVibe<span className="text-primary italic">.</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-sm backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            Hệ thống trực tuyến v2.5
          </span>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 lg:py-12 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
        {/* Left Column: Brand & Value Props */}
        <div className="flex-1 max-w-2xl space-y-8 animate-fade-in-up text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-transform">
            <span className="animate-bounce-subtle">⚡</span> Nền tảng Fitness & Dinh Dưỡng Thông Minh
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.15]">
            Định hình vóc dáng,{' '}
            <span className="text-gradient-animated">bứt phá giới hạn</span> cùng AI & HLV.
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
                className="group p-4 rounded-2xl bg-card/70 backdrop-blur-md border border-border/60 hover:border-primary/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 text-left shadow-sm cursor-default"
                style={{ animationDelay: `${(i + 1) * 0.1}s` }}
              >
                <div className="text-2xl mb-2 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">{f.icon}</div>
                <h4 className="font-bold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{f.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Metrics / Social Proof */}
          <div className="pt-4 border-t border-border/50 flex flex-wrap items-center justify-center lg:justify-start gap-8 sm:gap-12">
            <div className="group transition-transform hover:-translate-y-1">
              <p className="text-2xl sm:text-3xl font-black text-foreground group-hover:text-emerald-500 transition-colors">10,000+</p>
              <p className="text-xs text-muted-foreground font-semibold">Học viên tham gia</p>
            </div>
            <div className="group transition-transform hover:-translate-y-1">
              <p className="text-2xl sm:text-3xl font-black text-primary">98%</p>
              <p className="text-xs text-muted-foreground font-semibold">Tỷ lệ đạt mục tiêu</p>
            </div>
            <div className="group transition-transform hover:-translate-y-1">
              <p className="text-2xl sm:text-3xl font-black text-teal-500 group-hover:text-cyan-400 transition-colors">24/7</p>
              <p className="text-xs text-muted-foreground font-semibold">Hỗ trợ AI & HLV</p>
            </div>
          </div>
        </div>

        {/* Right Column: Glassmorphism Auth Card */}
        <div className="w-full max-w-md animate-scale-in" style={{ animationDelay: '0.15s' }}>
          <div className="glass rounded-[2.5rem] p-8 sm:p-10 border border-white/30 dark:border-white/10 shadow-2xl relative overflow-hidden">
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-gradient-flow" style={{ backgroundSize: '200% 100%' }} />

            {/* Toggle Switch */}
            <div className="flex p-1.5 rounded-2xl bg-secondary/60 mb-6 border border-border/50 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setShowLogin(true)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 ${
                  showLogin
                    ? 'bg-card text-foreground shadow-md -translate-y-0.5'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 ${
                  !showLogin
                    ? 'bg-card text-foreground shadow-md -translate-y-0.5'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Đăng ký tài khoản
              </button>
            </div>

            {/* Forms with Transition */}
            <div className="transition-all duration-300">
              {showLogin ? (
                <div className="animate-fade-in-up">
                  <div className="mb-4">
                    <h3 className="text-2xl font-black text-foreground">Chào mừng trở lại!</h3>
                    <p className="text-xs text-muted-foreground mt-1">Nhập thông tin đăng nhập để tiếp tục trải nghiệm.</p>
                  </div>
                  <LoginForm />
                </div>
              ) : (
                <div className="animate-fade-in-up">
                  <div className="mb-4">
                    <h3 className="text-2xl font-black text-foreground">Tạo tài khoản mới</h3>
                    <p className="text-xs text-muted-foreground mt-1">Bắt đầu hành trình nâng cao sức khỏe ngay hôm nay.</p>
                  </div>
                  <SignupForm onSuccess={() => setShowLogin(true)} />
                </div>
              )}
            </div>
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
