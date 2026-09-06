'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(true)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <span className="text-3xl">💚</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">FitVibe</h1>
          <p className="text-muted-foreground">Hành trình sức khỏe của bạn bắt đầu từ đây</p>
        </div>

        {/* Forms */}
        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          {showLogin ? (
            <>
              <LoginForm />
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Chưa có tài khoản?{' '}
                  <button
                    onClick={() => setShowLogin(false)}
                    className="font-semibold text-primary hover:text-accent transition-colors"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <SignupForm onSuccess={() => setShowLogin(true)} />
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Đã có tài khoản?{' '}
                  <button
                    onClick={() => setShowLogin(true)}
                    className="font-semibold text-primary hover:text-accent transition-colors"
                  >
                    Đăng nhập
                  </button>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Features Footer */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-xs text-muted-foreground font-medium">Theo dõi sức khỏe</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🏋️</div>
            <p className="text-xs text-muted-foreground font-medium">Kế hoạch tập luyện</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">👨‍🏫</div>
            <p className="text-xs text-muted-foreground font-medium">Hướng dẫn chuyên gia</p>
          </div>
        </div>
      </div>
    </div>
  )
}
