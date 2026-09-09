'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { userApi } from '@/lib/api'
import { toast } from 'sonner'

export default function SetupProfile() {
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const [role, setRole] = useState<'user' | 'coach'>('user')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) {
    router.push('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (role === 'user') {
        await userApi.updateProfile({
          height: height ? parseFloat(height) : null,
          weight: weight ? parseFloat(weight) : null,
          age: age ? parseInt(age) : null,
        })
      }
      await refreshUser()
      toast.success('Thiết lập hồ sơ thành công!')
      const destination = role === 'coach' ? '/coach' : '/dashboard'
      router.push(destination)
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu hồ sơ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Hoàn thành hồ sơ</h1>
          <p className="text-muted-foreground">Cho chúng tôi biết thêm về bạn</p>
        </div>

        <Card className="bg-card rounded-2xl p-8 border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-3">Bạn là ai?</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'user', label: 'Người dùng', icon: '👤' },
                  { value: 'coach', label: 'Huấn luyện viên', icon: '👨‍🏫' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value as 'user' | 'coach')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      role === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-secondary/20 hover:border-primary/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <p className="text-sm font-medium text-foreground">{option.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Health Metrics */}
            {role === 'user' && (
              <div className="space-y-4 p-4 rounded-lg bg-secondary/10">
                <h3 className="font-semibold text-foreground">Chỉ số sức khỏe</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Chiều cao (cm)</label>
                    <Input
                      type="number"
                      placeholder="170"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      required={role === 'user'}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Cân nặng (kg)</label>
                    <Input
                      type="number"
                      placeholder="70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required={role === 'user'}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Tuổi</label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required={role === 'user'}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Tiếp tục'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
