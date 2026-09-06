'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { userApi } from '@/lib/api'
import { toast } from 'sonner'
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
          <Card className="p-6 rounded-2xl bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Cách tính chỉ số</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/20 border border-border">
                <p className="font-semibold text-foreground text-sm">BMI (Body Mass Index)</p>
                <p className="text-xs text-muted-foreground mt-2">Đánh giá mức độ cân đối của cơ thể dựa trên Chiều cao & Cân nặng.</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/20 border border-border">
                <p className="font-semibold text-foreground text-sm">BMR (Basal Metabolic Rate)</p>
                <p className="text-xs text-muted-foreground mt-2">Lượng Calo cơ thể cần để duy trì các chức năng cơ bản khi nghỉ ngơi.</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/20 border border-border">
                <p className="font-semibold text-foreground text-sm">TDEE (Total Daily Energy Expenditure)</p>
                <p className="text-xs text-muted-foreground mt-2">Tổng lượng Calo bạn tiêu thụ trong một ngày (bao gồm cả vận động).</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Tình trạng của bạn</h3>
            <div className="space-y-6">
              {!profile.height ? (
                <div className="text-center py-10 opacity-50">
                  <p className="text-sm italic">Vui lòng cập nhật thông tin để xem phân tích chi tiết.</p>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium">BMI: {health.bmi?.toFixed(1)}</p>
                      <span className="text-xs text-accent font-bold uppercase">{health.category}</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-secondary flex overflow-hidden">
                      <div className="h-full bg-blue-400" style={{ width: '18.5%' }}></div>
                      <div className="h-full bg-green-500" style={{ width: '6.5%' }}></div>
                      <div className="h-full bg-yellow-500" style={{ width: '5%' }}></div>
                      <div className="h-full bg-red-500" style={{ width: '70%' }}></div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">Thang đo: Gầy | Bình thường | Tiền béo phì | Béo phì</p>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-sm font-bold text-foreground mb-2">Lời khuyên</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Với mục tiêu <strong>{profile.goal === 'weight_loss' ? 'Giảm cân' : profile.goal === 'muscle_gain' ? 'Tăng cơ' : 'Duy trì'}</strong>,
                      bạn nên duy trì mức năng lượng nạp vào khoảng <strong>{health.targetCalories?.toFixed(0)} kcal</strong> mỗi ngày.
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
