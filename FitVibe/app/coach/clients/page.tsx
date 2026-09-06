'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { coachApi } from '@/lib/api'
import { toast } from 'sonner'

export default function CoachClientsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'coach')) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role === 'coach') {
      fetchClients()
    }
  }, [user])

  const fetchClients = async () => {
    setIsLoading(true)
    try {
      const data = await coachApi.getClients()
      setClients(data)
    } catch (error) {
      toast.error('Không thể tải danh sách học viên')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || !user || user.role !== 'coach') {
    return null
  }

  const navItems = [
    { label: 'Tổng quan', href: '/coach' },
    { label: 'Danh sách học viên', href: '/coach/clients' },
    { label: 'Lộ trình tập luyện', href: '/coach/routes' },
    { label: 'Bài viết & nội dung', href: '/coach/content' },
    { label: 'Hàng chờ duyệt', href: '/coach/moderation' },
    { label: 'Ví / Rút tiền', href: '/coach/wallet' },
  ]

  const filteredClients = clients.filter(client =>
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Danh sách học viên</h2>
          <p className="text-muted-foreground">Các học viên đang tham gia lộ trình của bạn</p>
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg border-border bg-card"
            />
          </div>
        </div>

        {/* Clients List */}
        <div className="space-y-4">
          {!isLoading && filteredClients.length > 0 ? filteredClients.map((client) => (
            <Card key={client.id} className="p-6 rounded-2xl bg-card border-border hover:border-primary/50 transition-colors shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary border border-primary/20">
                      {client.full_name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{client.full_name}</h3>
                      <p className="text-sm text-muted-foreground italic">{client.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-12 flex-wrap">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Chiều cao</p>
                    <p className="text-sm font-bold text-foreground">{client.height || '--'} cm</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Cân nặng</p>
                    <p className="text-sm font-bold text-foreground">{client.weight || '--'} kg</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Mục tiêu</p>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-accent/20 text-accent uppercase tracking-tighter">
                      {client.goal === 'weight_loss' ? 'Giảm cân' : client.goal === 'muscle_gain' ? 'Tăng cơ' : 'Duy trì'}
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Phát triển</p>
                    <p className="text-[10px] text-muted-foreground">Lúc {new Date(client.join_date).toLocaleDateString('vi-VN')}</p>
                  </div>

                </div>
              </div>
            </Card>
          )) : !isLoading && (
            <Card className="p-12 rounded-2xl bg-card border-border text-center">
              <p className="text-muted-foreground italic">Chưa có học viên nào tham gia lộ trình của bạn.</p>
            </Card>
          )}
          {isLoading && <div className="text-center py-12">Đang tải danh sách học viên...</div>}
        </div>
      </div>
    </DashboardLayout>
  )
}
