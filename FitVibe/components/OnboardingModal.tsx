'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { userApi } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface OnboardingModalProps {
  open: boolean
  onSuccess: (profileData: any) => void
}

export function OnboardingModal({ open, onSuccess }: OnboardingModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    body_fat: '',
    goal: 'maintain',
  })
  
  const [medicalHistory, setMedicalHistory] = useState<string[]>([])

  const medicalOptions = [
    { id: 'Đau khớp gối', label: 'Đau khớp gối' },
    { id: 'Tim mạch', label: 'Tim mạch' },
    { id: 'Huyết áp cao', label: 'Huyết áp cao' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.height || !formData.weight) {
      return toast.error('Vui lòng nhập chiều cao và cân nặng')
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        body_fat: formData.body_fat ? parseFloat(formData.body_fat) : null,
        medical_history: medicalHistory.length > 0 ? medicalHistory : null
      }
      await userApi.updateProfile(payload)
      toast.success('Lưu thông tin thành công!')
      onSuccess(payload)
    } catch (error) {
      toast.error('Lỗi khi lưu thông tin')
    } finally {
      setLoading(false)
    }
  }

  const toggleMedical = (id: string) => {
    setMedicalHistory(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thông tin sức khỏe</DialogTitle>
          <DialogDescription>
            FitVibe cần biết một chút về bạn để gợi ý lộ trình tập luyện tốt nhất.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Chiều cao (cm)</Label>
              <Input 
                type="number" 
                placeholder="VD: 170" 
                value={formData.height}
                onChange={e => setFormData({ ...formData, height: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Cân nặng (kg)</Label>
              <Input 
                type="number" 
                placeholder="VD: 65" 
                value={formData.weight}
                onChange={e => setFormData({ ...formData, weight: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Tỷ lệ mỡ (Body Fat %) - Tùy chọn</Label>
            <Input 
              type="number" 
              placeholder="VD: 15" 
              value={formData.body_fat}
              onChange={e => setFormData({ ...formData, body_fat: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Mục tiêu chính</Label>
            <Select 
              value={formData.goal} 
              onValueChange={v => setFormData({ ...formData, goal: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn mục tiêu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="muscle_gain">Tăng cơ</SelectItem>
                <SelectItem value="weight_loss">Giảm mỡ</SelectItem>
                <SelectItem value="maintain">Duy trì vóc dáng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2">
            <Label>Tiền sử bệnh lý (nếu có)</Label>
            {medicalOptions.map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={option.id} 
                  checked={medicalHistory.includes(option.id)}
                  onCheckedChange={() => toggleMedical(option.id)}
                />
                <label
                  htmlFor={option.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Bắt đầu ngay'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
