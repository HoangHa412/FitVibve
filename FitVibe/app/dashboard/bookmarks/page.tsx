'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { userApi, API_BASE_URL, isYoutubeUrl } from '@/lib/api'
import { toast } from 'sonner'
import { SecureVideoPlayer } from '@/components/SecureVideoPlayer'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchBookmarks()
    }
  }, [user])

  const fetchBookmarks = async () => {
    setIsLoading(true)
    try {
      const data = await userApi.getBookmarks()
      setBookmarks(data)
    } catch (error) {
      toast.error('Không thể tải danh sách yêu thích')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleBookmark = async (id: number) => {
    try {
      await userApi.toggleBookmark(id)
      toast.success('Đã xóa khỏi mục yêu thích')
      setBookmarks(prev => prev.filter(b => b.id !== id))
      if (isDetailOpen && selectedPost?.id === id) {
        setIsDetailOpen(false)
      }
    } catch (error) {
      toast.error('Thao tác thất bại')
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  const handlePostClick = (post: any) => {
    setSelectedPost(post)
    setIsDetailOpen(true)
    userApi.incrementPostView(post.id).catch(console.error)
  }

  if (authLoading || !user) return null

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

  const dietItems = bookmarks.filter(b => b.category_type === 'diet')
  const workoutItems = bookmarks.filter(b => b.category_type === 'workout')

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-6xl mx-auto space-y-10 pb-20">
        <section className="relative overflow-hidden p-8 sm:p-12 rounded-[3rem] bg-gradient-to-br from-emerald-600 via-green-600 to-teal-500 text-white shadow-2xl shadow-emerald-200/20 animate-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-white">
              Thư viện <span className="opacity-80 italic">Yêu thích.</span>
            </h2>
            <p className="text-white/80 text-lg font-medium">
              Nơi lưu giữ những thực đơn và bài tập tâm huyết nhất của bạn.
            </p>
          </div>
        </section>

        {/* Tabs style headers */}
        <div className="space-y-12">
          {dietItems.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-2xl text-2xl">🥦</div>
                <h3 className="text-2xl font-black text-foreground">Thực đơn đã lưu</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dietItems.map((post, idx) => (
                  <BookmarkCard key={post.id} post={post} onClick={handlePostClick} />
                ))}
              </div>
            </div>
          )}

          {workoutItems.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-2xl">🏋️</div>
                <h3 className="text-2xl font-black text-foreground">Bài tập đã lưu</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {workoutItems.map((post, idx) => (
                  <BookmarkCard key={post.id} post={post} onClick={handlePostClick} isWorkout />
                ))}
              </div>
            </div>
          )}

          {!isLoading && bookmarks.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-4xl mb-6 opacity-50">
                🔖
              </div>
              <p className="text-xl font-bold text-muted-foreground italic">Bạn chưa lưu mục yêu thích nào.</p>
              <div className="flex gap-4 mt-6">
                <Button onClick={() => router.push('/dashboard/meals')} variant="outline" className="rounded-xl font-bold">Tìm thực đơn</Button>
                <Button onClick={() => router.push('/dashboard/workouts')} variant="outline" className="rounded-xl font-bold">Tìm bài tập</Button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="py-40 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Đang tải thư viện...</p>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-none sm:rounded-[3rem] overflow-hidden">
            {selectedPost && (
              <div className="bg-card w-full max-h-[92vh] overflow-y-auto custom-scrollbar">
                <div className="h-3 bg-gradient-to-r from-emerald-500 to-teal-600" />
                <div className="p-8 sm:p-12">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-emerald-500/20">
                          {selectedPost.category_name}
                        </span>
                      </div>
                      <DialogTitle className="text-4xl font-black tracking-tight leading-tight">{selectedPost.title}</DialogTitle>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border border-border bg-muted overflow-hidden">
                          {selectedPost.coach_avatar ? (
                            <img src={`${API_BASE_URL}${selectedPost.coach_avatar}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-emerald-600">{selectedPost.coach_name?.charAt(0)}</div>
                          )}
                        </div>
                        <p className="text-sm font-bold italic opacity-70">Từ {selectedPost.coach_name}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 text-center min-w-[120px]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Dinh dưỡng/Calo</p>
                      <p className="text-2xl font-black text-emerald-600">{selectedPost.calories_info}<span className="text-xs ml-1">kcal</span></p>
                    </div>
                  </div>

                  <div className="space-y-10">
                    {selectedPost.video_url && (
                      <div className="aspect-video rounded-[2.5rem] overflow-hidden border border-border bg-black shadow-2xl">
                        {isYoutubeUrl(selectedPost.video_url) ? (
                          <iframe
                            width="100%"
                            height="100%"
                            src={getYouTubeEmbedUrl(selectedPost.video_url)!}
                            title="Video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          ></iframe>
                        ) : (
                          <SecureVideoPlayer filename={selectedPost.video_url} className="w-full h-full" />
                        )}
                      </div>
                    )}
                    <div className="space-y-6">
                      <h5 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-600">Nội dung chi tiết</h5>
                      <div className="p-8 rounded-[2rem] bg-secondary/30 border border-border/50 text-foreground whitespace-pre-wrap font-medium">
                        {selectedPost.content}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button
                        onClick={() => handleToggleBookmark(selectedPost.id)}
                        variant="destructive"
                        className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/10"
                      >
                        🗑️ Xóa khỏi yêu thích
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsDetailOpen(false)}
                        className="h-16 rounded-2xl border-2 font-black uppercase tracking-widest text-xs px-10"
                      >
                        Đóng
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

function BookmarkCard({ post, onClick, isWorkout = false }: { post: any, onClick: (p: any) => void, isWorkout?: boolean }) {
  return (
    <div
      className="group relative cursor-pointer animate-in"
      onClick={() => onClick(post)}
    >
      <div className={`absolute inset-0 bg-gradient-to-tr ${isWorkout ? 'from-primary/20 to-indigo-500/20' : 'from-accent/20 to-primary/20'} rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <Card className="relative overflow-hidden p-0 border-border/50 bg-card hover:border-indigo-500/30 transition-all duration-500 rounded-[2.5rem] flex flex-col h-full shadow-sm hover:shadow-2xl hover:-translate-y-2">
        <div className="p-8 pb-0">
          <div className="flex items-center justify-between mb-6">
            <span className={`px-4 py-1.5 rounded-full ${isWorkout ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'} text-[10px] font-black uppercase tracking-widest border border-current/10`}>
              {post.category_name}
            </span>
            <div className={`w-10 h-10 rounded-2xl ${isWorkout ? 'bg-primary/10 group-hover:bg-primary' : 'bg-accent/10 group-hover:bg-accent'} flex items-center justify-center text-xl group-hover:text-white transition-colors`}>
              {isWorkout ? '🏋️' : '🥗'}
            </div>
          </div>
          <h4 className="font-black text-2xl text-foreground mb-4 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
            {post.title}
          </h4>
          <p className="text-sm text-muted-foreground mb-8 line-clamp-3 leading-relaxed font-medium opacity-70">
            {post.content}
          </p>
        </div>

        <div className="mt-auto p-8 pt-6 bg-indigo-500/5 border-t border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm">
              {post.coach_avatar ? (
                <img src={`${API_BASE_URL}${post.coach_avatar}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-emerald-600">{post.coach_name?.charAt(0)}</div>
              )}
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-black opacity-50">Coach</p>
              <p className="text-xs font-black text-foreground">{post.coach_name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-black ${isWorkout ? 'text-primary' : 'text-accent'}`}>{post.calories_info}</p>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">kcal</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
