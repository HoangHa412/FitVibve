'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { userApi } from '@/lib/api'
import { toast } from 'sonner'
import { Calculator, Flame, Zap, Target, Scale, Activity } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HealthStats {
  bmi?: number;
  category?: string;
  bmr?: number;
  tdee?: number;
  targetCalories?: number;
}

interface UserProfile {
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  goal?: string;
  full_name?: string;
}

interface UserMeResponse {
  user: UserProfile;
  healthStats: HealthStats;
}

export default function HealthMetricsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [health, setHealth] = useState<HealthStats>({})
  const [profile, setProfile] = useState<UserProfile>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    goal: ''
  })

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'user')) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role === 'user') {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await userApi.getMe() as unknown as UserMeResponse
      setHealth(res.healthStats || {})
      setProfile(res.user || {})
      if (res.user) {
        setFormData({
          age: res.user.age?.toString() || '',
          gender: res.user.gender || '',
          height: res.user.height?.toString() || '',
          weight: res.user.weight?.toString() || '',
          goal: res.user.goal || ''
        })
      }
    } catch (error) {
      toast.error('Không thể tải chỉ số sức khỏe')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      await userApi.updateProfile({
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        goal: formData.goal
      })
      toast.success('Đã cập nhật chỉ số sức khỏe')
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error('Lỗi khi cập nhật dữ liệu')
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Chỉ số sức khỏe</h2>
            <p className="text-muted-foreground">Theo dõi và cập nhật các thông số cơ thể</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-lg">+ Cập nhật chỉ số</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-card border-border">
              <DialogHeader>
                <DialogTitle>Cập nhật thông tin cơ thể</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tuổi</Label>
                    <Input type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Giới tính</Label>
                    <Select value={formData.gender} onValueChange={v => setFormData({ ...formData, gender: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="male">Nam</SelectItem>
                        <SelectItem value="female">Nữ</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Chiều cao (cm)</Label>
                    <Input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cân nặng (kg)</Label>
                    <Input type="number" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Mục tiêu</Label>
                  <Select value={formData.goal} onValueChange={v => setFormData({ ...formData, goal: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mục tiêu" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="weight_loss">Giảm cân</SelectItem>
                      <SelectItem value="muscle_gain">Tăng cơ</SelectItem>
                      <SelectItem value="maintain">Duy trì</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpdateProfile} className="w-full">Lưu thay đổi</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'BMI', value: isLoading ? '...' : health.bmi?.toFixed(1) || '--', target: '18.5 - 24.9', status: health.category || 'N/A' },
            { label: 'BMR', value: isLoading ? '...' : (health.bmr?.toFixed(0) || '--') + ' cal', target: 'Năng lượng nghỉ', status: 'Cơ bản' },
            { label: 'TDEE', value: isLoading ? '...' : (health.tdee?.toFixed(0) || '--') + ' cal', target: 'Năng lượng ngày', status: 'Tổng cộng' },
            { label: 'Mục tiêu ngày', value: isLoading ? '...' : (health.targetCalories?.toFixed(0) || '--') + ' cal', target: 'Theo mục tiêu', status: profile.goal === 'weight_loss' ? 'Thâm hụt' : profile.goal === 'muscle_gain' ? 'Dư thừa' : 'Cân bằng' },
          ].map((metric, idx) => (
            <Card key={idx} className="p-6 rounded-2xl bg-gradient-to-br from-card to-secondary/5 border-border">
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-3xl font-bold text-foreground">{metric.value}</p>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">{metric.target}</p>
                <p className="text-xs text-accent font-semibold mt-1">{metric.status}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detailed Calculation Guide Card */}
          <Card className="p-6 rounded-2xl bg-card border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Cách tính chỉ số</h3>
                    <p className="text-[11px] text-muted-foreground">Chuẩn y khoa WHO & Mifflin-St Jeor</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Công thức chuẩn
                </span>
              </div>

              <div className="space-y-4">
                {/* 1. BMI */}
                <div className="p-4 rounded-xl bg-secondary/20 border border-border hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Scale className="w-3.5 h-3.5" />
                      </div>
                      <p className="font-bold text-foreground text-sm">BMI (Body Mass Index)</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-background/60 px-2 py-0.5 rounded border border-border">
                      Chỉ số khối cơ thể
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Đánh giá mức độ tương quan giữa Chiều cao và Cân nặng để phân loại thể trạng gầy, chuẩn hay thừa cân.
                  </p>
                  
                  {/* Formula Box */}
                  <div className="mt-2.5 p-2.5 rounded-lg bg-background/70 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="text-muted-foreground text-[11px] font-medium">Công thức:</span>
                    <span className="font-mono text-primary font-semibold">BMI = Cân nặng (kg) / [Chiều cao (m)]²</span>
                  </div>

                  {/* Standard Ranges */}
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                    <div className="p-1.5 rounded bg-background/40 border border-border/50 text-center">
                      <span className="text-muted-foreground block text-[10px]">Gầy</span>
                      <span className="font-semibold text-blue-400">&lt; 18.5</span>
                    </div>
                    <div className="p-1.5 rounded bg-background/40 border border-border/50 text-center">
                      <span className="text-muted-foreground block text-[10px]">Chuẩn</span>
                      <span className="font-semibold text-green-400">18.5 – 24.9</span>
                    </div>
                    <div className="p-1.5 rounded bg-background/40 border border-border/50 text-center">
                      <span className="text-muted-foreground block text-[10px]">Thừa cân</span>
                      <span className="font-semibold text-yellow-400">25.0 – 29.9</span>
                    </div>
                    <div className="p-1.5 rounded bg-background/40 border border-border/50 text-center">
                      <span className="text-muted-foreground block text-[10px]">Béo phì</span>
                      <span className="font-semibold text-destructive">≥ 30.0</span>
                    </div>
                  </div>
                </div>

                {/* 2. BMR */}
                <div className="p-4 rounded-xl bg-secondary/20 border border-border hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                        <Flame className="w-3.5 h-3.5" />
                      </div>
                      <p className="font-bold text-foreground text-sm">BMR (Basal Metabolic Rate)</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-background/60 px-2 py-0.5 rounded border border-border">
                      Năng lượng nghỉ ngơi
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Lượng Calo tối thiểu cơ thể cần để duy trì các chức năng sinh tồn (hô hấp, tim mạch, tuần hoàn não, thân nhiệt) khi ở trạng thái nghỉ ngơi suốt 24h.
                  </p>

                  {/* Formula Box */}
                  <div className="mt-2.5 p-2.5 rounded-lg bg-background/70 border border-border space-y-1 text-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground text-[11px] font-medium">Nam giới:</span>
                      <span className="font-mono text-orange-400 font-semibold text-[11px]">10×W + 6.25×H - 5×A + 5</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground text-[11px] font-medium">Nữ giới:</span>
                      <span className="font-mono text-orange-400 font-semibold text-[11px]">10×W + 6.25×H - 5×A - 161</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground/80 mt-1.5 italic">
                    * W: Cân nặng (kg), H: Chiều cao (cm), A: Số tuổi. Tuyệt đối không ăn dưới mức BMR lâu dài để tránh sụt giảm chuyển hóa.
                  </p>
                </div>

                {/* 3. TDEE */}
                <div className="p-4 rounded-xl bg-secondary/20 border border-border hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <p className="font-bold text-foreground text-sm">TDEE (Total Daily Energy Expenditure)</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-background/60 px-2 py-0.5 rounded border border-border">
                      Tổng năng lượng ngày
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Tổng lượng Calo bạn đốt cháy trong 1 ngày, bao gồm trao đổi chất cơ bản (BMR), tiêu hóa thức ăn (TEF) và toàn bộ vận động thể chất.
                  </p>

                  {/* Formula Box */}
                  <div className="mt-2.5 p-2.5 rounded-lg bg-background/70 border border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground text-[11px] font-medium">Công thức:</span>
                    <span className="font-mono text-emerald-400 font-semibold">TDEE = BMR × Hệ số vận động (R)</span>
                  </div>

                  {/* Multipliers */}
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-muted-foreground">
                    <div className="flex justify-between p-1.5 rounded bg-background/40 border border-border/50">
                      <span>Ít vận động (văn phòng):</span>
                      <span className="font-mono font-bold text-foreground">R = 1.2</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-background/40 border border-border/50">
                      <span>Vận động nhẹ (1-3 ngày/tuần):</span>
                      <span className="font-mono font-bold text-foreground">R = 1.375</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-background/40 border border-border/50">
                      <span>Vận động vừa (3-5 ngày/tuần):</span>
                      <span className="font-mono font-bold text-foreground">R = 1.55</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-background/40 border border-border/50">
                      <span>Vận động nhiều (6-7 ngày/tuần):</span>
                      <span className="font-mono font-bold text-foreground">R = 1.725</span>
                    </div>
                  </div>
                </div>

                {/* 4. Target Calories */}
                <div className="p-4 rounded-xl bg-secondary/20 border border-border hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <Target className="w-3.5 h-3.5" />
                      </div>
                      <p className="font-bold text-foreground text-sm">Calo mục tiêu (Target Calories)</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-background/60 px-2 py-0.5 rounded border border-border">
                      Lượng nạp đề xuất
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Xác định lượng Calo ăn vào mỗi ngày dựa trên nguyên tắc cân bằng năng lượng để đạt mục tiêu vóc dáng:
                  </p>

                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-lg bg-background/70 border border-border">
                      <p className="font-bold text-destructive text-xs">Giảm mỡ</p>
                      <p className="font-mono font-bold text-foreground text-[11px] mt-0.5">TDEE - 500 cal</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Giảm an toàn ~0.5kg/tuần</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background/70 border border-border">
                      <p className="font-bold text-green-400 text-xs">Duy trì</p>
                      <p className="font-mono font-bold text-foreground text-[11px] mt-0.5">TDEE ± 0 cal</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Giữ cân nặng ổn định</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background/70 border border-border">
                      <p className="font-bold text-primary text-xs">Tăng cơ</p>
                      <p className="font-mono font-bold text-foreground text-[11px] mt-0.5">TDEE + 500 cal</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Thặng dư để tổng hợp cơ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* User Status Card */}
          <Card className="p-6 rounded-2xl bg-card border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Tình trạng của bạn</h3>
                    <p className="text-[11px] text-muted-foreground">Phân tích thể trạng và dinh dưỡng cá nhân</p>
                  </div>
                </div>
                {profile.height && (
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Đã cá nhân hóa
                  </span>
                )}
              </div>

              <div className="space-y-5">
                {!profile.height ? (
                  <div className="text-center py-16 opacity-60 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-secondary/50 mx-auto flex items-center justify-center text-2xl">
                      📊
                    </div>
                    <p className="text-sm font-medium text-foreground">Chưa có thông số cơ thể</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Vui lòng nhấn &quot;+ Cập nhật chỉ số&quot; ở trên để xem phân tích chi tiết thể trạng của bạn.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* BMI Progress Bar */}
                    <div className="p-4 rounded-xl bg-secondary/20 border border-border">
                      <div className="flex justify-between items-center mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Chỉ số BMI hiện tại:</span>
                          <span className="text-base font-black text-foreground">{health.bmi?.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-accent font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                          {health.category}
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-secondary flex overflow-hidden">
                        <div className="h-full bg-blue-400" style={{ width: '18.5%' }} title="Gầy (<18.5)"></div>
                        <div className="h-full bg-green-500" style={{ width: '6.5%' }} title="Chuẩn (18.5-24.9)"></div>
                        <div className="h-full bg-yellow-500" style={{ width: '5%' }} title="Thừa cân (25-29.9)"></div>
                        <div className="h-full bg-red-500" style={{ width: '70%' }} title="Béo phì (≥30)"></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                        <span>Gầy (&lt;18.5)</span>
                        <span className="text-green-500 font-semibold">Chuẩn (18.5 - 24.9)</span>
                        <span className="text-yellow-500 font-semibold">Thừa cân (25 - 29.9)</span>
                        <span className="text-destructive font-semibold">Béo phì (≥30)</span>
                      </div>
                    </div>

                    {/* Breakdown of personal calculated stats */}
                    <div className="p-4 rounded-xl bg-secondary/20 border border-border space-y-3">
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                        <span>Hồ sơ cơ thể</span>
                        <span className="text-[10px] font-normal text-muted-foreground">Đã đồng bộ</span>
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between items-center p-2 rounded-lg bg-background/60 border border-border">
                          <span className="text-muted-foreground text-[11px]">Chiều cao:</span>
                          <span className="font-semibold text-foreground font-mono">{profile.height} cm</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-background/60 border border-border">
                          <span className="text-muted-foreground text-[11px]">Cân nặng:</span>
                          <span className="font-semibold text-foreground font-mono">{profile.weight} kg</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-background/60 border border-border">
                          <span className="text-muted-foreground text-[11px]">Độ tuổi:</span>
                          <span className="font-semibold text-foreground font-mono">{profile.age || '--'} tuổi</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-background/60 border border-border">
                          <span className="text-muted-foreground text-[11px]">Giới tính:</span>
                          <span className="font-semibold text-foreground">{profile.gender === 'male' ? 'Nam' : profile.gender === 'female' ? 'Nữ' : 'Khác'}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-background/60 border border-border">
                          <span className="text-muted-foreground text-[11px]">BMR (cơ bản):</span>
                          <span className="font-semibold text-orange-400 font-mono">{health.bmr?.toFixed(0)} cal</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-background/60 border border-border">
                          <span className="text-muted-foreground text-[11px]">TDEE (tiêu hao):</span>
                          <span className="font-semibold text-emerald-400 font-mono">{health.tdee?.toFixed(0)} cal</span>
                        </div>
                      </div>
                    </div>

                    {/* Advice Box */}
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                          <Flame className="w-3.5 h-3.5 text-primary" />
                          <span>Chiến lược dinh dưỡng</span>
                        </p>
                        <span className="text-[11px] font-bold text-primary">
                          {profile.goal === 'weight_loss' ? 'Mục tiêu Giảm Cân' : profile.goal === 'muscle_gain' ? 'Mục tiêu Tăng Cơ' : 'Mục tiêu Duy Trì'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Để đạt được mục tiêu <strong>{profile.goal === 'weight_loss' ? 'Giảm cân' : profile.goal === 'muscle_gain' ? 'Tăng cơ' : 'Duy trì vóc dáng'}</strong>,
                        mức năng lượng khuyến nghị nạp vào mỗi ngày của bạn là <strong className="text-foreground text-sm font-mono underline decoration-primary decoration-2 underline-offset-4">{health.targetCalories?.toFixed(0)} kcal</strong>.
                      </p>
                    </div>

                    {/* Macro Distribution Recommendation */}
                    <div className="p-4 rounded-xl bg-secondary/20 border border-border space-y-2">
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Phân bổ Macro khuyến nghị hàng ngày
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-lg bg-background/60 border border-border">
                          <span className="text-[10px] text-muted-foreground block">Đạm (Protein)</span>
                          <span className="font-mono font-bold text-primary text-xs">
                            {profile.weight ? Math.round(profile.weight * (profile.goal === 'muscle_gain' ? 2.0 : 1.8)) : 120}g
                          </span>
                          <span className="text-[9px] text-muted-foreground block mt-0.5">Xây dựng cơ</span>
                        </div>
                        <div className="p-2 rounded-lg bg-background/60 border border-border">
                          <span className="text-[10px] text-muted-foreground block">Tinh bột (Carb)</span>
                          <span className="font-mono font-bold text-amber-400 text-xs">
                            {health.targetCalories ? Math.round((health.targetCalories * 0.45) / 4) : 200}g
                          </span>
                          <span className="text-[9px] text-muted-foreground block mt-0.5">Năng lượng</span>
                        </div>
                        <div className="p-2 rounded-lg bg-background/60 border border-border">
                          <span className="text-[10px] text-muted-foreground block">Chất béo (Fat)</span>
                          <span className="font-mono font-bold text-emerald-400 text-xs">
                            {health.targetCalories ? Math.round((health.targetCalories * 0.25) / 9) : 55}g
                          </span>
                          <span className="text-[9px] text-muted-foreground block mt-0.5">Hormone</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
