'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { API_BASE_URL } from '@/lib/api'

interface Member {
  id: number;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
}

export default function AdminMembersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [members, setMembers] = useState<Member[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

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
        setMembers(members.map((m: Member) => m.id === id ? { ...m, status: newStatus } : m))
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

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Quản lý thành viên</h2>
          <p className="text-muted-foreground">Quản lý tất cả người dùng trên nền tảng</p>
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
        <Card className="rounded-2xl bg-card border-border overflow-hidden">
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
                      <p className="font-medium text-foreground text-sm">{member.full_name}</p>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </td>
                    <td className="px-2 py-2.5 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(member.role)}`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
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
    </DashboardLayout>
  )
}
