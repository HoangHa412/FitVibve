'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { userApi } from '@/lib/api'
import { toast } from 'sonner'
import Link from 'next/link'

export default function RoutesPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [routes, setRoutes] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'user')) {
            router.push('/')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user?.role === 'user') {
            fetchRoutes()
        }
    }, [user])

    const fetchRoutes = async () => {
        setIsLoading(true)
        try {
            const data = await userApi.getRoutes()
            setRoutes(data)
        } catch (error) {
            toast.error('Không thể tải danh sách lộ trình')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUnlock = async (id: number, price: number) => {
        if (!confirm(`Bạn có đồng ý trả ${price.toLocaleString('vi-VN')}đ để mở khóa lộ trình này không?`)) return
        try {
            await userApi.purchaseContent(id, 'route', price)
            toast.success('Đã mở khóa lộ trình!')
            fetchRoutes()
        } catch (error: any) {
            toast.error(error?.message || 'Mở khóa thất bại')
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
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-2">Lộ trình tập luyện</h2>
                    <p className="text-muted-foreground">Tham gia các khóa học dài hạn để đạt mục tiêu bền vững</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {!isLoading && routes.length > 0 ? routes.map((route, idx) => (
                        <Card 
                            key={route.id} 
                            className="overflow-hidden flex flex-col bg-card border-border hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 group rounded-3xl animate-fade-in-up"
                            style={{ animationDelay: `${idx * 0.08}s` }}
                        >
                            <div className="p-8 flex-grow">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        Lộ trình dài hạn
                                    </span>
                                    {route.standard && route.standard !== 'Chưa xác định' && (
                                        <span className="px-2.5 py-1 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                                            🏅 Chuẩn {route.standard}
                                        </span>
                                    )}
                                    <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ml-auto shadow-sm">
                                        🏁
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
                                    {route.title}
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3 italic opacity-80">
                                    "{route.description}"
                                </p>

                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
                                    <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                                        {route.coach_name?.charAt(0) || 'H'}
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span>Huấn luyện viên: <strong className="text-foreground font-bold">{route.coach_name}</strong></span>
                                        {route.price > 0 && !route.is_owned && (
                                            <span className="font-black text-primary text-sm mt-0.5">
                                                {Math.floor(route.price).toLocaleString('vi-VN')}đ
                                            </span>
                                        )}
                                        {route.is_owned && route.total_stages > 0 && (
                                            <div className="mt-2 w-full flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-emerald-500 transition-all duration-1000 ease-out rounded-full" 
                                                        style={{ width: `${Math.round((route.completed_stages / route.total_stages) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-emerald-500">
                                                    {Math.round((route.completed_stages / route.total_stages) * 100)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 py-4 bg-secondary/15 border-t border-border/40 flex items-center justify-between">
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">
                                    {route.is_owned ? 'Khóa học đã sẵn sàng' : 'Nội dung trả phí'}
                                </p>
                                {route.is_owned ? (
                                    <Link href={`/dashboard/routes/${route.id}`}>
                                        <Button size="sm" className="rounded-xl px-6 font-bold btn-premium shadow-md active:scale-95">Bắt đầu ngay</Button>
                                    </Link>
                                ) : (
                                    <Button 
                                        size="sm" 
                                        className="rounded-xl px-6 font-bold btn-premium shadow-md active:scale-95"
                                        onClick={() => handleUnlock(route.id, route.price)}
                                    >
                                        Mở khóa 🔒
                                    </Button>
                                )}
                            </div>
                        </Card>
                    )) : !isLoading && (
                        <div className="col-span-full py-20 text-center opacity-50 bg-secondary/5 rounded-3xl border border-dashed border-border">
                            <p className="text-lg italic">Hiện tại chưa có lộ trình nào khả dụng.</p>
                        </div>
                    )}
                    {isLoading && <div className="col-span-full text-center py-20">Đang tìm lộ trình phù hợp...</div>}
                </div>
            </div>
        </DashboardLayout>
    )
}
