'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { userApi, API_BASE_URL } from '@/lib/api'
import { toast } from 'sonner'
import Link from 'next/link'

function CertificateCard({ certUrl, index }: { certUrl: string; index: number; key?: any }) {
    const raw = (certUrl || '').trim()
    const getResolvedUrl = (u: string) => {
        if (!u) return ''
        if (u.startsWith('http://') || u.startsWith('https://')) return u
        const path = u.startsWith('/') ? u : `/${u}`
        return `${API_BASE_URL}${path}`
    }

    const [src, setSrc] = useState(() => getResolvedUrl(raw))
    const [triedAlt, setTriedAlt] = useState(false)
    const [hasError, setHasError] = useState(false)

    const handleImgError = () => {
        if (!triedAlt) {
            setTriedAlt(true)
            if (src.includes('/uploads/certificates/')) {
                setSrc(src.replace('/uploads/certificates/', '/uploads/'))
                return
            } else if (src.includes('/uploads/')) {
                setSrc(src.replace('/uploads/', '/uploads/certificates/'))
                return
            }
        }
        setHasError(true)
    }

    return (
        <a 
            href={src} 
            target="_blank" 
            rel="noreferrer"
            className="block rounded-2xl overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-colors relative group shadow-sm hover:shadow-md bg-secondary/30"
        >
            <div className="aspect-[4/3] bg-secondary/40 flex items-center justify-center overflow-hidden">
                {!hasError ? (
                    <img 
                        src={src} 
                        alt={`Chứng chỉ ${index + 1}`}
                        onError={handleImgError}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-muted-foreground group-hover:text-primary transition-colors">
                        <span className="text-3xl mb-1">📜</span>
                        <span className="text-xs font-bold text-foreground">Chứng chỉ {index + 1}</span>
                        <span className="text-[10px] text-muted-foreground/70 mt-1">Bấm để xem tệp gốc</span>
                    </div>
                )}
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-white font-bold text-sm bg-black/40 px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-sm">
                    🔍 Xem chi tiết
                </span>
            </div>
        </a>
    )
}

