'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { userApi, isYoutubeUrl } from '@/lib/api'
import { toast } from 'sonner'
import { SecureVideoPlayer } from '@/components/SecureVideoPlayer'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RouteDetailPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const routeId = parseInt(params.id as string)

    const [stages, setStages] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedStage, setSelectedStage] = useState<any>(null)
    const [isSubmitOpen, setIsSubmitOpen] = useState(false)
    const [videoUrl, setVideoUrl] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isOwned, setIsOwned] = useState<boolean>(true)
    const [routeInfo, setRouteInfo] = useState<any>(null)

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'user')) {
            router.push('/')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user?.role === 'user' && routeId) {
            fetchStages()
        }
    }, [user, routeId])

    const fetchStages = async () => {
        setIsLoading(true)
        try {
            const res = await userApi.getRouteStages(routeId) as any
            setIsOwned(res.is_owned)
            setRouteInfo(res.route)
            setStages(res.stages || [])
        } catch (error) {
            toast.error('Không thể tải chi tiết lộ trình')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUnlock = async () => {
        if (!routeInfo) return
        if (!confirm(`Bạn có đồng ý trả ${routeInfo.price.toLocaleString('vi-VN')}đ để mở khóa lộ trình này không?`)) return
        try {
            await userApi.purchaseContent(routeInfo.id, 'route', routeInfo.price)
            toast.success('Đã mở khóa lộ trình!')
            fetchStages()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Mở khóa thất bại')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!videoUrl) return
        setIsSubmitting(true)
        try {
            await userApi.submitStage(selectedStage.id, videoUrl)
            toast.success('Gửi bài tập thành công! Vui lòng chờ HLV duyệt.')
            setIsSubmitOpen(false)
            setVideoUrl('')
            fetchStages()
        } catch (error) {
            toast.error('Lỗi khi gửi bài tập')
        } finally {
            setIsSubmitting(false)
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
    ]

    const getStatusBadge = (status: string, is_locked: boolean) => {
        if (is_locked) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase">🔒 Đã khóa</span>
        switch (status) {
            case 'passed': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-500 uppercase">Đạt</span>
            case 'failed': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-500 uppercase">Chưa đạt</span>
            case 'submitted': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-500 uppercase">Chờ duyệt</span>
            default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-muted-foreground uppercase">Chưa học</span>
        }
    }

    const completedStages = stages.filter(s => s.status === 'passed').length
    const progressPercent = stages.length > 0 ? Math.round((completedStages / stages.length) * 100) : 0

    return (
        <DashboardLayout navItems={navItems}>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Button variant="ghost" className="mb-4 -ml-4" onClick={() => router.back()}>← Quay lại list</Button>
                        <h2 className="text-3xl font-bold text-foreground">Chi tiết lộ trình</h2>
                        <p className="text-muted-foreground mt-1">Hoàn thành từng bước để tiến xa hơn</p>
                    </div>
                    
                    {!isLoading && isOwned && stages.length > 0 && (
                        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm min-w-[200px]">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-foreground">Tiến độ</span>
                                <span className="text-sm font-bold text-green-500">{progressPercent}%</span>
                            </div>
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-500 transition-all duration-500" 
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2 text-right">
                                Đã hoàn thành {completedStages}/{stages.length} chặng
                            </p>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {!isLoading && !isOwned && routeInfo ? (
                        <div className="flex flex-col items-center justify-center py-6 px-4">
                            <Card className="max-w-xl w-full p-8 rounded-3xl bg-card border-border shadow-2xl flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 text-4xl animate-bounce">
                                    🔒
                                </div>
                                <h3 className="text-2xl font-black text-foreground mb-2">Lộ Trình Đã Khóa</h3>
                                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                                    Đây là lộ trình tập luyện trả phí được biên soạn chuyên nghiệp bởi Huấn luyện viên. Vui lòng mở khóa để xem nội dung và bắt đầu luyện tập.
                                </p>

                                <div className="w-full bg-secondary/30 rounded-2xl p-6 text-left border border-border/50 mb-8 space-y-4">
                                    <div>
                                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-60">Tên lộ trình</span>
                                        <h4 className="text-lg font-black text-foreground">{routeInfo.title}</h4>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-60">Huấn luyện viên</span>
                                        <p className="text-sm font-bold text-foreground">{routeInfo.coach_name}</p>
                                    </div>
                                    {routeInfo.description && (
                                        <div>
                                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-60">Mô tả</span>
                                            <p className="text-sm text-muted-foreground leading-relaxed italic">"{routeInfo.description}"</p>
                                        </div>
                                    )}
                                    <div className="pt-4 border-t border-border flex items-center justify-between">
                                        <span className="text-sm font-bold text-foreground">Chi phí mở khóa:</span>
                                        <span className="text-2xl font-black text-primary">{Math.floor(routeInfo.price).toLocaleString('vi-VN')}đ</span>
                                    </div>
                                </div>

                                <Button 
                                    onClick={handleUnlock}
                                    className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-wider bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Mở khóa lộ trình này 🔒
                                </Button>
                            </Card>
                        </div>
                    ) : (
                        <>
                            {!isLoading && stages.length > 0 ? stages.map((stage, idx) => (
                                <Card key={stage.id} className={`p-6 bg-card border-border overflow-hidden transition-all ${stage.status === 'passed' ? 'opacity-80' : ''}`}>
                                    <div className="flex items-start gap-6">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center font-bold text-lg border-2 border-border text-foreground">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-xl font-bold text-foreground">{stage.title}</h4>
                                                {getStatusBadge(stage.status, stage.is_locked)}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="bg-secondary/20 p-4 rounded-xl border border-border">
                                                    <h5 className="font-bold text-sm uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
                                                        <span>🏋️‍♀️</span> Nội dung tập luyện
                                                    </h5>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        {stage.description || 'Chưa có thông tin tập luyện.'}
                                                    </p>
                                                </div>

                                                <div className="bg-secondary/20 p-4 rounded-xl border border-border">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h5 className="font-bold text-sm uppercase tracking-wider text-green-500 flex items-center gap-2">
                                                            <span>🥗</span> Kế hoạch dinh dưỡng
                                                        </h5>
                                                        {stage.calories_target > 0 && (
                                                            <span className="bg-green-500/20 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                                {stage.calories_target} kcal
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        {stage.nutrition_plan || 'Chưa có thông tin dinh dưỡng.'}
                                                    </p>
                                                </div>
                                            </div>

                                            {stage.video_url && (
                                                <div className="mb-6">
                                                    {isYoutubeUrl(stage.video_url) ? (
                                                        <div className="aspect-video rounded-2xl overflow-hidden border border-border shadow-md bg-black">
                                                            <iframe
                                                                width="100%"
                                                                height="100%"
                                                                src={getYouTubeEmbedUrl(stage.video_url)!}
                                                                title={stage.title}
                                                                frameBorder="0"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                            ></iframe>
                                                        </div>
                                                    ) : (
                                                        <div className="aspect-video rounded-2xl overflow-hidden border border-border shadow-md bg-black">
                                                            <SecureVideoPlayer filename={stage.video_url} className="w-full h-full" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {stage.submission_video_url && (
                                                <div className="mb-6 p-4 bg-muted/30 rounded-2xl border border-border/50">
                                                    <h5 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                                        <span>🎥</span> Lịch sử bài tập bạn đã gửi:
                                                    </h5>
                                                    {getYouTubeEmbedUrl(stage.submission_video_url) ? (
                                                        <div className="aspect-video rounded-xl overflow-hidden border border-border shadow-sm bg-black w-full max-w-lg">
                                                            <iframe
                                                                width="100%"
                                                                height="100%"
                                                                src={getYouTubeEmbedUrl(stage.submission_video_url)!}
                                                                title="Video bài tập của bạn"
                                                                frameBorder="0"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                            ></iframe>
                                                        </div>
                                                    ) : (
                                                        <a href={stage.submission_video_url} target="_blank" rel="noreferrer" className="text-sm text-blue-500 font-medium underline flex items-center gap-2 bg-blue-500/5 p-3 rounded-lg border border-blue-500/10 hover:bg-blue-500/10 transition-colors w-fit">
                                                            ▶️ Xem lại video bạn đã gửi (Link ngoài)
                                                        </a>
                                                    )}
                                                </div>
                                            )}

                                            {stage.coach_feedback && (
                                                <Alert className="mb-4 bg-accent/5 border-accent/20">
                                                    <AlertTitle className="text-xs font-bold uppercase tracking-tight">Phản hồi từ HLV:</AlertTitle>
                                                    <AlertDescription className="text-sm italic">
                                                        "{stage.coach_feedback}"
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            <div className="flex justify-end pt-4 border-t border-border/50">
                                                <Button
                                                    disabled={stage.status === 'passed' || stage.status === 'submitted' || stage.is_locked}
                                                    onClick={() => {
                                                        setSelectedStage(stage)
                                                        setIsSubmitOpen(true)
                                                    }}
                                                    className={`rounded-full px-8 ${stage.status === 'failed' ? 'bg-destructive hover:bg-destructive/90' : ''} ${stage.is_locked ? 'opacity-50 grayscale' : ''}`}
                                                >
                                                    {stage.is_locked ? '🔒 Đã khóa' : stage.status === 'passed' ? 'Đã hoàn thành' : stage.status === 'submitted' ? 'Đang chờ' : stage.status === 'failed' ? 'Gửi lại bài tập' : 'Gửi bài tập'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )) : !isLoading && (
                                <div className="py-20 text-center opacity-50 bg-secondary/10 rounded-2xl border-2 border-dashed border-border">
                                    <p>Lộ trình này hiện chưa có nội dung.</p>
                                </div>
                            )}
                            {isLoading && <div className="text-center py-20">Đang tải chặng đường phía trước...</div>}
                        </>
                    )}
                </div>

                {/* Submit Modal */}
                <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
                    <DialogContent className="max-w-md bg-card border-border">
                        <DialogHeader>
                            <DialogTitle>Báo cáo bài tập: {selectedStage?.title}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 py-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">URL Video Bài Tập (Youtube/Drive/iCloud...)</label>
                                <Input
                                    placeholder="https://..."
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    required
                                    className="bg-background border-border h-12"
                                />
                                <p className="text-[10px] text-muted-foreground italic">Ghi lại video bạn thực hiện động tác này để HLV chấm điểm.</p>
                            </div>
                            <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20">
                                {isSubmitting ? 'Đang gửi...' : 'Xác nhận hoàn thành'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}
