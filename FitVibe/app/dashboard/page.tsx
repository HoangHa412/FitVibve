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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Chào buổi sáng ☀️'
    if (hour < 18) return 'Chào buổi chiều 🌤️'
    return 'Chào buổi tối 🌙'
  }

  const bmiValue = healthStats.bmi || 22
  const bmiPercent = Math.min(Math.max(((bmiValue - 15) / (35 - 15)) * 100, 2), 98)

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
        {/* Top Header & Wallet */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Tổng quan sức khỏe cá nhân
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              {getGreeting()}, <span className="text-gradient-animated">{user.name}</span>!
            </h2>
            <p className="text-muted-foreground text-sm">
              Mục tiêu hiện tại:{' '}
              <span className="font-bold text-foreground">
                {profile.goal === 'weight_loss' ? '🔥 Giảm mỡ / Giảm cân' :
                 profile.goal === 'muscle_gain' ? '💪 Tăng cơ / Phát triển vóc dáng' :
                 profile.goal === 'general_fitness' ? '⚡ Thể lực & Sức bền dẻo dai' : '🌱 Duy trì lối sống khỏe mạnh'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Card className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-transparent border-primary/20 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Số dư ví</p>
                <p className="text-2xl font-black text-primary">
                  {isLoading ? '...' : Math.floor(profile.balance || 0).toLocaleString('vi-VN')}đ
                </p>
              </div>
              <Button size="sm" className="rounded-xl font-bold btn-premium shadow-md active:scale-95" onClick={() => setIsTopUpOpen(true)}>
                + Nạp tiền
              </Button>
            </Card>

            <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
              <DialogContent className="max-w-md bg-card border-border rounded-[2.5rem] p-8 animate-scale-in">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">Nạp tiền vào ví 💳</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Số tiền muốn nạp (VND)</Label>
                    <Input 
                      type="number" 
                      value={topUpAmount} 
                      onChange={e => setTopUpAmount(e.target.value)}
                      className="text-2xl font-black h-16 rounded-2xl bg-secondary/40 border-none focus:ring-2 ring-primary/20 text-center"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['100000', '200000', '500000', '1000000', '2000000', '5000000'].map(amt => (
                      <Button 
                        key={amt} 
                        variant="outline" 
                        size="sm"
                        className={`rounded-xl text-xs font-bold transition-all active:scale-95 ${topUpAmount === amt ? 'bg-primary text-primary-foreground border-primary shadow-sm' : ''}`}
                        onClick={() => setTopUpAmount(amt)}
                      >
                        {parseInt(amt).toLocaleString()}đ
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-center text-muted-foreground italic">
                    * Bạn sẽ được chuyển hướng sang cổng thanh toán VNPay Sandbox để hoàn tất giao dịch an toàn.
                  </p>
                </div>
                <DialogFooter>
                  <Button onClick={handleTopUp} className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest btn-premium shadow-xl shadow-primary/20 active:scale-95">
                    Xác nhận nạp tiền
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Quick Action Shortcuts with Bounce Hover */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { icon: '⚖️', label: 'Ghi cân nặng', href: '/dashboard/weight', bg: 'hover:border-amber-500/40 hover:shadow-amber-500/5' },
            { icon: '🏋️', label: 'Bài tập hôm nay', href: '/dashboard/workouts', bg: 'hover:border-primary/40 hover:shadow-primary/5' },
            { icon: '🥦', label: 'Thực đơn dinh dưỡng', href: '/dashboard/meals', bg: 'hover:border-emerald-500/40 hover:shadow-emerald-500/5' },
            { icon: '👨‍🏫', label: 'Đội ngũ HLV', href: '/dashboard/coaches', bg: 'hover:border-teal-500/40 hover:shadow-teal-500/5' },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={() => router.push(action.href)}
              className={`p-4 rounded-2xl bg-card border border-border/70 ${action.bg} hover:-translate-y-1.5 active:scale-95 transition-all duration-300 flex items-center gap-3 text-left shadow-sm group cursor-pointer`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl group-hover:scale-115 group-hover:-rotate-6 transition-transform duration-300 shadow-sm">
                {action.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{action.label}</p>
                <p className="text-[10px] text-muted-foreground group-hover:translate-x-0.5 transition-transform">Truy cập nhanh →</p>
              </div>
            </button>
          ))}
        </div>

        {/* Health Stats Grid with BMI Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* BMI Gauge Card */}
          <Card className="p-6 rounded-3xl bg-card border-border shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-primary/30 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chỉ số BMI</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                  healthStats.category?.includes('Bình thường') ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                  healthStats.category?.includes('Gầy') ? 'bg-blue-500/15 text-blue-600' :
                  'bg-orange-500/15 text-orange-600'
                }`}>
                  {healthStats.category || 'Chưa có'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-black text-foreground">
                  {isLoading ? '...' : healthStats.bmi?.toFixed(1) || '--'}
                </span>
                <span className="text-xs text-muted-foreground">kg/m²</span>
              </div>

              {/* Spectrum Bar with Animated Indicator */}
              <div className="space-y-1.5">
                <div className="relative h-3.5 rounded-full overflow-visible flex bg-secondary/80 p-0.5">
                  <div className="w-[17.5%] h-full rounded-l-full bg-blue-400" title="Gầy (<18.5)" />
                  <div className="w-[32.5%] h-full bg-emerald-400" title="Bình thường (18.5-24.9)" />
                  <div className="w-[25%] h-full bg-amber-400" title="Thừa cân (25-29.9)" />
                  <div className="w-[25%] h-full rounded-r-full bg-rose-500" title="Béo phì (≥30)" />
                  {healthStats.bmi && (
                    <div
                      className="absolute -top-1 w-3 h-5 bg-foreground rounded-full shadow-lg ring-2 ring-primary/60 transition-all duration-1000 ease-out"
                      style={{ left: `calc(${bmiPercent}% - 6px)` }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground font-semibold px-0.5">
                  <span>Gầy</span>
                  <span>Chuẩn</span>
                  <span>Thừa cân</span>
                  <span>Béo phì</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground flex justify-between items-center">
              <span>Chiều cao: <strong className="text-foreground">{profile.height || '--'} cm</strong></span>
              <span>Cân nặng: <strong className="text-foreground">{profile.weight || '--'} kg</strong></span>
            </div>
          </Card>

          {/* Calorie & Energy Card */}
          <Card className="p-6 rounded-3xl bg-card border-border shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-primary/30 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Calo Mục Tiêu</span>
                <span className="text-xs font-bold text-primary">Mỗi ngày</span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-black text-primary">
                  {isLoading ? '...' : healthStats.targetCalories?.toFixed(0) || healthStats.tdee?.toFixed(0) || '--'}
                </span>
                <span className="text-xs text-muted-foreground">kcal / ngày</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">BMR (Chuyển hóa cơ bản):</span>
                  <strong className="text-foreground">{healthStats.bmr?.toFixed(0) || '--'} kcal</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">TDEE (Năng lượng tiêu hao):</span>
                  <strong className="text-foreground">{healthStats.tdee?.toFixed(0) || '--'} kcal</strong>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 text-[11px] text-muted-foreground flex items-center gap-2">
              <span className="animate-bounce-subtle">💡</span>
              <span className="truncate">
                {profile.goal === 'weight_loss' ? 'Đã trừ ~300-500 kcal tạo thâm hụt mỡ' :
                 profile.goal === 'muscle_gain' ? 'Đã cộng ~300 kcal để nuôi cơ bắp' : 'Mức năng lượng giữ cân ổn định'}
              </span>
            </div>
          </Card>

          {/* Hydration & Daily Advice Card */}
          <Card className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-teal-500/5 to-transparent border-primary/20 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lời khuyên hôm nay</span>
                <span className="text-xl animate-bounce-subtle">💧</span>
              </div>
              <h4 className="font-bold text-foreground text-sm mb-2">Uống đủ nước & Giữ nhịp độ</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Với cân nặng {profile.weight || 60}kg, cơ thể cần tối thiểu <strong className="text-primary">{((profile.weight || 60) * 0.04).toFixed(1)}L nước/ngày</strong> để trao đổi chất và phục hồi cơ hiệu quả.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Cần tư vấn thêm?</span>
              <Button size="sm" variant="ghost" onClick={handleGenerateRec} className="text-xs font-bold text-primary hover:text-primary active:scale-95">
                Hỏi AI ngay →
              </Button>
            </div>
          </Card>
        </div>

        {/* Coach Promotion Card with Shimmer Badge */}
        <Card className="p-8 rounded-[2rem] bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-primary/25 shadow-md relative overflow-hidden shimmer-badge">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-[10px] font-black uppercase tracking-wider">
                <span>🏆</span> Huấn luyện viên 1-Kèm-1
              </div>
              <h3 className="text-2xl font-black text-foreground">
                Muốn đạt mục tiêu nhanh hơn gấp 2 lần?
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-2xl">
                Tham gia cùng các Huấn luyện viên thể hình hàng đầu được chứng nhận NASM / ACSM. Được thiết kế lộ trình riêng, theo dõi bài tập và sửa kỹ thuật trực tiếp.
              </p>
            </div>
            <Button
              onClick={() => router.push('/dashboard/coaches')}
              className="rounded-2xl px-8 py-6 font-black text-sm uppercase tracking-wider btn-premium shadow-xl shadow-primary/20 shrink-0 active:scale-95 hover:scale-105 transition-all"
            >
              Xem đội ngũ HLV →
            </Button>
          </div>
        </Card>

        {/* Smart Recommendations Section */}
        <div className="mt-12 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-accent rounded-full animate-pulse" />
              <h3 className="text-2xl font-black text-foreground">Gợi ý lộ trình cho bạn</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleGenerateRec} disabled={isGeneratingRec} className="font-bold bg-gradient-to-r from-accent to-primary text-white shadow-lg shadow-accent/20 active:scale-95 transition-all">
                {isGeneratingRec ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : '✨ Gợi ý Lộ trình AI'}
              </Button>
              <Button variant="ghost" className="text-xs font-bold text-accent hover:text-accent active:scale-95" onClick={() => router.push('/dashboard/routes')}>Xem tất cả →</Button>
            </div>
          </div>

          {!isLoading && recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((route: any, idx: number) => (
                <Card 
                  key={route.id} 
                  className="group overflow-hidden rounded-3xl bg-card border-border hover:border-accent/50 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-1.5 cursor-pointer" 
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  onClick={() => router.push(`/dashboard/routes/${route.id}`)}
                >
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
