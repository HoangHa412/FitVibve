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
        } catch (error) {
            toast.error('Mở khóa thất bại')
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
                    {!isLoading && routes.length > 0 ? routes.map((route) => (
                        <Card key={route.id} className="overflow-hidden flex flex-col bg-card border-border hover:border-primary/50 transition-all group">
                            <div className="p-8 flex-grow">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                        Lộ trình dài hạn
                                    </span>
                                    {route.standard && route.standard !== 'Chưa xác định' && (
                                        <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-600 text-[10px] font-bold uppercase flex items-center gap-1">
                                            🏅 Chuẩn {route.standard}
                                        </span>
                                    )}
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors ml-auto">
                                        🏁
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                                    {route.title}
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3 italic">
                                    "{route.description}"
                                </p>

                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
                                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center font-bold">
                                        {route.coach_name?.charAt(0) || 'H'}
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span>Huấn luyện viên: <strong className="text-foreground">{route.coach_name}</strong></span>
                                        {route.price > 0 && !route.is_owned && (
                                            <span className="font-bold text-primary">
                                                {Math.floor(route.price).toLocaleString('vi-VN')}đ
                                            </span>
                                        )}
                                        {route.is_owned && route.total_stages > 0 && (
                                            <div className="mt-2 w-full flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-green-500 transition-all duration-500" 
                                                        style={{ width: `${Math.round((route.completed_stages / route.total_stages) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-green-500">
                                                    {Math.round((route.completed_stages / route.total_stages) * 100)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 py-4 bg-secondary/15 border-t border-border flex items-center justify-between">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                    {route.is_owned ? 'Khóa học đã sẵn sàng' : 'Nội dung trả phí'}
                                </p>
                                {route.is_owned ? (
                                    <Link href={`/dashboard/routes/${route.id}`}>
                                        <Button size="sm" className="rounded-full px-6">Bắt đầu ngay</Button>
                                    </Link>
                                ) : (
                                    <Button 
                                        size="sm" 
                                        className="rounded-full px-6 bg-primary text-primary-foreground"
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