export default function CoachProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [coach, setCoach] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [enrollingStatus, setEnrollingStatus] = useState<boolean>(false)

    useEffect(() => {
        if (!authLoading && (!user || (user.role !== 'user' && user.role !== 'admin'))) {
            router.push('/')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if ((user?.role === 'user' || user?.role === 'admin') && id) {
            fetchCoach()
        }
    }, [user, id])

    const fetchCoach = async () => {
        setIsLoading(true)
        try {
            const data = await userApi.getCoachById(Number(id))
            setCoach(data)
        } catch (error) {
            toast.error('Không thể tải thông tin huấn luyện viên')
            router.push(user?.role === 'admin' ? '/admin/members' : '/dashboard/coaches')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEnroll = async () => {
        if (!coach) return
        setEnrollingStatus(true)
        try {
            await userApi.enrollInCoach(coach.id)
            toast.success('Đăng ký học viên thành công!')
            fetchCoach()
        } catch (error) {
            toast.error('Đăng ký thất bại, vui lòng thử lại sau')
        } finally {
            setEnrollingStatus(false)
        }
    }

    const handleCancelEnroll = async () => {
        if (!coach) return
        setEnrollingStatus(true)
        try {
            await userApi.cancelEnrollment(coach.id)
            toast.success('Đã hủy đăng ký thành công')
            fetchCoach()
        } catch (error) {
            toast.error('Hủy đăng ký thất bại')
        } finally {
            setEnrollingStatus(false)
        }
    }

    const handleUpdateStatus = async (newStatus: string) => {
        if (!coach) return
        try {
            const token = localStorage.getItem('fitvibe-token')
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${coach.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            })
            if (res.ok) {
                toast.success(newStatus === 'active' ? 'Đã kích hoạt / mở khóa HLV thành công' : 'Đã khóa tài khoản HLV')
                setCoach((prev: any) => prev ? { ...prev, status: newStatus } : prev)
            } else {
                const data = await res.json()
                toast.error(data.message || 'Cập nhật trạng thái thất bại')
            }
        } catch (e) {
            toast.error('Lỗi kết nối máy chủ')
        }
    }

    if (authLoading || !user || (user.role !== 'user' && user.role !== 'admin')) {
        return null
    }

    const userNavItems = [
        { label: 'Tổng quan', href: '/dashboard' },
        { label: 'Chỉ số sức khỏe', href: '/dashboard/health' },
        { label: 'Theo dõi cân nặng', href: '/dashboard/weight' },
        { label: 'Kế hoạch tập luyện', href: '/dashboard/workouts' },
        { label: 'Kế hoạch dinh dưỡng', href: '/dashboard/meals' },
        { label: 'Lộ trình tập luyện', href: '/dashboard/routes' },
        { label: 'Mục yêu thích', href: '/dashboard/bookmarks' },
        { label: 'Đội ngũ HLV', href: '/dashboard/coaches' },
    ]

    const adminNavItems = [
        { label: 'Tổng quan', href: '/admin' },
        { label: 'Quản lý thành viên', href: '/admin/members' },
        { label: 'Duyệt bài viết', href: '/admin/posts' },
        { label: 'Quản lý danh mục', href: '/admin/categories' },
        { label: 'Báo cáo & thống kê', href: '/admin/reports' },
        { label: 'Duyệt Rút Tiền', href: '/admin/withdrawals' },
    ]

    const navItems = user?.role === 'admin' ? adminNavItems : userNavItems

    return (
        <DashboardLayout navItems={navItems}>
            <div className="max-w-5xl mx-auto space-y-12 pb-20">
                <div className="animate-in flex items-center gap-6">
                    <Link href={user?.role === 'admin' ? '/admin/members' : '/dashboard/coaches'} className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-all hover:-translate-x-1 border border-border/50">
                        <span className="text-2xl font-bold">&larr;</span>
                    </Link>
                    <div>
                        <h2 className="text-4xl font-black text-foreground tracking-tight">Hồ sơ Huấn luyện viên</h2>
                        <p className="text-muted-foreground font-medium opacity-70 mt-1">
                            {user?.role === 'admin' ? 'Chế độ Quản trị viên: Xem và kiểm tra chi tiết HLV' : 'Chi tiết thông tin chuyên gia đồng hành cùng bạn'}
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center py-40 gap-4">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Đang tải hồ sơ...</p>
                    </div>
                ) : coach ? (
                    <Card className="p-8 md:p-12 rounded-[3rem] bg-card border-border/50 shadow-xl relative overflow-hidden animate-in" style={{ animationDelay: '0.1s' }}>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                        
                        <div className="flex flex-col md:flex-row gap-12 relative z-10">
                            {/* Left Column: Avatar & Quick Actions */}
                            <div className="flex flex-col items-center w-full md:w-[320px] shrink-0">
                                <div className="w-64 h-64 rounded-[3rem] bg-secondary flex items-center justify-center p-2 border-4 border-card shadow-2xl mb-8 overflow-hidden">
                                    {coach.avatar_url ? (
                                        <img src={`${API_BASE_URL}${coach.avatar_url}`} className="w-full h-full object-cover rounded-[2.5rem]" />
                                    ) : (
                                        <span className="text-8xl font-black text-primary/40 leading-none">{coach.full_name?.charAt(0) || 'H'}</span>
                                    )}
                                </div>
                                
                                <div className="flex items-center justify-center gap-2 p-4 mb-6 rounded-2xl bg-primary/5 text-primary text-sm font-black uppercase tracking-widest w-full border border-primary/10">
                                    <span className="text-lg">💎</span>
                                    <span>FitVibe Elite</span>
                                </div>

                                {user?.role === 'admin' ? (
                                    <div className="w-full space-y-3">
                                        <div className="p-4 rounded-2xl bg-secondary/40 border border-border text-center">
                                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Trạng thái HLV</p>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                                                coach.status === 'locked'
                                                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                                                    : coach.status === 'pending'
                                                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                                                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                            }`}>
                                                {coach.status === 'locked' ? '🔒 Đã bị khóa' : coach.status === 'pending' ? '⏳ Chờ phê duyệt' : '● Đang hoạt động'}
                                            </span>

                                            <div className="mt-3 pt-3 border-t border-border/50 flex flex-col gap-2">
                                                {coach.status === 'pending' && (
                                                    <Button
                                                        onClick={() => handleUpdateStatus('active')}
                                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl transition-all"
                                                    >
                                                        ✓ Phê duyệt HLV
                                                    </Button>
                                                )}
                                                {coach.status === 'locked' ? (
                                                    <Button
                                                        onClick={() => handleUpdateStatus('active')}
                                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl transition-all"
                                                    >
                                                        🔓 Mở khóa tài khoản HLV
                                                    </Button>
                                                ) : coach.status !== 'pending' ? (
                                                    <Button
                                                        onClick={() => handleUpdateStatus('locked')}
                                                        variant="destructive"
                                                        className="w-full font-bold text-xs h-10 rounded-xl transition-all"
                                                    >
                                                        🔒 Khóa tài khoản HLV
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </div>
                                        <Link href="/admin/members" className="block w-full">
                                            <Button variant="outline" className="w-full h-12 rounded-2xl font-bold border-border/80 hover:bg-secondary">
                                                &larr; Về Quản lý thành viên
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <Button
                                        className={`w-full h-16 rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all shadow-xl active:scale-95 ${coach.is_enrolled
                                            ? 'bg-secondary text-foreground hover:bg-secondary/80 shadow-secondary/20'
                                            : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/30'
                                            }`}
                                        onClick={coach.is_enrolled ? handleCancelEnroll : handleEnroll}
                                        disabled={enrollingStatus}
                                    >
                                        {enrollingStatus
                                            ? 'Đang xử lý...'
                                            : coach.is_enrolled ? 'Hủy đăng ký' : 'Đăng ký ngay'}
                                    </Button>
                                )}
                            </div>

                            {/* Right Column: Info */}
                            <div className="flex-1 space-y-8">
                                <div>
                                    <h3 className="font-black text-5xl text-foreground mb-3">{coach.full_name}</h3>
                                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest bg-primary/5 inline-flex px-4 py-2 rounded-xl">
                                        <span>📧</span>
                                        {coach.email}
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-4 bg-secondary/30 rounded-2xl text-center border border-border/50">
                                        <div className="text-2xl font-black text-primary">{coach.student_count || 0}</div>
                                        <div className="text-xs text-muted-foreground font-semibold mt-0.5">Học viên</div>
                                    </div>
                                    <div className="p-4 bg-secondary/30 rounded-2xl text-center border border-border/50">
                                        <div className="text-2xl font-black text-primary">{coach.route_count || 0}</div>
                                        <div className="text-xs text-muted-foreground font-semibold mt-0.5">Lộ trình</div>
                                    </div>
                                    <div className="p-4 bg-secondary/30 rounded-2xl text-center border border-border/50">
                                        <div className="text-2xl font-black text-primary">{coach.post_count || 0}</div>
                                        <div className="text-xs text-muted-foreground font-semibold mt-0.5">Bài viết</div>
                                    </div>
                                </div>

                                <div className="bg-secondary/20 p-8 rounded-[2rem] border border-border/50">
                                    <h4 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <span className="text-xl">📝</span> Giới thiệu bản thân
                                    </h4>
                                    {coach.bio ? (
                                        <p className="text-foreground/80 leading-relaxed font-medium whitespace-pre-wrap text-lg">{coach.bio}</p>
                                    ) : (
                                        <p className="text-muted-foreground italic text-lg opacity-70">Huấn luyện viên chưa cập nhật thông tin giới thiệu.</p>
                                    )}
                                </div>

                                {coach.certificates && (
                                    <div className="bg-secondary/20 p-8 rounded-[2rem] border border-border/50">
                                        <h4 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <span className="text-xl">🏆</span> Bằng cấp & Chứng chỉ
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {coach.certificates
                                                .split(',')
                                                .map((s: string) => s.trim())
                                                .filter(Boolean)
                                                .map((certUrl: string, idx: number) => (
                                                    <CertificateCard key={idx} certUrl={certUrl} index={idx} />
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ) : null}
            </div>
        </DashboardLayout>
    )
}
