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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function WorkoutsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [enrolledOnly, setEnrolledOnly] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchWorkouts()
    }
  }, [user, searchTerm, enrolledOnly])

  const fetchWorkouts = async () => {
    setIsLoading(true)
    try {
      const data = await userApi.getPosts(undefined, searchTerm, enrolledOnly)
      const workoutPosts = data.filter((p: any) => p.category_type === 'workout')
      setPosts(workoutPosts)
    } catch (error) {
      toast.error('Không thể tải danh sách bài tập')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleBookmark = async (id: number) => {
    try {
      const res = await userApi.toggleBookmark(id)
      toast.success(res.message === 'Bookmark added' ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích')
      
      // Update local state
      setPosts(prev => prev.map(p => p.id === id ? { ...p, is_bookmarked: !p.is_bookmarked } : p))
      if (selectedPost && selectedPost.id === id) {
        setSelectedPost((prev: any) => ({ ...prev, is_bookmarked: !prev.is_bookmarked }))
      }
    } catch (error) {
      toast.error('Thao tác thất bại')
    }
  }

  const handleUnlock = async (id: number, type: 'post' | 'route', price: number) => {
    if (!confirm(`Bạn có đồng ý trả ${price.toLocaleString('vi-VN')}đ để mở khóa nội dung này không?`)) return
    try {
      await userApi.purchaseContent(id, type, price)
      toast.success('Đã mở khóa nội dung!')
      fetchWorkouts()
      setIsDetailOpen(false)
    } catch (error: any) {
      toast.error(error?.message || 'Mở khóa thất bại')
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

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-6xl mx-auto space-y-10 pb-20">
        {/* Hero / Header Section */}
        <section className="relative overflow-hidden p-8 sm:p-12 rounded-[3rem] bg-gradient-to-br from-primary via-primary/80 to-accent text-primary-foreground shadow-2xl shadow-primary/20 animate-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                Sức mạnh từ <span className="text-white/80">Kỷ luật.</span>
              </h2>
              <p className="text-primary-foreground/80 text-lg font-medium">
                Khám phá hàng trăm bài tập chuyên sâu từ các huấn luyện viên hàng đầu của chúng tôi.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Tìm bài tập..."
                  className="w-full sm:w-64 bg-white/20 border border-white/30 rounded-2xl px-5 py-4 pl-12 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all backdrop-blur-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-70">🔍</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-8 flex items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative w-12 h-6 bg-white/20 rounded-full border border-white/30 backdrop-blur-md transition-all group-hover:bg-white/30">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={enrolledOnly}
                  onChange={(e) => setEnrolledOnly(e.target.checked)}
                />
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${enrolledOnly ? 'translate-x-6' : 'translate-x-0 shadow-sm'}`} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/90">HLV của tôi</span>
            </label>
          </div>
        </section>

        {/* Workout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {!isLoading && posts.length > 0 ? posts.map((post, idx) => (
            <div
              key={post.id}
              className="group relative cursor-pointer animate-in"
              style={{ animationDelay: `${idx * 0.05}s` }}
              onClick={() => handlePostClick(post)}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative overflow-hidden p-0 border-border/50 bg-card hover:border-primary/30 transition-all duration-500 rounded-[2.5rem] flex flex-col h-full shadow-sm hover:shadow-2xl hover:-translate-y-2">
                <div className="p-8 pb-0">
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-4 py-1.5 rounded-full bg-secondary/50 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                      {post.category_name}
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-xl group-hover:bg-primary group-hover:text-white transition-colors">
                        {post.price > 0 && !post.is_owned ? '🔒' : '🏋️'}
                      </div>
                      {post.price > 0 && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${post.is_owned ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                          {post.is_owned ? 'ĐÃ MUA' : `${Math.floor(post.price).toLocaleString('vi-VN')}đ`}
                        </span>
                      )}
                    </div>
                  </div>
                  <h4 className="font-black text-2xl text-foreground mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-8 line-clamp-3 leading-relaxed font-medium opacity-70">
                    {post.content}
                  </p>
                </div>

                <div className="mt-auto p-8 pt-6 bg-secondary/20 border-t border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-card flex items-center justify-center border border-border/50 overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                      {post.coach_avatar ? (
                        <img src={`${API_BASE_URL}${post.coach_avatar}`} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-primary">{post.coach_name?.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-black opacity-50">Coach</p>
                      <p className="text-xs font-black text-foreground">{post.coach_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">{post.calories_info}</p>
                      <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">calories</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )) : !isLoading && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-4xl mb-6 opacity-50">
                🔍
              </div>
              <p className="text-xl font-bold text-muted-foreground">Không tìm thấy bài tập nào phù hợp.</p>
              <Button variant="link" onClick={() => { setSearchTerm(''); setEnrolledOnly(false); }} className="text-primary font-bold">Xóa bộ lọc</Button>
            </div>
          )}
          {isLoading && (
            <div className="col-span-full py-40 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Đang chuẩn bị lộ trình...</p>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-none sm:rounded-[3rem] overflow-hidden">
            {selectedPost && (
              <div className="bg-card w-full max-h-[92vh] overflow-y-auto custom-scrollbar">
                {/* Header Decoration */}
                <div className="h-3 bg-gradient-to-r from-primary to-accent" />

                <div className="p-8 sm:p-12">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-primary/20">
                          {selectedPost.category_name}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-lg">
                          👁️ {selectedPost.views || 0} views
                        </span>
                      </div>
                      <DialogTitle className="text-4xl font-black tracking-tight leading-tight">{selectedPost.title}</DialogTitle>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border border-border shadow-sm overflow-hidden">
                          {selectedPost.coach_avatar ? (
                            <img src={`${API_BASE_URL}${selectedPost.coach_avatar}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary font-bold text-primary">{selectedPost.coach_name?.charAt(0)}</div>
                          )}
                        </div>
                        <p className="text-sm font-bold italic opacity-70">Huấn luyện viên {selectedPost.coach_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-4 rounded-[2rem] bg-accent/10 border border-accent/20 text-center min-w-[120px]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Cường độ</p>
                        <p className="text-2xl font-black text-accent">{selectedPost.calories_info}<span className="text-xs ml-1">kcal</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-10">
                    {selectedPost.video_url && selectedPost.is_owned && (
                      <div className="group relative aspect-video rounded-[2.5rem] overflow-hidden border border-border bg-black shadow-2xl">
                        {isYoutubeUrl(selectedPost.video_url) ? (
                          <iframe
                            width="100%"
                            height="100%"
                            src={getYouTubeEmbedUrl(selectedPost.video_url)! + "?autoplay=1&rel=0"}
                            title="YouTube video player"
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

                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">
                      <div className="space-y-6">
                        <h5 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Chi tiết bài tập</h5>
                        {selectedPost.is_owned ? (
                          <div className="p-8 rounded-[2rem] bg-secondary/30 border border-border/50 text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                            {selectedPost.content}
                          </div>
                        ) : (
                          <div className="p-12 rounded-[2rem] bg-secondary/30 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-center gap-6">
                            <div className="text-5xl opacity-40">🔒</div>
                            <div className="space-y-2">
                              <p className="text-xl font-black">Nội dung này đã được khóa</p>
                              <p className="text-sm text-muted-foreground max-w-xs">Bạn cần mua bài tập này với giá <span className="text-primary font-black">{selectedPost.price.toLocaleString()}đ</span> để xem chi tiết.</p>
                            </div>
                            <Button 
                              onClick={() => handleUnlock(selectedPost.id, 'post', selectedPost.price)}
                              className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                            >
                              MỞ KHÓA NGAY 🚀
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button
                        onClick={() => handleToggleBookmark(selectedPost.id)}
                        variant={selectedPost.is_bookmarked ? "outline" : "default"}
                        className={`flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${
                          selectedPost.is_bookmarked 
                            ? 'border-primary text-primary hover:bg-primary/5 shadow-primary/5' 
                            : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/30'
                        }`}
                      >
                        {selectedPost.is_bookmarked ? '✅ Đã lưu vào mục yêu thích' : '🔖 Lưu vào mục yêu thích'}
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
