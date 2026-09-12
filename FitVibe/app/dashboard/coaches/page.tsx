'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { userApi, API_BASE_URL } from '@/lib/api'
import { toast } from 'sonner'

export default function CoachesPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [coaches, setCoaches] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [enrollingStatus, setEnrollingStatus] = useState<number | null>(null)

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'user')) {
            router.push('/')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user?.role === 'user') {
            fetchCoaches()
        }
    }, [user])

    const fetchCoaches = async () => {
        setIsLoading(true)
        try {
            const data = await userApi.getCoaches()
            setCoaches(data)
        } catch (error) {
            toast.error('Không thể tải danh sách huấn luyện viên')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEnroll = async (coachId: number) => {
        setEnrollingStatus(coachId)
        try {
            await userApi.enrollInCoach(coachId)
            toast.success('Đăng ký học viên thành công!')
            fetchCoaches()
        } catch (error) {
            toast.error('Đăng ký thất bại, vui lòng thử lại sau')
        } finally {
            setEnrollingStatus(null)
        }
    }

    const handleCancelEnroll = async (coachId: number) => {
        setEnrollingStatus(coachId)
        try {
            await userApi.cancelEnrollment(coachId)
            toast.success('Đã hủy đăng ký thành công')
            fetchCoaches()
        } catch (error) {
            toast.error('Hủy đăng ký thất bại')
        } finally {
            setEnrollingStatus(null)
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

    return (
        <DashboardLayout navItems={navItems}>
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
                <div className="animate-in">
                    <h2 className="text-4xl font-black text-foreground mb-3 tracking-tight">Đội ngũ Huấn luyện viên</h2>
                    <p className="text-muted-foreground text-lg font-medium opacity-70">Chọn người đồng hành phù hợp để bứt phá giới hạn bản thân.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {!isLoading && coaches.length > 0 ? coaches.map((coach, idx) => (
                        <div
                            key={coach.id}
                            className="group animate-fade-in-up"
                            style={{ animationDelay: `${idx * 0.06}s` }}
                        >
                            <Card className="p-8 rounded-[2.5rem] bg-card border-border/50 hover:border-primary/40 transition-all duration-300 flex flex-col h-full shadow-sm hover:shadow-2xl hover:-translate-y-2 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -mr-10 -mt-10 blur-2xl group-hover:bg-primary/10 transition-colors" />

                                <Link href={`/dashboard/coaches/${coach.id}`} className="flex flex-col items-center text-center mb-8 relative z-10 cursor-pointer block">
                                    <div className="w-24 h-24 rounded-[2rem] bg-secondary flex items-center justify-center p-1 border-4 border-card shadow-xl mb-6 group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300 overflow-hidden">
                                        {coach.avatar_url ? (
                                            <img src={`${API_BASE_URL}${coach.avatar_url}`} className="w-full h-full object-cover rounded-[1.75rem]" />
                                        ) : (
                                            <span className="text-3xl font-black text-primary/40 leading-none">{coach.full_name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <h4 className="font-black text-2xl text-foreground mb-1 group-hover:text-primary transition-colors">{coach.full_name}</h4>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60 mb-4">{coach.email}</p>
                                    <div className="text-[10px] font-black text-primary bg-primary/10 px-4 py-1.5 rounded-full uppercase tracking-widest opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-300">Xem hồ sơ &rarr;</div>
                                </Link>

                                <div className="space-y-6 mt-auto relative z-10">
                                    <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
                                        <span className="animate-bounce-subtle">💎</span>
                                        <span>Chuyên gia FitVibe Elite</span>
                                    </div>

                                    {coach.certificate_url && (
                                        <a
                                            href={coach.certificate_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block text-center py-2 px-4 rounded-xl bg-secondary/30 text-[10px] font-bold text-foreground hover:bg-secondary transition-colors border border-border/50"
                                        >
                                            📜 Xem Bằng cấp / CV minh chứng
                                        </a>
                                    )}

                                    <Button
                                        className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all shadow-xl active:scale-95 ${coach.is_enrolled
                                            ? 'bg-secondary text-foreground hover:bg-secondary/80 shadow-secondary/20'
                                            : 'btn-premium text-white shadow-primary/30'
                                            }`}
                                        onClick={() => coach.is_enrolled ? handleCancelEnroll(coach.id) : handleEnroll(coach.id)}
                                        disabled={enrollingStatus !== null}
                                    >
                                        {enrollingStatus === coach.id
                                            ? 'Processing...'
                                            : coach.is_enrolled ? 'Hủy đăng ký' : 'Đăng ký ngay'}
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )) : !isLoading && (
                        <div className="col-span-full py-32 text-center opacity-50 flex flex-col items-center">
                            <span className="text-5xl mb-6">🤝</span>
                            <p className="text-xl font-bold italic">Hiện tại chưa có huấn luyện viên nào hoạt động.</p>
                        </div>
                    )}
                    {isLoading && (
                        <div className="col-span-full flex flex-col items-center py-40 gap-4">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Đang tìm chuyên gia...</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
