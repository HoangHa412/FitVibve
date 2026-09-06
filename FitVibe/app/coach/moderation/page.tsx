'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { coachApi } from '@/lib/api'
import { toast } from 'sonner'

export default function CoachModerationPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'coach')) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role === 'coach') {
      fetchSubmissions()
    }
  }, [user])

  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({})

  const fetchSubmissions = async () => {
    setIsLoading(true)
    try {
      const data = await coachApi.getSubmissions()
      setItems(data)
      // Initialize feedbacks
      const initialFeedbacks: Record<number, string> = {}
      data.forEach((item: any) => {
        if (item.status === 'submitted') {
          initialFeedbacks[item.id] = ''
        }
      })
      setFeedbacks(initialFeedbacks)
    } catch (error) {
      toast.error('Không thể tải danh sách chờ duyệt')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEvaluate = async (id: number, status: 'passed' | 'failed') => {
    const feedback = feedbacks[id] || (status === 'passed' ? 'Bài tập tốt, kỹ thuật đúng.' : 'Kỹ thuật chưa chuẩn, cần tập trung hơn.')
    try {
      await coachApi.evaluateSubmission(id, status, feedback)
      toast.success(status === 'passed' ? 'Đã phê duyệt' : 'Đã từ chối')
      fetchSubmissions()
    } catch (error) {
      toast.error('Thất bại khi xử lý')
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

  const pendingItems = items.filter(item => item.status === 'submitted')
  const historyItems = items.filter(item => item.status !== 'submitted')

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Quản lý bài nộp</h2>
          <p className="text-muted-foreground">Phê duyệt và nhận xét bài tập của học viên</p>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card className="p-6 rounded-2xl bg-card border-border border-l-4 border-l-primary">
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Đang chờ xử lý</p>
            <p className="text-4xl font-black text-primary">{isLoading ? '...' : pendingItems.length}</p>
          </Card>
          <Card className="p-6 rounded-2xl bg-card border-border border-l-4 border-l-accent">
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Đã xử lý</p>
            <p className="text-4xl font-black text-accent">{isLoading ? '...' : historyItems.length}</p>
          </Card>
        </div>

        {/* Pending Items Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h3 className="text-xl font-bold">Danh sách chờ duyệt</h3>
          </div>
          
          {!isLoading && pendingItems.length > 0 ? (
            <div className="space-y-4">
              {pendingItems.map((item) => (
                <Card key={item.id} className="p-6 rounded-2xl bg-card border-border hover:border-primary/50 transition-all shadow-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Video & Details */}
                    <div className="lg:col-span-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl">📽️</div>
                        <div>
                          <p className="font-bold text-foreground text-lg">{item.user_name}</p>
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider opacity-60">
                            {item.route_title} <span className="mx-1">/</span> {item.stage_title}
                          </p>
                        </div>
                      </div>

                      {/* Health Stats */}
                      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-secondary/20 p-4 rounded-xl border border-border/30">
                        <div className="text-center p-1">
                          <p className="text-[9px] font-black text-muted-foreground uppercase opacity-50 mb-1">Cân nặng</p>
                          <p className="text-xs font-bold text-primary">{item.weight || '--'} kg</p>
                        </div>
                        <div className="text-center p-1 border-l border-border/30">
                          <p className="text-[9px] font-black text-muted-foreground uppercase opacity-50 mb-1">Chiều cao</p>
                          <p className="text-xs font-bold text-primary">{item.height || '--'} cm</p>
                        </div>
                        <div className="text-center p-1 border-l border-border/30">
                          <p className="text-[9px] font-black text-muted-foreground uppercase opacity-50 mb-1">BMI</p>
                          <p className="text-xs font-bold text-accent">
                            {(item.weight && item.height) ? (item.weight / Math.pow(item.height / 100, 2)).toFixed(1) : '--'}
                          </p>
                        </div>
                        <div className="text-center p-1 border-l border-border/30">
                          <p className="text-[9px] font-black text-muted-foreground uppercase opacity-50 mb-1">Mục tiêu</p>
                          <p className="text-[9px] font-bold text-foreground uppercase">
                            {item.goal === 'weight_loss' ? 'Giảm cân' : item.goal === 'muscle_gain' ? 'Tăng cơ' : 'Duy trì'}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        {getYouTubeEmbedUrl(item.submission_video_url) ? (
                          <div className="aspect-video rounded-xl overflow-hidden border border-border shadow-2xl bg-black w-full">
                            <iframe
                              width="100%" height="100%"
                              src={getYouTubeEmbedUrl(item.submission_video_url)!}
                              title="Student Submission" frameBorder="0"
                              allowFullScreen
                            ></iframe>
                          </div>
                        ) : (
                          <a href={item.submission_video_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary font-bold bg-primary/5 p-4 rounded-xl border border-primary/10 hover:bg-primary/10 transition-all">
                            🔗 Xem video bài tập học viên nộp
                          </a>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-3 italic">Nộp vào: {new Date(item.submitted_at).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>

                    {/* Right: Feedback & Actions */}
                    <div className="lg:col-span-4 flex flex-col gap-4 border-l border-border/30 pl-0 lg:pl-8">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Nhận xét của HLV</label>
                        <textarea
                          className="w-full h-32 bg-secondary/30 border-2 border-transparent focus:border-primary/20 focus:bg-card rounded-2xl p-4 text-sm font-medium transition-all outline-none resize-none"
                          placeholder="Viết nhận xét hoặc góp ý kỹ thuật cho học viên..."
                          value={feedbacks[item.id] || ''}
                          onChange={(e) => setFeedbacks(prev => ({ ...prev, [item.id]: e.target.value }))}
                        />
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <Button
                          className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 bg-primary hover:scale-[1.02] active:scale-95 transition-all"
                          onClick={() => handleEvaluate(item.id, 'passed')}
                        >
                          Phê duyệt bài tập
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full h-12 rounded-xl font-bold border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/40 transition-all"
                          onClick={() => handleEvaluate(item.id, 'failed')}
                        >
                          Yêu cầu tập lại
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : !isLoading ? (
            <Card className="p-12 rounded-3xl bg-card border-border text-center border-dashed">
              <div className="text-5xl mb-4 grayscale opacity-20">📭</div>
              <p className="text-lg font-bold text-foreground mb-1">Tất cả bài nộp đã được xử lý</p>
              <p className="text-sm text-muted-foreground">Học viên sẽ nhận được thông báo khi bạn phê duyệt.</p>
            </Card>
          ) : (
            <div className="text-center py-12 animate-pulse text-muted-foreground">Đang tải danh sách chờ...</div>
          )}
        </div>

        {/* History Section */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 bg-accent rounded-full" />
            <h3 className="text-xl font-bold">Lịch sử duyệt bài</h3>
          </div>

          <div className="space-y-4 opacity-80">
            {historyItems.map((item) => (
              <Card key={item.id} className="p-5 rounded-2xl bg-secondary/10 border-border/50">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">👤</div>
                    <div>
                      <p className="font-bold text-sm">{item.user_name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {item.route_title} / {item.stage_title}
                      </p>
                      <a 
                        href={item.submission_video_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-primary hover:underline block mt-1"
                      >
                        🔗 Xem video học viên nộp
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[9px] text-muted-foreground uppercase font-black opacity-50 mb-1">Nhận xét</p>
                      <p className="text-xs italic text-foreground max-w-[200px] truncate" title={item.coach_feedback}>
                        "{item.coach_feedback}"
                      </p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      item.status === 'passed' ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'
                    }`}>
                      {item.status === 'passed' ? 'Đã duyệt' : 'Yêu cầu tập lại'}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {historyItems.length === 0 && !isLoading && (
              <p className="text-center text-muted-foreground text-sm py-8 italic">Chưa có lịch sử duyệt bài.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
