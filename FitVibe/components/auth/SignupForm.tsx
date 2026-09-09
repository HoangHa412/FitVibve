'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SignupFormProps {
  onSuccess?: () => void
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const [role, setRole] = useState<'user' | 'coach'>('user')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [certificateFiles, setCertificateFiles] = useState<FileList | null>(null)
  const { signup } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp')
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)

    try {
      if (role === 'coach') {
        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)
        formData.append('full_name', name)
        formData.append('role', 'coach')
        
        if (certificateFiles) {
          Array.from(certificateFiles).forEach((file: any) => {
            formData.append('certificates', file);
          });
        }
        
        await signup(formData)
      } else {
        await signup({ email, password, full_name: name, role: 'user' })
      }
      
      // Switch to login tab instead of redirecting
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Họ và tên</label>
        <Input
          type="text"
          placeholder="Nguyễn Văn A"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {/* Role selector */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Đăng ký dạng</label>
        <div className="grid grid-cols-2 gap-3 mb-2">
          {[
            { value: 'user', label: 'Người dùng', icon: '👤' },
            { value: 'coach', label: 'Huấn luyện viên', icon: '👨‍🏫' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRole(option.value as 'user' | 'coach')}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                role === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary/10 hover:border-primary/50'
              }`}
            >
              <div className="text-2xl mb-1">{option.icon}</div>
              <div className="text-sm font-medium text-foreground">{option.label}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Huấn luyện viên cần được duyệt bởi quản trị viên trước khi hoạt động.</p>
      </div>
 
      {role === 'coach' && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="text-sm font-medium text-foreground block mb-2">Bằng cấp / CV (Đính kèm ảnh/PDF)</label>
          <div className="relative group">
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={(e) => setCertificateFiles(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              required={role === 'coach'}
              disabled={loading}
            />
            <div className={`p-4 border-2 border-dashed rounded-xl transition-all text-center ${
              certificateFiles ? 'border-primary bg-primary/5' : 'border-border bg-secondary/10 group-hover:border-primary/50'
            }`}>
              <span className="text-2xl mb-2 block">📁</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {certificateFiles ? `${certificateFiles.length} tệp đã chọn` : 'Chọn ảnh hoặc file PDF (Tối đa 5)'}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 italic">Đính kèm bằng cấp, chứng chỉ hoặc CV của bạn để Admin duyệt.</p>
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Email</label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Mật khẩu</label>
        <Input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Xác nhận mật khẩu</label>
        <Input
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
      </Button>
    </form>
  )
}
