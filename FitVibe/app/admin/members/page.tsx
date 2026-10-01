'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { API_BASE_URL } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ExternalLink, ZoomIn, Award, Users, BookOpen, Route, ShieldCheck, Mail, Calendar, UserCheck } from 'lucide-react'
import Link from 'next/link'

interface Member {
  id: number;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  avatar_url?: string | null;
  balance?: string | number;
  bio?: string | null;
  age?: number | null;
  gender?: string | null;
  certificates?: string | null;
  active_students?: number;
  post_count?: number;
  route_count?: number;
}

export default function AdminMembersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [members, setMembers] = useState<Member[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [selectedCoach, setSelectedCoach] = useState<Member | null>(null)
  const [previewCert, setPreviewCert] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === 'admin') {
      const fetchMembers = async () => {
        try {
          const token = localStorage.getItem('fitvibe-token')
          const headers = { Authorization: `Bearer ${token}` }

          const res = await fetch(`${API_BASE_URL}/api/admin/users`, { headers })
          if (res.ok) {
            setMembers(await res.json())
          }
        } catch (error) {
          console.error("Error fetching members:", error)
        } finally {
          setIsDataLoading(false)
        }
      }

      fetchMembers()
    }
  }, [user])

  if (loading || !user || user.role !== 'admin') {
    return null
  }

  const navItems = [
    { label: 'Tổng quan', href: '/admin' },
    { label: 'Quản lý thành viên', href: '/admin/members' },
    { label: 'Duyệt bài viết', href: '/admin/posts' },
    { label: 'Quản lý danh mục', href: '/admin/categories' },
    { label: 'Báo cáo & thống kê', href: '/admin/reports' },
    { label: 'Duyệt Rút Tiền', href: '/admin/withdrawals' },
  ]

  const filteredMembers = members.filter((member: Member) => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
      case 'coach':
        return 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
      default:
        return 'bg-teal-500/15 text-teal-400 border border-teal-500/25'
    }
  }

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('fitvibe-token')
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setMembers((prev) => prev.map((m: Member) => m.id === id ? { ...m, status: newStatus } : m))
        if (selectedCoach && selectedCoach.id === id) {
          setSelectedCoach((prev) => prev ? { ...prev, status: newStatus } : null)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const userStats = {
    total: members.length,
    users: members.filter((m: Member) => m.role === 'user').length,
    coaches: members.filter((m: Member) => m.role === 'coach').length,
    admins: members.filter((m: Member) => m.role === 'admin').length
  }

  const coachCertificates = selectedCoach?.certificates
    ? selectedCoach.certificates.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-6xl mx-auto pb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Quản lý thành viên</h2>
          <p className="text-muted-foreground">Quản lý tất cả người dùng, huấn luyện viên và quản trị viên trên hệ thống</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'user', 'coach', 'admin'].map((filter: string) => (
              <Button
                key={filter}
                variant={roleFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter(filter)}
                className="rounded-lg"
              >
                {filter === 'all' ? 'Tất cả' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng thành viên', value: isDataLoading ? '...' : userStats.total },
            { label: 'Người dùng', value: isDataLoading ? '...' : userStats.users },
            { label: 'Huấn luyện viên', value: isDataLoading ? '...' : userStats.coaches },
            { label: 'Admin', value: isDataLoading ? '...' : userStats.admins },
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 rounded-lg bg-card border-border">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Members Table */}
        <Card className="rounded-2xl bg-card border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/20 text-xs">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Tên</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Email</th>
                  <th className="px-2 py-3 text-center font-semibold text-muted-foreground whitespace-nowrap">Vai trò</th>
                  <th className="px-2 py-3 text-center font-semibold text-muted-foreground whitespace-nowrap">Trạng thái</th>
                  <th className="px-3 py-3 text-center font-semibold text-muted-foreground whitespace-nowrap">Tham gia</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground whitespace-nowrap">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member: Member) => (
                  <tr key={member.id} className="border-b border-border hover:bg-secondary/10 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {member.role === 'coach' ? (
                        <button
                          type="button"
                          onClick={() => setSelectedCoach(member)}
                          className="text-left font-medium text-foreground hover:text-primary transition-all flex items-center gap-2 group cursor-pointer"
                          title="Bấm để xem hồ sơ và chứng chỉ của HLV"
                        >
                          <span className="font-semibold group-hover:underline underline-offset-4">{member.full_name}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-medium inline-flex items-center gap-1 group-hover:bg-blue-500/25 transition-all">
                            🔍 Chi tiết
                          </span>
                        </button>
                      ) : (
                        <p className="font-medium text-foreground text-sm">{member.full_name}</p>
                      )}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </td>
                    <td className="px-2 py-2.5 text-center whitespace-nowrap">
                      {member.role === 'coach' ? (
                        <button
                          type="button"
                          onClick={() => setSelectedCoach(member)}
                          title="Bấm để xem thông tin chi tiết HLV"
                          className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer hover:ring-2 hover:ring-blue-500/40 hover:scale-105 transition-all ${getRoleColor(member.role)}`}
                        >
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </button>
                      ) : (
                        <span className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(member.role)}`}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2.5 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        member.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          : member.status === 'pending'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                        }`}>
                        {member.status === 'active' ? 'Hoạt động' : member.status === 'pending' ? 'Chờ duyệt' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs text-muted-foreground whitespace-nowrap">{new Date(member.created_at).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-2.5 text-right space-x-1.5 whitespace-nowrap">
                      {member.role === 'coach' && (
                        <button
                          type="button"
                          onClick={() => setSelectedCoach(member)}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/30 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                          title="Xem hồ sơ, bằng cấp và thông tin HLV"
                        >
                          <span>🔍</span>
                          <span>Chi tiết HLV</span>
                        </button>
                      )}
                      {member.status === 'pending' && member.role === 'coach' && (
                        <button onClick={() => handleUpdateStatus(member.id, 'active')} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors">Duyệt</button>
                      )}
                      {member.role !== 'admin' && member.status !== 'locked' && (
                        <button onClick={() => handleUpdateStatus(member.id, 'locked')} className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-colors">Khóa</button>
                      )}
                      {member.role !== 'admin' && member.status === 'locked' && (
                        <button onClick={() => handleUpdateStatus(member.id, 'active')} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors">Mở Khóa</button>
                      )}
                      {member.role !== 'admin' && (
                        <>
                          <button onClick={async () => {
                            if (!confirm('Bạn có chắc muốn reset mật khẩu thành viên này về mặc đinh (trùng với email)?')) return;
                            try {
                              const token = localStorage.getItem('fitvibe-token');
                              const res = await fetch(`${API_BASE_URL}/api/admin/users/${member.id}/reset-password`, {
                                method: 'PUT',
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              if (res.ok) {
                                alert('Reset mật khẩu thành công!');
                              } else {
                                const data = await res.json();
                                alert('Lỗi: ' + data.message);
                              }
                            } catch (error) {
                              alert('Lỗi kết nối server');
                            }
                          }} className="px-2.5 py-1 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 text-xs font-semibold transition-colors">Reset MK</button>

                          <button onClick={async () => {
                            if (!confirm('Bạn có chắc muốn xóa thành viên này không?')) return;
                            const token = localStorage.getItem('fitvibe-token');
                            const res = await fetch(`${API_BASE_URL}/api/admin/users/${member.id}`, {
                              method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
                            });
                            if (res.ok) setMembers((prev: Member[]) => prev.filter((m) => m.id !== member.id));
                          }} className="px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold transition-colors">Xóa</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && !isDataLoading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Không tìm thấy thành viên nào.</td>
                  </tr>
                )}
                {isDataLoading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Đang tải biểu dữ liệu...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Coach Details Modal */}
      <Dialog open={!!selectedCoach} onOpenChange={(open) => !open && setSelectedCoach(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-border bg-card shadow-2xl">
          {selectedCoach && (
            <div className="flex flex-col">
              {/* Header Banner */}
              <div className="p-6 bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-purple-600/20 border-b border-border/50">
                <DialogHeader className="mb-0 text-left">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-secondary/80 border-2 border-border/60 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                      {selectedCoach.avatar_url ? (
                        <img
                          src={selectedCoach.avatar_url.startsWith('http') ? selectedCoach.avatar_url : `${API_BASE_URL}${selectedCoach.avatar_url}`}
                          alt={selectedCoach.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-black text-primary/60">{selectedCoach.full_name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <DialogTitle className="text-2xl font-black text-foreground">
                          {selectedCoach.full_name}
                        </DialogTitle>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          Huấn luyện viên
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          selectedCoach.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                            : selectedCoach.status === 'pending'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                        }`}>
                          {selectedCoach.status === 'active' ? '● Đang hoạt động' : selectedCoach.status === 'pending' ? '⏳ Chờ phê duyệt' : '🔒 Đã bị khóa'}
                        </span>
                      </div>
                      <DialogDescription className="text-muted-foreground text-sm flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-primary" /> {selectedCoach.email}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Tham gia: {new Date(selectedCoach.created_at).toLocaleDateString('vi-VN')}</span>
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* 4 Quick Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50 text-center">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Học viên</p>
                    <p className="text-2xl font-black text-primary">{selectedCoach.active_students || 0}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50 text-center">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Lộ trình tạo</p>
                    <p className="text-2xl font-black text-primary">{selectedCoach.route_count || 0}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50 text-center">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Bài viết chia sẻ</p>
                    <p className="text-2xl font-black text-primary">{selectedCoach.post_count || 0}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50 text-center">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Số dư ví</p>
                    <p className="text-base font-bold text-foreground truncate" title={`${Number(selectedCoach.balance || 0).toLocaleString('vi-VN')} đ`}>
                      {Number(selectedCoach.balance || 0).toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <span>👤</span> Thông tin cá nhân & Chuyên môn
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm pt-1">
                    <div>
                      <span className="text-muted-foreground">Độ tuổi: </span>
                      <span className="font-semibold text-foreground">{selectedCoach.age ? `${selectedCoach.age} tuổi` : 'Chưa cập nhật'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Giới tính: </span>
                      <span className="font-semibold text-foreground">
                        {selectedCoach.gender === 'male' ? 'Nam' : selectedCoach.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio / Introduction */}
                <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <span>📝</span> Giới thiệu bản thân & Kinh nghiệm
                  </h4>
                  {selectedCoach.bio ? (
                    <p className="text-sm text-foreground/90 leading-relaxed font-normal whitespace-pre-wrap">
                      {selectedCoach.bio}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Huấn luyện viên chưa cập nhật thông tin giới thiệu.</p>
                  )}
                </div>

                {/* Certificates */}
                <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" /> Bằng cấp & Chứng chỉ huấn luyện ({coachCertificates.length})
                  </h4>

                  {coachCertificates.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                      {coachCertificates.map((certUrl, idx) => {
                        const fullCertUrl = certUrl.startsWith('http') ? certUrl : `${API_BASE_URL}${certUrl}`
                        return (
                          <div
                            key={idx}
                            onClick={() => setPreviewCert(fullCertUrl)}
                            className="group relative aspect-4/3 rounded-xl overflow-hidden border border-border/60 bg-black/20 cursor-pointer shadow-sm hover:shadow-md hover:border-primary/50 transition-all hover:scale-[1.02]"
                          >
                            <img
                              src={fullCertUrl}
                              alt={`Bằng cấp ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-semibold backdrop-blur-[2px]">
                              <ZoomIn className="w-5 h-5 text-primary" />
                              <span>Phóng to xem</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Huấn luyện viên chưa nộp ảnh bằng cấp hoặc chứng chỉ.</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-secondary/15 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/dashboard/coaches/${selectedCoach.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline underline-offset-4"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Xem hồ sơ công khai & lộ trình
                </Link>

                <div className="flex items-center gap-2">
                  {selectedCoach.status === 'pending' && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedCoach.id, 'active')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-3.5 rounded-lg shadow-sm"
                    >
                      ✓ Phê duyệt HLV
                    </Button>
                  )}
                  {selectedCoach.status === 'active' && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedCoach.id, 'locked')}
                      variant="destructive"
                      className="font-bold text-xs h-9 px-3.5 rounded-lg shadow-sm"
                    >
                      Khóa HLV
                    </Button>
                  )}
                  {selectedCoach.status === 'locked' && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedCoach.id, 'active')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-3.5 rounded-lg shadow-sm"
                    >
                      Mở khóa HLV
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCoach(null)}
                    className="font-semibold text-xs h-9 px-4 rounded-lg"
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Certificate Zoom Dialog */}
      <Dialog open={!!previewCert} onOpenChange={(open) => !open && setPreviewCert(null)}>
        <DialogContent className="max-w-4xl p-3 bg-card border-border/80 rounded-2xl shadow-2xl overflow-hidden">
          {previewCert && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-xl bg-black/40 p-1">
                <img
                  src={previewCert}
                  alt="Ảnh chứng chỉ phóng to"
                  className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-lg"
                />
              </div>
              <div className="w-full flex items-center justify-between px-2 pt-1">
                <a
                  href={previewCert}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Mở ảnh gốc trong tab mới
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewCert(null)}
                  className="text-xs h-8 px-3 rounded-lg"
                >
                  Đóng ảnh
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
