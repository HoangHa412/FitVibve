'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { userApi } from '@/lib/api'
import { toast } from 'sonner'

export default function WeightTrackingPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [weight, setWeight] = useState('')
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'user')) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role === 'user') {
      fetchLogs()
    }
  }, [user])

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const data = await userApi.getWeightLogs()
      setLogs(data.reverse())
    } catch (error) {
      toast.error('Không thể tải lịch sử cân nặng')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!weight) return
    try {
      await userApi.logWeight(parseFloat(weight))
      toast.success('Ghi nhận cân nặng thành công')
      setWeight('')
      fetchLogs()
    } catch (error) {
      toast.error('Lỗi khi lưu cân nặng')
    }
  }

  if (authLoading || !user || user.role !== 'user') {
    return null
  }

  const navItems = [
    { label: 'Tổng quan', href: '/dashboard' },
    { label: 'Chỉ số sức khỏe', href: '/dashboard/health' },
    { label: 'Theo dõi cân nặng', href: '/dashboard/weight' },
    { label: 'Kế hoạch tập luyện', href: '/dashboard/workouts' },
    { label: 'Kế hoạch dinh dưỡng', href: '/dashboard/meals' },
    { label: 'Lộ trình tập luyện', href: '/dashboard/routes' },
    { label: 'Mục yêu thích', href: '/dashboard/bookmarks' },
    { label: 'Đội ngũ HLV', href: '/dashboard/coaches' },
  ]

  const currentWeight = logs[0]?.weight || '--'
  const prevWeight = logs[1]?.weight || logs[0]?.weight
  const change = prevWeight ? (logs[0]?.weight - logs[1]?.weight).toFixed(1) : '0'

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Theo dõi cân nặng</h2>
          <p className="text-muted-foreground">Ghi lại cân nặng hàng ngày để theo dõi tiến độ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Weight Form */}
          <Card className="p-6 rounded-2xl bg-card border-border lg:col-span-1">
            <h3 className="text-lg font-bold text-foreground mb-4">Ghi nhận mới</h3>
            <form onSubmit={handleAddWeight} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-2">Cân nặng hiện tại (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="VD: 70.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full h-11">
                Lưu ghi chép
              </Button>
            </form>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t border-border space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cân nặng gần nhất</p>
                <p className="text-4xl font-bold text-foreground">{currentWeight} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cập nhật cuối</p>
                  <p className="text-sm font-bold text-foreground">{logs[0] ? new Date(logs[0].logged_at).toLocaleDateString('vi-VN') : '--'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Thay đổi</p>
                  <p className={`text-sm font-bold ${parseFloat(change) <= 0 ? 'text-accent' : 'text-destructive'}`}>
                    {parseFloat(change) > 0 ? '+' : ''}{change} kg
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Weight History */}
          <Card className="p-6 rounded-2xl bg-card border-border lg:col-span-2">
            <h3 className="text-lg font-bold text-foreground mb-4">Lịch sử ghi chép</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {!isLoading && logs.length > 0 ? logs.map((entry, idx) => {
                const diff = idx < logs.length - 1 ? (entry.weight - logs[idx + 1].weight).toFixed(1) : '0'
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/15 border border-border/50 hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-lg">
                        {parseFloat(diff) <= 0 ? '📉' : '📈'}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{entry.weight} kg</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{new Date(entry.logged_at).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${parseFloat(diff) <= 0 ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
                      {parseFloat(diff) > 0 ? '+' : ''}{diff} kg
                    </span>
                  </div>
                )
              }) : !isLoading && (
                <div className="py-20 text-center opacity-50">
                  <p className="text-sm italic">Chưa có dữ liệu cân nặng.</p>
                </div>
              )}
              {isLoading && <div className="text-center py-20 text-sm">Đang tải...</div>}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
