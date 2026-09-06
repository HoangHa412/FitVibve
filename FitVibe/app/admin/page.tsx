'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { adminApi, API_BASE_URL } from '@/lib/api'

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [stats, setStats] = useState({ total_users: 0, new_posts_month: 0 })
  const [pendingPosts, setPendingPosts] = useState<any[]>([])
  const [pendingCoaches, setPendingCoaches] = useState<any[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === 'admin') {
      const fetchDashboardData = async () => {
        try {
          const [statsData, postsData, coachesData] = await Promise.all([
            adminApi.getStats(),
            adminApi.getPendingPosts(),
            adminApi.getPendingCoaches(),
          ])
          setStats(statsData)
          setPendingPosts(postsData as any[])
          setPendingCoaches(coachesData as any[])
        } catch (error) {
          console.error("Error fetching admin data:", error)
        } finally {
          setIsDataLoading(false)
        }
      }

      fetchDashboardData()
    }
  }, [user])

  const handleApprove = async (postId: number) => {
    try {
      await adminApi.updatePostStatus(postId, 'approved')
      setPendingPosts(prev => prev.filter(post => post.id !== postId))
    } catch (error) {
      console.error(error)
    }
  }

  const handleReject = async (postId: number) => {
    try {
      await adminApi.updatePostStatus(postId, 'rejected')
      setPendingPosts(prev => prev.filter(post => post.id !== postId))
    } catch (error) {
      console.error(error)
    }
  }

  const handleApproveCoach = async (coachId: number) => {
    try {
      await adminApi.updateUserStatus(coachId, 'active')
      setPendingCoaches(prev => prev.filter(c => c.id !== coachId))
    } catch (error) {
      console.error(error)
    }
  }

  const handleRejectCoach = async (coachId: number) => {
    try {
      await adminApi.updateUserStatus(coachId, 'locked')
      setPendingCoaches(prev => prev.filter(c => c.id !== coachId))
    } catch (error) {
      console.error(error)
    }
  }

  if (loading || !user || user.role !== 'admin') {
    return null
  }

  const navItems = [
    { label: 'Tổng quan', href: '/admin' },
    { label: 'Quản lý thành viên', href: '/admin/members' },
    { label: 'Duyệt bài viết', href: '/admin/posts' },
    { label: 'Quản lý danh mục', href: '/admin/categories' },
    { label: 'Báo cáo & thống kê', href: '/admin/reports' },
    { label: 'Duyệt Rút Tiền', href: '/admin/withdrawals' },
  ]

  return (
    <>
    <DashboardLayout navItems={navItems}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Quản lý hệ thống</h2>
            <p className="text-muted-foreground">Tổng quan và kiểm soát nền tảng</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tổng thành viên', value: isDataLoading ? '...' : stats.total_users, status: 'Trong hệ thống' },
            { label: 'Bài viết chờ duyệt', value: isDataLoading ? '...' : pendingPosts.length, status: 'Cần kiểm tra' },
            { label: 'Bài viết tháng nay', value: isDataLoading ? '...' : stats.new_posts_month, status: 'Bài viết mới' },
            { label: 'Hệ thống', value: 'API', status: 'Hoạt động tốt' },
          ].map((stat, idx) => (
            <Card key={idx} className="p-6 rounded-2xl bg-gradient-to-br from-card to-secondary/5 border-border">
              <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-accent mt-2">{stat.status}</p>
            </Card>
          ))}
        </div>

        {/* Admin Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Content */}
          <Card className="p-6 rounded-2xl bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Bài viết chờ duyệt</h3>
              <span className="px-2 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-semibold">{pendingPosts.length}</span>
            </div>

            {pendingPosts.length === 0 && !isDataLoading && (
              <p className="text-sm text-muted-foreground text-center py-4">Không có bài viết nào đang chờ duyệt.</p>
            )}

            <div className="space-y-3">
              {pendingPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                  <div>
                    <p className="text-sm font-medium text-foreground">{post.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">Lúc {new Date(post.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => handleApprove(post.id)}>Phê duyệt</Button>
                    <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => handleReject(post.id)}>Từ chối</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
 
          {/* Pending Coaches */}
          <Card className="p-6 rounded-2xl bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Duyệt Huấn luyện viên</h3>
              <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">{pendingCoaches.length}</span>
            </div>
 
            {pendingCoaches.length === 0 && !isDataLoading && (
              <p className="text-sm text-muted-foreground text-center py-4">Không có HLV nào đang chờ duyệt.</p>
            )}
 
            <div className="space-y-4">
              {pendingCoaches.map((coach) => (
                <div key={coach.id} className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-foreground">{coach.full_name}</p>
                      <p className="text-xs text-muted-foreground">{coach.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-8" onClick={() => handleApproveCoach(coach.id)}>Duyệt</Button>
                      <Button size="sm" variant="ghost" className="h-8 text-destructive" onClick={() => handleRejectCoach(coach.id)}>Từ chối</Button>
                    </div>
                  </div>
                  
                  {coach.certificates && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {coach.certificates.split(',').map((url: string, idx: number) => (
                        <div 
                          key={idx}
                          onClick={() => setSelectedImage(`${API_BASE_URL}${url}`)}
                          className="group relative w-16 h-16 rounded-lg overflow-hidden border border-border hover:border-primary transition-all shadow-sm cursor-zoom-in"
                          title="Click để phóng to"
                        >
                          <img 
                            src={`${API_BASE_URL}${url}`} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                            alt={`Cert ${idx + 1}`}
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">Phóng to</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!coach.certificates && (
                    <p className="text-[10px] text-destructive italic mt-1">⚠️ Không tìm thấy bằng cấp đính kèm</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 rounded-2xl bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 items-center justify-center border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => router.push('/admin/withdrawals')}
              >
                <span className="text-2xl">💰</span>
                <span className="text-xs font-semibold">Duyệt rút tiền</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 items-center justify-center border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => router.push('/admin/members')}
              >
                <span className="text-2xl">👥</span>
                <span className="text-xs font-semibold">Quản lý thành viên</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 items-center justify-center border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => router.push('/admin/posts')}
              >
                <span className="text-2xl">📝</span>
                <span className="text-xs font-semibold">Duyệt bài viết</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 items-center justify-center border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => router.push('/admin/categories')}
              >
                <span className="text-2xl">📁</span>
                <span className="text-xs font-semibold">Quản lý danh mục</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 items-center justify-center border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => router.push('/admin/reports')}
              >
                <span className="text-2xl">📊</span>
                <span className="text-xs font-semibold">Xem báo cáo</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>

    </DashboardLayout>

    {/* Image Preview Modal - Smaller & Contained */}
    {selectedImage && (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 animate-in fade-in duration-300"
        onClick={() => setSelectedImage(null)}
      >
        <div className="relative max-w-2xl w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
          <Button 
            variant="ghost" 
            className="absolute -top-12 right-0 text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
            onClick={() => setSelectedImage(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </Button>
          <div className="bg-card p-2 rounded-2xl shadow-2xl border border-border/50">
            <img 
              src={selectedImage} 
              className="max-w-full max-h-[75vh] object-contain rounded-xl" 
              alt="Preview" 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <p className="mt-4 text-white/60 text-xs font-medium bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
            Bấm ra ngoài hoặc nút X để đóng
          </p>
        </div>
      </div>
    )}
    </>
  )
}
