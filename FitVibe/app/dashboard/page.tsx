'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { userApi, aiApi } from '@/lib/api'
import { toast } from 'sonner'
import { OnboardingModal } from '@/components/OnboardingModal'
import { RecommendationModal } from '@/components/RecommendationModal'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('500000')

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [isRecOpen, setIsRecOpen] = useState(false)
  const [recContent, setRecContent] = useState('')
  const [isGeneratingRec, setIsGeneratingRec] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'user')) {
      router.push('/')
    }
  }, [user, authLoading, router])

  const [recommendations, setRecommendations] = useState<any[]>([])

  useEffect(() => {
    if (user?.role === 'user') {
      fetchDashboardData()
      fetchRecommendations()
    }
  }, [user])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const res = await userApi.getMe()
      setData(res)
      if (res?.user && (!res.user.height || !res.user.weight)) {
        setIsOnboardingOpen(true)
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu tổng quan')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const res = await userApi.getRecommendations()
      setRecommendations(res)
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
    }
  }

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount)
    if (isNaN(amount) || amount <= 0) return toast.error('Số tiền không hợp lệ')

    try {
      const res = await userApi.topUpBalance(amount)
      if (res.success && res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl
      } else {
        toast.error('Nạp tiền thất bại')
      }
    } catch (error) {
      toast.error('Nạp tiền thất bại')
    }
  }

  const handleGenerateRec = async () => {
    if (!profile.height || !profile.weight) {
      return setIsOnboardingOpen(true)
    }
    setIsGeneratingRec(true)
    try {
      const res = await aiApi.getRecommendation(profile)
      if (res.success) {
        setRecContent(res.recommendation)
        setIsRecOpen(true)
      } else {
        toast.error('Không thể tạo lộ trình lúc này')
      }
    } catch (error) {
      toast.error('Lỗi khi kết nối với AI')
    } finally {
      setIsGeneratingRec(false)
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

  const healthStats = data?.healthStats || {}
  const profile = data?.user || {}

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Chào mừng, {user.name}!</h2>
            <p className="text-muted-foreground">Xem tổng quan sức khỏe của bạn</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Card className="p-4 bg-gradient-to-r from-accent/10 to-primary/10 border-border flex items-center gap-6 min-w-[250px]">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Số dư hiện tại</p>
                <p className="text-2xl font-black text-primary">
                  {isLoading ? '...' : Math.floor(profile.balance || 0).toLocaleString('vi-VN')}đ
                </p>
              </div>
              <Button size="sm" className="rounded-xl font-bold" onClick={() => setIsTopUpOpen(true)}>
                + Nạp tiền
              </Button>
            </Card>

            <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
              <DialogContent className="max-w-md bg-card border-border rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">Nạp tiền vào ví 💳</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider opacity-50">Số tiền muốn nạp (VND)</Label>
                    <Input 
                      type="number" 
                      value={topUpAmount} 
                      onChange={e => setTopUpAmount(e.target.value)}
                      className="text-2xl font-black h-16 rounded-2xl bg-secondary/30 border-none focus:ring-2 ring-primary/20 text-center"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['100000', '200000', '500000', '1000000', '2000000', '5000000'].map(amt => (
                      <Button 
                        key={amt} 
                        variant="outline" 
                        size="sm"
                        className={`rounded-xl text-[10px] font-bold ${topUpAmount === amt ? 'bg-primary text-primary-foreground border-primary' : ''}`}
                        onClick={() => setTopUpAmount(amt)}
                      >
                        {parseInt(amt).toLocaleString()}
                      </Button>
                    ))}
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground italic">
                    * Bạn sẽ được chuyển hướng sang cổng thanh toán VNPay Sandbox để hoàn tất giao dịch.
                  </p>
                </div>
                <DialogFooter>
                  <Button onClick={handleTopUp} className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20">
                    Xác nhận nạp tiền
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'BMI', value: isLoading ? '...' : healthStats.bmi?.toFixed(1) || '--', status: healthStats.category || 'Nhập chỉ số' },
            { label: 'Cân nặng', value: isLoading ? '...' : (profile.weight || '--') + ' kg', status: 
              profile.goal === 'weight_loss' ? 'Mục tiêu: Giảm cân' : 
              profile.goal === 'muscle_gain' ? 'Mục tiêu: Tăng cơ' : 
              profile.goal === 'maintenance' ? 'Mục tiêu: Duy trì' : 
              profile.goal === 'general_fitness' ? 'Sức khỏe tổng quát' : 'Duy trì' 
            },
            { label: 'BMR', value: isLoading ? '...' : (healthStats.bmr?.toFixed(0) || '--') + ' cal', status: 'Năng lượng nghỉ' },
            { label: 'TDEE', value: isLoading ? '...' : (healthStats.tdee?.toFixed(0) || '--') + ' cal', status: 'Năng lượng ngày' },
          ].map((stat, idx) => (
            <Card key={idx} className="p-6 rounded-2xl bg-gradient-to-br from-card to-secondary/5 border-border">
              <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-accent mt-2">{stat.status}</p>
            </Card>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card className="p-6 rounded-2xl bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Hoạt động gần đây</h3>
            <div className="space-y-3">
              {profile.weight ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <p className="text-sm text-foreground">Ghi nhận cân nặng mới nhất: {profile.weight} kg</p>
                </div>
              ) : null}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <p className="text-sm text-foreground">Bắt đầu hành trình FitVibe của bạn</p>
              </div>
            </div>
          </Card>

          {/* Tips */}
          <Card className="p-6 rounded-2xl bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Lời khuyên cho bạn</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-lg">💡</span>
                <p className="text-sm text-foreground">
                  {profile.goal === 'weight_loss'
                    ? 'Hãy tập trung vào Cardio và thâm hụt Calo.'
                    : profile.goal === 'muscle_gain'
                      ? 'Bổ sung Protein và tập nâng tạ nặng hơn.'
                      : profile.goal === 'maintenance'
                        ? 'Duy trì lối sống năng động và ăn uống cân bằng.'
                        : 'Luyện tập đều đặn để cải thiện sức khỏe tổng thể.'}
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-lg">💧</span>
                <p className="text-sm text-foreground">Đừng quên uống đủ 2L nước mỗi ngày.</p>
              </div>
            </div>
          </Card>

          {/* New Section: Register with Coach */}
          <Card className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 md:col-span-2">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <span>🏆</span> Tìm kiếm Huấn luyện viên cá nhân?
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Đăng ký tập luyện cùng đội ngũ huấn luyện viên chuyên nghiệp để có lộ trình riêng biệt và hiệu quả nhất cho bản thân bạn.
                </p>
              </div>
              <Button
                onClick={() => router.push('/dashboard/coaches')}
                className="rounded-full px-8 py-6 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              >
                Khám phá ngay
              </Button>
            </div>
          </Card>
        </div>

        {/* Smart Recommendations Section */}
        <div className="mt-12 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-accent rounded-full" />
              <h3 className="text-2xl font-black text-foreground">Gợi ý lộ trình cho bạn</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleGenerateRec} disabled={isGeneratingRec} className="font-bold bg-gradient-to-r from-accent to-primary text-white shadow-lg shadow-accent/20">
                {isGeneratingRec ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : '✨ Gợi ý Lộ trình AI'}
              </Button>
              <Button variant="ghost" className="text-xs font-bold text-accent" onClick={() => router.push('/dashboard/routes')}>Xem tất cả →</Button>
            </div>
          </div>

          {!isLoading && recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((route: any) => (
                <Card key={route.id} className="group overflow-hidden rounded-3xl bg-card border-border hover:border-accent/50 transition-all hover:shadow-2xl hover:shadow-accent/5 cursor-pointer" onClick={() => router.push(`/dashboard/routes/${route.id}`)}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        route.target_goal === 'weight_loss' ? 'bg-red-500/10 text-red-500' : 
                        route.target_goal === 'muscle_gain' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                      }`}>
                        {route.target_goal === 'weight_loss' ? 'Giảm cân' : route.target_goal === 'muscle_gain' ? 'Tăng cơ' : 'Thể lực'}
                      </div>
                    </div>
                    <h4 className="text-lg font-black text-foreground mb-1 group-hover:text-accent transition-colors">{route.title}</h4>
                    <p className="text-xs text-muted-foreground mb-4">HLV: {route.coach_name}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="text-lg font-black text-primary">{Math.floor(route.price).toLocaleString()}đ</span>
                      <Button size="sm" variant="ghost" className="rounded-full font-bold group-hover:bg-accent group-hover:text-white transition-all">Chi tiết</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : !isLoading && (
            <div className="text-center py-12 bg-secondary/10 rounded-3xl border-2 border-dashed border-border/50">
              <p className="text-muted-foreground font-medium italic">Vui lòng cập nhật chiều cao cân nặng để nhận gợi ý chính xác hơn.</p>
            </div>
          )}
        </div>
      </div>

      <OnboardingModal 
        open={isOnboardingOpen} 
        onSuccess={() => {
          setIsOnboardingOpen(false)
          fetchDashboardData()
        }} 
      />

      <RecommendationModal 
        open={isRecOpen} 
        onOpenChange={setIsRecOpen} 
        content={recContent} 
      />
    </DashboardLayout>
  )
}
