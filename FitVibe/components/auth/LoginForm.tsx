'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await login(email, password) as any
      // Redirect based on role
      const role = data?.user?.role || 'user'
      const path = role === 'admin' ? '/admin' : role === 'coach' ? '/coach' : '/dashboard'
      router.push(path)
    } catch (err: any) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Email</label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="h-11 rounded-xl bg-secondary/30"
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Mật khẩu</label>
        <Input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          className="h-11 rounded-xl bg-secondary/30"
        />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-12 rounded-xl font-black text-sm uppercase tracking-wider btn-premium shadow-lg shadow-primary/20"
        disabled={loading}
      >
        {loading ? 'Đang xác thực...' : 'Đăng nhập ngay →'}
      </Button>
    </form>
  )
}
