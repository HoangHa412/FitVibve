'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { userApi, API_BASE_URL } from '@/lib/api'
import { toast } from 'sonner'

export default function ProfilePage() {
    const { user, loading: authLoading, refreshUser } = useAuth()
    const router = useRouter()
    const [profileData, setProfileData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Form states
    const [fullName, setFullName] = useState('')
    const [age, setAge] = useState('')
    const [gender, setGender] = useState('')
    const [height, setHeight] = useState('')
    const [weight, setWeight] = useState('')
    const [goal, setGoal] = useState('')

    // Password states
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            fetchProfile()
        }
    }, [user])

    const fetchProfile = async () => {
        setIsLoading(true)
        try {
            const data = await userApi.getMe() as any
            setProfileData(data)
            setFullName(data.user.full_name || '')
            setAge(data.user.age?.toString() || '')
            setGender(data.user.gender || '')
            setHeight(data.user.height?.toString() || '')
            setWeight(data.user.weight?.toString() || '')
            setGoal(data.user.goal || '')
        } catch (error) {
            toast.error('Không thể tải thông tin cá nhân')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await userApi.updateProfile({
                full_name: fullName,
                age: age ? parseInt(age) : null,
                gender,
                height: height ? parseFloat(height) : null,
                weight: weight ? parseFloat(weight) : null,
                goal
            })
            toast.success('Cập nhật hồ sơ thành công!')
            refreshUser()
        } catch (error) {
            toast.error('Cập nhật thất bại')
        } finally {
            setIsSaving(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            return toast.error('Mật khẩu xác nhận không khớp')
        }
        setIsSaving(true)
        try {
            await userApi.changePassword({ oldPassword, newPassword })
            toast.success('Đổi mật khẩu thành công!')
            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (error: any) {
            toast.error(error.message || 'Đổi mật khẩu thất bại')
        } finally {
            setIsSaving(false)
        }
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('avatar', file)

        setIsSaving(true)
        try {
            await userApi.updateAvatar(formData)
            toast.success('Cập nhật ảnh đại diện thành công!')
            refreshUser()
            fetchProfile()
        } catch (error) {
            toast.error('Tải ảnh lên thất bại')
        } finally {
            setIsSaving(false)
        }
    }

    if (authLoading || !user) return null

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
            <div className="max-w-4xl mx-auto py-4">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight">Hồ sơ cá nhân</h2>
                        <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold opacity-50">Cài đặt & Bảo mật</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Avatar & Summary */}
                    <div className="md:col-span-4 space-y-6">
                        <Card className="p-8 bg-card border-border shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-[100px] blur-2xl" />

                            <div className="flex flex-col items-center">
                                <div
                                    className="relative cursor-pointer mb-6"
                                    onClick={handleAvatarClick}
                                >
                                    <div className="w-32 h-32 rounded-[2rem] border-4 border-primary/20 overflow-hidden bg-secondary flex items-center justify-center p-1 shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
                                        {profileData?.user?.avatar_url ? (
                                            <img
                                                src={`${API_BASE_URL}${profileData.user.avatar_url}`}
                                                alt="Avatar"
                                                className="w-full h-full object-cover rounded-[1.75rem]"
                                            />
                                        ) : (
                                            <span className="text-4xl font-extrabold text-primary/40">
                                                {user.name?.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg border-4 border-card group-hover:rotate-12 transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                                <h3 className="font-black text-xl mb-1">{fullName || 'User Name'}</h3>
                                <p className="text-xs font-medium text-muted-foreground mb-4">{user.email}</p>

                                <div className="grid grid-cols-2 gap-2 w-full mt-4">
                                    <div className="bg-secondary/50 p-3 rounded-2xl text-center">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Cân nặng</p>
                                        <p className="font-black text-primary">{weight || '--'} <span className="text-[10px] font-medium">kg</span></p>
                                    </div>
                                    <div className="bg-secondary/50 p-3 rounded-2xl text-center">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Chiều cao</p>
                                        <p className="font-black text-primary">{height || '--'} <span className="text-[10px] font-medium">cm</span></p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="p-6 rounded-3xl border border-primary/20 bg-primary/5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 animate-pulse">
                                🎖️
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Gói thành viên</p>
                                <p className="text-sm font-black">FitVibe Standard</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Forms */}
                    <div className="md:col-span-8 space-y-8 animate-in" style={{ animationDelay: '0.2s' }}>
                        {/* Profile Info Form */}
                        <Card className="p-8 bg-card border-border shadow-sm rounded-[2.5rem]">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                <h4 className="font-black text-xl">Chỉnh sửa thông tin</h4>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2 space-y-2 group">
                                        <label className="text-xs font-bold text-muted-foreground uppercase ml-2 tracking-wider">Họ và tên đầy đủ</label>
                                        <input
                                            className="w-full bg-secondary/30 border-2 border-transparent focus:border-primary/20 focus:bg-card rounded-2xl px-5 py-3 text-sm font-medium transition-all outline-none"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="VD: Nguyễn Văn A"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase ml-2 tracking-wider">Tuổi</label>
                                        <input
                                            type="number"
                                            className="w-full bg-secondary/30 border-2 border-transparent focus:border-primary/20 focus:bg-card rounded-2xl px-5 py-3 text-sm font-medium transition-all outline-none"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase ml-2 tracking-wider">Giới tính</label>
                                        <select
                                            className="w-full bg-secondary/30 border-2 border-transparent focus:border-primary/20 focus:bg-card rounded-2xl px-5 py-3 text-sm font-medium transition-all outline-none appearance-none cursor-pointer"
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                        >
                                            <option value="">Chọn giới tính</option>
                                            <option value="male">Nam</option>
                                            <option value="female">Nữ</option>
                                            <option value="other">Khác</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase ml-2 tracking-wider">Chiều cao (cm)</label>
                                        <input
                                            type="number" step="0.1"
                                            className="w-full bg-secondary/30 border-2 border-transparent focus:border-primary/20 focus:bg-card rounded-2xl px-5 py-3 text-sm font-medium transition-all outline-none"
                                            value={height}
                                            onChange={(e) => setHeight(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase ml-2 tracking-wider">Cân nặng (kg)</label>
                                        <input
                                            type="number" step="0.1"
                                            className="w-full bg-secondary/30 border-2 border-transparent focus:border-primary/20 focus:bg-card rounded-2xl px-5 py-3 text-sm font-medium transition-all outline-none"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                        />
                                    </div>

                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase ml-2 tracking-wider">Mục tiêu luyện tập</label>
                                        <select
                                            className="w-full bg-secondary/30 border-2 border-transparent focus:border-primary/20 focus:bg-card rounded-2xl px-5 py-3 text-sm font-medium transition-all outline-none appearance-none cursor-pointer"
                                            value={goal}
                                            onChange={(e) => setGoal(e.target.value)}
                                        >
                                            <option value="weight_loss">Giảm cân (Weight Loss)</option>
                                            <option value="muscle_gain">Tăng cơ (Muscle Gain)</option>
                                            <option value="maintenance">Duy trì (Maintenance)</option>
                                            <option value="general_fitness">Sức khỏe tổng quát (General Fitness)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button
                                        disabled={isSaving}
                                        className="w-full sm:w-auto min-w-[200px] h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-primary/80 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        {isSaving ? 'Đang cập nhật...' : 'Lưu thông tin'}
                                    </Button>
                                </div>
                            </form>
                        </Card>

                        {/* Security Form */}
                        <Card className="p-8 bg-card border-border shadow-sm rounded-[2.5rem] border-l-4 border-l-destructive/50">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-1.5 h-6 bg-destructive rounded-full" />
                                <h4 className="font-black text-xl text-destructive">Đổi mật khẩu</h4>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase ml-2 tracking-wider">Mật khẩu hiện tại</label>
                                    <input
                                        type="password"
                                        className="w-full bg-secondary/30 border-2 border-transparent focus:border-destructive/20 focus:bg-card rounded-2xl px-5 py-3 text-sm font-medium transition-all outline-none"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase ml-2 tracking-wider">Mật khẩu mới</label>
                                        <input
                                            type="password"
                                            className="w-full bg-secondary/30 border-2 border-transparent focus:border-primary/20 focus:bg-card rounded-2xl px-5 py-3 text-sm font-medium transition-all outline-none"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase ml-2 tracking-wider">Xác nhận mật khẩu mới</label>
                                        <input
                                            type="password"
                                            className="w-full bg-secondary/30 border-2 border-transparent focus:border-primary/20 focus:bg-card rounded-2xl px-5 py-3 text-sm font-medium transition-all outline-none"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        variant="outline"
                                        disabled={isSaving}
                                        className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest border-destructive/20 text-destructive hover:bg-destructive/5 active:scale-[0.98] transition-all"
                                    >
                                        {isSaving ? 'Đang xác thực...' : 'Cập nhật mật khẩu'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
