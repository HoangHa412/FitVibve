'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Eye, Flame, Video, CheckCircle2, XCircle } from 'lucide-react'
import { API_BASE_URL } from '@/lib/api'

interface Post {
  id: number;
  title: string;
  author: string;
  coach_id: number;
  category_id?: number;
  category_name?: string;
  content?: string;
  video_url?: string;
  calories_info?: number;
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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

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

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

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
        if (selectedPost?.id === id) {
          setSelectedPost(null)
        }
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
        if (selectedPost?.id === id) {
          setSelectedPost(null)
        }
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
          <p className="text-muted-foreground">Quản lý và kiểm duyệt nội dung bài viết từ các huấn luyện viên</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Chờ duyệt', value: isDataLoading ? '...' : posts.length, color: 'text-amber-500' },
            { label: 'Bài báo cáo', value: 0, color: 'text-destructive' },
            { label: 'Bài viết tháng nay', value: isDataLoading ? '...' : stats.new_posts_month, color: 'text-primary' },
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 rounded-xl bg-card border-border shadow-xs">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Posts List */}
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post: Post) => (
              <Card 
                key={post.id} 
                onClick={() => setSelectedPost(post)}
                className="p-6 rounded-2xl bg-card border-border hover:border-primary/50 transition-all cursor-pointer group hover:shadow-md"
              >
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {post.category_name && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {post.category_name}
                        </span>
                      )}
                      {post.calories_info ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center gap-1">
                          <Flame className="w-3 h-3" /> {post.calories_info} kcal
                        </span>
                      ) : null}
                      {post.video_url && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1">
                          <Video className="w-3 h-3" /> Có video đính kèm
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-foreground text-lg mb-1.5 group-hover:text-primary transition-colors flex items-center gap-2">
                      {post.title}
                      <span className="text-xs font-normal text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Bấm để xem nội dung
                      </span>
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                      <span>Tác giả: <strong className="text-foreground font-semibold">{post.author || 'HLV'}</strong></span>
                      <span>🕒 {new Date(post.created_at).toLocaleString('vi-VN')}</span>
                      {post.reports > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-[11px] font-bold">
                          {post.reports} báo cáo
                        </span>
                      )}
                    </div>

                    {post.content && (
                      <p className="text-xs text-muted-foreground line-clamp-2 bg-secondary/30 p-2.5 rounded-xl border border-border/40">
                        {post.content}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-border/40" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-xl text-xs font-semibold"
                      onClick={() => setSelectedPost(post)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Xem bài viết
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs"
                      onClick={() => handleApprove(post.id)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Phê duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-xl font-bold text-xs"
                      onClick={() => handleReject(post.id)}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Từ chối
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

        {/* Modal chi tiết nội dung bài viết */}
        <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
          <DialogContent className="max-w-3xl max-h-[88vh] flex flex-col p-6 rounded-3xl overflow-hidden bg-card border border-border shadow-2xl">
            {selectedPost && (
              <>
                <DialogHeader className="pb-3 border-b border-border/50 shrink-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {selectedPost.category_name && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                        {selectedPost.category_name}
                      </span>
                    )}
                    {selectedPost.calories_info ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> {selectedPost.calories_info} kcal
                      </span>
                    ) : null}
                    <span className="text-xs text-muted-foreground ml-auto">
                      🕒 {new Date(selectedPost.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <DialogTitle className="text-xl font-black text-foreground leading-snug">
                    {selectedPost.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    Huấn luyện viên phụ trách: <span className="font-semibold text-foreground">{selectedPost.author || 'HLV'}</span>
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-4">
                  {/* Video Section if available */}
                  {selectedPost.video_url && (
                    <div className="rounded-2xl overflow-hidden border border-border/60 bg-black/40 p-2">
                      {getYouTubeEmbedUrl(selectedPost.video_url) ? (
                        <iframe
                          src={getYouTubeEmbedUrl(selectedPost.video_url)!}
                          className="w-full aspect-video rounded-xl"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : selectedPost.video_url.endsWith('.mp4') || selectedPost.video_url.startsWith('/uploads') ? (
                        <video
                          src={selectedPost.video_url}
                          controls
                          className="w-full max-h-80 rounded-xl"
                        />
                      ) : (
                        <div className="p-4 text-center">
                          <a
                            href={selectedPost.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-primary hover:underline flex items-center justify-center gap-2"
                          >
                            <Video className="w-4 h-4" /> Mở liên kết video đính kèm bài viết ↗
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Article Full Content */}
                  <div className="p-5 rounded-2xl bg-secondary/25 border border-border/40">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <span>📝</span> Nội dung chi tiết bài viết
                    </h4>
                    <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                      {selectedPost.content || 'Bài viết chưa có nội dung văn bản.'}
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between shrink-0">
                  <Button
                    variant="outline"
                    className="rounded-xl text-xs"
                    onClick={() => setSelectedPost(null)}
                  >
                    Đóng
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      className="rounded-xl text-xs px-4 font-bold"
                      onClick={() => handleReject(selectedPost.id)}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Từ chối
                    </Button>
                    <Button
                      className="rounded-xl text-xs px-4 bg-green-600 hover:bg-green-700 text-white font-bold"
                      onClick={() => handleApprove(selectedPost.id)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Phê duyệt bài viết
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

