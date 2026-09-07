'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { API_BASE_URL } from '@/lib/api'

interface Post {
  id: number;
  title: string;
  author: string;
  coach_id: number;
  status: string;
  created_at: string;
  reports: number;
}

export default function AdminPostsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [stats, setStats] = useState({ new_posts_month: 0 })

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === 'admin') {
      const fetchPostsData = async () => {
        try {
          const token = localStorage.getItem('fitvibe-token')
          const headers = { Authorization: `Bearer ${token}` }

          const postsRes = await fetch(`${API_BASE_URL}/api/admin/pending-posts`, { headers })
          if (postsRes.ok) {
            setPosts(await postsRes.json())
          }

          const statsRes = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers })
          if (statsRes.ok) {
            setStats(await statsRes.json())
          }
        } catch (error) {
          console.error("Error fetching admin posts:", error)
        } finally {
          setIsDataLoading(false)
        }
      }

      fetchPostsData()
    }
  }, [user])

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

  const handleApprove = async (id: number) => {
    try {
      const token = localStorage.getItem('fitvibe-token')
      const res = await fetch(`${API_BASE_URL}/api/admin/posts/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'approved' })
      })
      if (res.ok) {
        setPosts(posts.filter((post: Post) => post.id !== id))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleReject = async (id: number) => {
    try {
      const token = localStorage.getItem('fitvibe-token')
      const res = await fetch(`${API_BASE_URL}/api/admin/posts/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      })
      if (res.ok) {
        setPosts(posts.filter((post: Post) => post.id !== id))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Duyệt bài viết</h2>
          <p className="text-muted-foreground">Quản lý bài viết từ huấn luyện viên</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Chờ duyệt', value: isDataLoading ? '...' : posts.length, color: 'text-yellow-600' },
            { label: 'Bài báo cáo', value: 0, color: 'text-destructive' },
            { label: 'Bài viết tháng nay', value: isDataLoading ? '...' : stats.new_posts_month, color: 'text-primary' },
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 rounded-lg bg-card border-border">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Posts List */}
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post: Post) => (
              <Card key={post.id} className="p-6 rounded-2xl bg-card border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg mb-2">{post.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>Tác giả: {post.author || 'HLV'}</span>
                      <span>{new Date(post.created_at).toLocaleString('vi-VN')}</span>
                      {post.reports > 0 && (
                        <span className="px-2 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-semibold">
                          {post.reports} báo cáo
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      className="rounded-lg"
                      onClick={() => handleApprove(post.id)}
                    >
                      Phê duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => handleReject(post.id)}
                    >
                      Từ chối
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 rounded-2xl bg-card border-border text-center">
            {isDataLoading ? (
              <p className="text-lg font-semibold text-foreground mb-2">Đang tải...</p>
            ) : (
              <>
                <div className="text-4xl mb-4">✓</div>
                <p className="text-lg font-semibold text-foreground mb-2">Không có bài viết chờ duyệt</p>
                <p className="text-muted-foreground">Tất cả bài viết đã được xử lý</p>
              </>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
