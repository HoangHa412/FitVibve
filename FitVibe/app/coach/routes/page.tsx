'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { coachApi, videoApi } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Route {
    id: number;
    title: string;
    description: string;
    price: number;
    created_at: string;
    target_goal: string;
    standard: string;
}

interface Stage {
    id: number;
    route_id: number;
    stage_order: number;
    title: string;
    video_url: string;
    description: string;
    nutrition_plan: string;
    calories_target: number;
}

export default function CoachRoutesPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [routes, setRoutes] = useState<Route[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Route Dialog State
    const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false)
    const [editingRoute, setEditingRoute] = useState<Route | null>(null)
    const [routeData, setRouteData] = useState({ title: '', description: '', price: '0', target_goal: 'general_fitness', standard: '' })

    // Stage Management State
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
    const [stages, setStages] = useState<Stage[]>([])
    const [isStageDialogOpen, setIsStageDialogOpen] = useState(false)
    const [editingStage, setEditingStage] = useState<Stage | null>(null)
    const [stageData, setStageData] = useState({ title: '', stage_order: 1, video_url: '', description: '', nutrition_plan: '', calories_target: 0 })
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'coach')) {
            router.push('/')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user?.role === 'coach') {
            fetchRoutes()
        }
    }, [user])

    const fetchRoutes = async () => {
        setIsLoading(true)
        try {
            const data = await coachApi.getMyRoutes()
            setRoutes(data as any)
        } catch (error) {
            toast.error('Không thể tải danh sách lộ trình')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchStages = async (routeId: number) => {
        try {
            const data = await coachApi.getMyRouteStages(routeId)
            setStages(data as any)
        } catch (error) {
            toast.error('Không thể tải các bước của lộ trình')
        }
    }

    const handleCreateOrUpdateRoute = async () => {
        if (!routeData.title) return toast.error('Vui lòng nhập tiêu đề')
        try {
            if (editingRoute) {
                await coachApi.updateRoute(editingRoute.id, {
                    ...routeData,
                    price: parseFloat(routeData.price || '0')
                })
                toast.success('Đã cập nhật lộ trình')
            } else {
                await coachApi.createRoute({
                    ...routeData,
                    price: parseFloat(routeData.price || '0')
                })
                toast.success('Đã tạo lộ trình mới')
            }
            setIsRouteDialogOpen(false)
            setEditingRoute(null)
            setRouteData({ title: '', description: '', price: '0', target_goal: 'general_fitness', standard: '' })
            fetchRoutes()
        } catch (error) {
            toast.error('Lỗi khi lưu lộ trình')
        }
    }

    const handleDeleteRoute = async (id: number) => {
        if (!confirm('Xóa lộ trình sẽ xóa tất cả các bước bên trong. Bạn chắc chứ?')) return
        try {
            await coachApi.deleteRoute(id)
            toast.success('Đã xóa lộ trình')
            fetchRoutes()
        } catch (error) {
            toast.error('Lỗi khi xóa lộ trình')
        }
    }

    const handleCreateOrUpdateStage = async () => {
        if (!selectedRoute || !stageData.title) return toast.error('Vui lòng nhập tiêu đề bước')
        try {
            setIsUploading(true)
            let videoUrl = stageData.video_url

            if (videoFile) {
                const uploadRes = await videoApi.upload(videoFile)
                if (uploadRes.success) {
                    videoUrl = uploadRes.filename
                } else {
                    toast.error('Lỗi khi upload video')
                    return
                }
            }

            const dataToSave = { ...stageData, video_url: videoUrl }

            if (editingStage) {
                await coachApi.updateRouteStage(editingStage.id, dataToSave)
                toast.success('Đã cập nhật bước')
            } else {
                await coachApi.addRouteStage(selectedRoute.id, dataToSave)
                toast.success('Đã thêm bước mới')
            }
            setIsStageDialogOpen(false)
            setEditingStage(null)
            setStageData({ title: '', stage_order: stages.length + 1, video_url: '', description: '', nutrition_plan: '', calories_target: 0 })
            setVideoFile(null)
            fetchStages(selectedRoute.id)
        } catch (error) {
            toast.error('Lỗi khi lưu bước')
        } finally {
            setIsUploading(false)
        }
    }

    const handleDeleteStage = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa bước này?')) return
        try {
            await coachApi.deleteRouteStage(id)
            toast.success('Đã xóa bước')
            if (selectedRoute) fetchStages(selectedRoute.id)
        } catch (error) {
            toast.error('Lỗi khi xóa bước')
        }
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

    return (
        <DashboardLayout navItems={navItems}>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">Lộ trình tập luyện</h2>
                        <p className="text-muted-foreground">Xây dựng các chương trình tập luyện nhiều bước cho học viên</p>
                    </div>
                    <Button
                        className="rounded-lg"
                        onClick={() => {
                            setEditingRoute(null)
                            setRouteData({ title: '', description: '', price: '0', target_goal: 'general_fitness', standard: '' })
                            setIsRouteDialogOpen(true)
                        }}
                    >
                        + Tạo lộ trình mới
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Route List */}
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="font-bold text-lg mb-4 text-foreground">Danh sách lộ trình</h3>
                        {!isLoading && routes.length > 0 ? routes.map((route) => (
                            <Card
                                key={route.id}
                                className={`p-4 rounded-xl border-border cursor-pointer transition-all hover:shadow-md ${selectedRoute?.id === route.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-card'}`}
                                onClick={() => {
                                    setSelectedRoute(route)
                                    fetchStages(route.id)
                                }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-foreground line-clamp-1">{route.title}</h4>
                                        <div className={`mt-1 inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
                                            route.target_goal === 'weight_loss' ? 'bg-red-500/10 text-red-500' : 
                                            route.target_goal === 'muscle_gain' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                                        }`}>
                                            {route.target_goal === 'weight_loss' ? 'Giảm cân' : route.target_goal === 'muscle_gain' ? 'Tăng cơ' : 'Sức khỏe'}
                                        </div>
                                    </div>
                                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                            setEditingRoute(route)
                                            setRouteData({ title: route.title, description: route.description, price: route.price.toString(), target_goal: route.target_goal, standard: route.standard })
                                            setIsRouteDialogOpen(true)
                                        }}>
                                            <span className="text-xs">✏️</span>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteRoute(route.id)}>
                                            <span className="text-xs">🗑️</span>
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs text-muted-foreground line-clamp-2">{route.description || 'Không có mô tả'}</p>
                                    <span className="text-xs font-bold text-primary shrink-0">
                                        {route.price > 0 ? `${route.price.toLocaleString()}đ` : 'Free'}
                                    </span>
                                </div>
                            </Card>
                        )) : !isLoading && (
                            <p className="text-sm text-muted-foreground text-center py-10">Chưa có lộ trình nào.</p>
                        )}
                        {isLoading && <p className="text-center py-10 text-sm">Đang tải...</p>}
                    </div>

                    {/* Stage Management */}
                    <div className="lg:col-span-2">
                        {selectedRoute ? (
                            <Card className="p-6 rounded-2xl bg-card border-border">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">{selectedRoute.title}</h3>
                                        <p className="text-sm text-muted-foreground">Quản lý các bước trong lộ trình này</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingStage(null)
                                            setStageData({ title: '', stage_order: stages.length + 1, video_url: '', description: '', nutrition_plan: '', calories_target: 0 })
                                            setIsStageDialogOpen(true)
                                        }}
                                    >
                                        + Thêm bước mới
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {stages.length > 0 ? stages.map((stage, idx) => (
                                        <div key={stage.id} className="flex items-start gap-4 p-4 rounded-xl bg-secondary/20 border border-border group">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                                {stage.stage_order}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h5 className="font-bold text-foreground truncate">{stage.title}</h5>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                                                            setEditingStage(stage)
                                                            setStageData({ ...stage })
                                                            setIsStageDialogOpen(true)
                                                        }}>
                                                            Sửa
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleDeleteStage(stage.id)}>
                                                            Xóa
                                                        </Button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{stage.description}</p>
                                                {stage.video_url && (
                                                    <a href={stage.video_url} target="_blank" rel="noreferrer" className="text-[10px] text-primary underline mt-2 inline-block truncate max-w-full">
                                                        {stage.video_url}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl">
                                            <p className="text-muted-foreground italic">Lộ trình này chưa có bước nào.</p>
                                            <Button variant="link" size="sm" className="mt-2" onClick={() => setIsStageDialogOpen(true)}>Hãy thêm bước đầu tiên</Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ) : (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-10 text-center">
                                <div className="text-5xl mb-4 opacity-20">🗺️</div>
                                <h3 className="font-bold text-foreground mb-2">Chọn lộ trình để quản lý</h3>
                                <p className="text-sm text-muted-foreground">Bấm vào một lộ trình ở danh sách bên trái để bắt đầu thêm các bước tập luyện.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Route Dialog */}
                <Dialog open={isRouteDialogOpen} onOpenChange={setIsRouteDialogOpen}>
                    <DialogContent className="bg-card border-border">
                        <DialogHeader>
                            <DialogTitle>{editingRoute ? 'Chỉnh sửa lộ trình' : 'Tạo lộ trình mới'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Tiêu đề lộ trình</Label>
                                <Input
                                    placeholder="VD: 30 ngày giảm cân thần tốc"
                                    value={routeData.title}
                                    onChange={e => setRouteData({ ...routeData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Mục tiêu lộ trình</Label>
                                <select 
                                    className="w-full h-10 px-3 rounded-md bg-secondary/30 border-none outline-none text-sm font-medium focus:ring-2 ring-primary/20"
                                    value={routeData.target_goal}
                                    onChange={e => setRouteData({ ...routeData, target_goal: e.target.value })}
                                >
                                    <option value="weight_loss">Giảm cân (Weight Loss)</option>
                                    <option value="muscle_gain">Tăng cơ (Muscle Gain)</option>
                                    <option value="maintenance">Duy trì (Maintenance)</option>
                                    <option value="general_fitness">Sức khỏe tổng quát (General Fitness)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tiêu chuẩn quốc tế (Tùy chọn)</Label>
                                <Input
                                    placeholder="VD: Chuẩn NASM, ACSM..."
                                    value={routeData.standard}
                                    onChange={e => setRouteData({ ...routeData, standard: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Mô tả ngắn</Label>
                                <Textarea
                                    placeholder="Giới thiệu về mục tiêu và đối tượng của lộ trình..."
                                    value={routeData.description}
                                    onChange={e => setRouteData({ ...routeData, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Giá bán (VND) - Để 0 nếu Miễn phí</Label>
                                <Input
                                    type="number"
                                    placeholder="VD: 100000"
                                    value={routeData.price}
                                    onChange={e => setRouteData({ ...routeData, price: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateOrUpdateRoute}>
                                {editingRoute ? 'Lưu thay đổi' : 'Tạo lộ trình'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Stage Dialog */}
                <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
                    <DialogContent className="bg-card border-border">
                        <DialogHeader>
                            <DialogTitle>{editingStage ? 'Chỉnh sửa bước' : 'Thêm bước mới'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3 space-y-2">
                                    <Label>Tiêu đề bước</Label>
                                    <Input
                                        placeholder="VD: Khởi động cơ bản"
                                        value={stageData.title}
                                        onChange={e => setStageData({ ...stageData, title: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-1 space-y-2">
                                    <Label>Thứ tự</Label>
                                    <Input
                                        type="number"
                                        value={stageData.stage_order}
                                        onChange={e => setStageData({ ...stageData, stage_order: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Video bài tập (.mp4)</Label>
                                <Input
                                    type="file"
                                    accept="video/mp4,video/mov,video/webm"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            setVideoFile(file)
                                            setStageData({ ...stageData, video_url: '' })
                                        }
                                    }}
                                    className="cursor-pointer"
                                />
                                {videoFile && (
                                    <p className="text-xs text-primary">✓ {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Hướng dẫn chi tiết</Label>
                                <Textarea
                                    placeholder="Mô tả các động tác cần thực hiện..."
                                    value={stageData.description}
                                    onChange={e => setStageData({ ...stageData, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Kế hoạch dinh dưỡng (Tùy chọn)</Label>
                                <Textarea
                                    placeholder="Hướng dẫn ăn uống cho buổi này (VD: Ức gà, salad...)"
                                    value={stageData.nutrition_plan}
                                    onChange={e => setStageData({ ...stageData, nutrition_plan: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Mục tiêu Kcal (Tùy chọn)</Label>
                                <Input
                                    type="number"
                                    placeholder="VD: 500"
                                    value={stageData.calories_target || ''}
                                    onChange={e => setStageData({ ...stageData, calories_target: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateOrUpdateStage} disabled={isUploading}>
                                {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang upload...</> : editingStage ? 'Cập nhật' : 'Thêm bước'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}
