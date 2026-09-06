'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { coachApi } from '@/lib/api'
import { toast } from 'sonner'

export default function CoachDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    total_posts: 0,
    published_posts: 0,
    pending_posts: 0,
    pending_submissions: 0,
    total_clients: 0,
    balance: 0
  })
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'coach')) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role === 'coach') {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const [statsData, postsData, submissionsData] = await Promise.all([
        coachApi.getStats(),
        coachApi.getMyPosts(),
        coachApi.getSubmissions()
      ])
      setStats(statsData)
      setRecentPosts(postsData.slice(0, 5))
      setSubmissions(submissionsData.filter(s => s.status === 'submitted').slice(0, 5))
    } catch (error) {
      console.error('Error fetching coach dashboard:', error)
      toast.error('Không thể tải dữ liệu bảng điều khiển')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await coachApi.evaluateSubmission(id, 'passed', 'Rất tốt! Duyệt.')
      toast.success('Đã phê duyệt')
      fetchDashboardData()
    } catch (error) {
      toast.error('Thất bại')
    }
  }

  const handleReject = async (id: number) => {
    try {
      await coachApi.evaluateSubmission(id, 'failed', 'Cần cố gắng hơn.')
      toast.success('Đã từ chối')
      fetchDashboardData()
    } catch (error) {
      toast.error('Thất bại')
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

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Bảng điều khiển huấn luyện viên</h2>
            <p className="text-muted-foreground">Chào mừng trở lại, {user.name}</p>
          </div>
          <Button className="rounded-lg" onClick={() => router.push('/coach/content')}>+ Tạo nội dung mới</Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Doanh thu', value: Math.floor(stats.balance || 0).toLocaleString('vi-VN') + 'đ', status: 'Ví tiền', color: 'text-primary' },
            { label: 'Tổng học viên', value: stats.total_clients, status: 'Tích cực' },
            { label: 'Tổng bài viết', value: stats.total_posts, status: 'Nội dung' },
            { label: 'Đã xuất bản', value: stats.published_posts, status: 'Công khai' },
            { label: 'Bài nộp chờ duyệt', value: stats.pending_submissions || 0, status: 'Bài tập' },
          ].map((stat, idx) => (
            <Card key={idx} className="p-6 rounded-2xl bg-gradient-to-br from-card to-secondary/5 border-border shadow-sm">
              <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider opacity-60">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color || 'text-foreground'}`}>{isLoading ? '...' : stat.value}</p>
              <p className="text-[10px] font-bold text-accent mt-2 uppercase tracking-widest">{stat.status}</p>
            </Card>
          ))}
        </div>

        {/* Recent Content & Moderation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Articles */}
          <Card className="p-6 rounded-2xl bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Bài viết gần đây</h3>
            <div className="space-y-3">
              {recentPosts.length > 0 ? recentPosts.map((post, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                  <div>
                    <p className="text-sm font-medium text-foreground line-clamp-1">{post.title}</p>
                    <p className={`text-xs mt-1 ${post.status === 'approved' ? 'text-accent' : post.status === 'pending' ? 'text-yellow-600' : 'text-destructive'}`}>
                      {post.status === 'approved' ? 'Đã xuất bản' : post.status === 'pending' ? 'Chờ duyệt' : 'Bị từ chối'}
                    </p>
                  </div>
                  <span className="text-lg">📝</span>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">Bạn chưa có bài viết nào.</p>
              )}
            </div>
            <Button variant="link" className="w-full mt-4 text-xs" onClick={() => router.push('/coach/content')}>Xem tất cả</Button>
          </Card>

          {/* Pending Approval */}
          <Card className="p-6 rounded-2xl bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Học viên chờ duyệt</h3>
            <div className="space-y-3">
              {submissions.length > 0 ? submissions.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.user_name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{item.route_title} / {item.stage_title}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => handleApprove(item.id)}>Duyệt</Button>
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => handleReject(item.id)}>X</Button>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">Không có bài nộp nào đang chờ.</p>
              )}
            </div>
            <Button variant="link" className="w-full mt-4 text-xs" onClick={() => router.push('/coach/moderation')}>Xem hàng chờ</Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
