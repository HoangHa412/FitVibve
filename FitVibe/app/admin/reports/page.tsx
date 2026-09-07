'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { API_BASE_URL } from '@/lib/api'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface GoalData {
  goal: string;
  count: number;
}

interface TopCoach {
  name: string;
  post_count: number;
}

interface RecentPost {
  title: string;
  created_at: string;
}

interface ReportsData {
  users: number;
  coaches: number;
  posts: number;
  categories: number;
  goals: GoalData[];
  topCoaches: TopCoach[];
  recentPosts: RecentPost[];
  userGrowth: { date: string; count: number }[];
  planCompletion: { status: string; count: number }[];
  totalRevenue?: number;
  totalWithdrawn?: number;
  withdrawalHistory?: { amount: string; status: string; created_at: string; coach_name: string }[];
}

export default function AdminReportsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [reportsData, setReportsData] = useState<ReportsData | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === 'admin') {
      const fetchReportsData = async () => {
        try {
          const token = localStorage.getItem('fitvibe-token')
          const headers = { Authorization: `Bearer ${token}` }

          const res = await fetch(`${API_BASE_URL}/api/admin/reports`, { headers })
          if (res.ok) {
            setReportsData(await res.json())
          }
        } catch (error) {
          console.error("Error fetching reports:", error)
        } finally {
          setIsDataLoading(false)
        }
      }

      fetchReportsData()
    }
  }, [user])

  const handleExport = () => {
    if (!reportsData) return;

    // Use BOM for UTF-8 to support Vietnamese in Excel
    const BOM = '\uFEFF';
    let csvRows = [];
    
    // 1. Title & Header
    csvRows.push("BAO CAO THONG KE FITVIBE");
    csvRows.push(`Ngay xuat: ${new Date().toLocaleString('vi-VN')}`);
    csvRows.push("");

    // 2. Overview Metrics
    csvRows.push("THONG KE TONG QUAN");
    csvRows.push(`Tong doanh thu (VND),${reportsData.totalRevenue || 0}`);
    csvRows.push(`Tong tien da rut (VND),${reportsData.totalWithdrawn || 0}`);
    csvRows.push(`Tong nguoi dung,${reportsData.users}`);
    csvRows.push(`Tong Co van (Coach),${reportsData.coaches}`);
    csvRows.push(`Bai viet da duyet,${reportsData.posts}`);
    csvRows.push(`So luong danh muc,${reportsData.categories}`);
    csvRows.push("");

    // 3. Top Coaches
    csvRows.push("HUAN LUYEN VIEN DONG GOP NHIEU NHAT");
    csvRows.push("Ten HLV,So bai viet");
    reportsData.topCoaches.forEach(coach => {
      csvRows.push(`${coach.name},${coach.post_count}`);
    });
    csvRows.push("");

    // 4. Recent Posts
    csvRows.push("BAI VIET MOI NHAT");
    csvRows.push("Tieu de,Ngay dang");
    reportsData.recentPosts.forEach(post => {
      csvRows.push(`"${post.title.replace(/"/g, '""')}",${new Date(post.created_at).toLocaleDateString('vi-VN')}`);
    });
    csvRows.push("");

    // 5. Health Goals
    csvRows.push("MUC TIEU SUC KHOE");
    csvRows.push("Muc tieu,So nguoi");
    reportsData.goals.forEach(goal => {
      csvRows.push(`${getGoalLabel(goal.goal)},${goal.count}`);
    });
    csvRows.push("");

    // 6. Withdrawal History
    if (reportsData.withdrawalHistory && reportsData.withdrawalHistory.length > 0) {
      csvRows.push("LICH SU YEU CAU RUT TIEN (HLV)");
      csvRows.push("Ten HLV,So tien (VND),Trang thai,Ngay yeu cau");
      reportsData.withdrawalHistory.forEach(w => {
        let statusText = w.status === 'approved' ? 'Da duyet' : w.status === 'rejected' ? 'Tu choi' : 'Cho duyet';
        csvRows.push(`"${w.coach_name}",${parseFloat(w.amount)},${statusText},${new Date(w.created_at).toLocaleString('vi-VN')}`);
      });
      csvRows.push("");
    }

    const csvString = BOM + csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bao_cao_FitVibe_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

  const getGoalLabel = (goal: string) => {
    switch (goal) {
      case 'weight_loss': return 'Giảm cân'
      case 'muscle_gain': return 'Tăng cơ'
      case 'maintain': return 'Duy trì vóc dáng'
      default: return goal || 'Chưa cập nhật'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Báo cáo & thống kê</h2>
            <p className="text-muted-foreground">Phân tích chi tiết hoạt động nền tảng (Dữ liệu thực tế)</p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-lg"
            onClick={handleExport}
            disabled={isDataLoading || !reportsData}
          >
            {isDataLoading ? 'Đang tải...' : 'Xuất báo cáo'}
          </Button>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Tổng doanh thu', value: isDataLoading ? '...' : formatCurrency(reportsData?.totalRevenue || 0), color: 'text-primary' },
            { label: 'Đã thanh toán (HLV rút)', value: isDataLoading ? '...' : formatCurrency(reportsData?.totalWithdrawn || 0), color: 'text-destructive' },
            { label: 'Lợi nhuận gộp', value: isDataLoading ? '...' : formatCurrency((reportsData?.totalRevenue || 0) - (reportsData?.totalWithdrawn || 0)), color: 'text-green-500' },
          ].map((metric, idx) => (
            <Card key={idx} className="p-6 rounded-2xl bg-gradient-to-br from-card to-secondary/5 border-border">
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
            </Card>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tổng người dùng', value: isDataLoading ? '...' : reportsData?.users || 0, color: 'text-primary' },
            { label: 'Tổng Cố vấn (Coach)', value: isDataLoading ? '...' : reportsData?.coaches || 0, color: 'text-accent' },
            { label: 'Bài viết đã duyệt', value: isDataLoading ? '...' : reportsData?.posts || 0, color: 'text-green-500' },
            { label: 'Số lượng danh mục', value: isDataLoading ? '...' : reportsData?.categories || 0, color: 'text-foreground' },
          ].map((metric, idx) => (
            <Card key={idx} className="p-6 rounded-2xl bg-gradient-to-br from-card to-secondary/5 border-border">
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <Card className="p-6 rounded-2xl bg-card border-border">
            <h3 className="font-bold text-foreground mb-6">Người dùng mới theo thời gian</h3>
            <div className="h-[300px] w-full">
              {isDataLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Đang tải biểu đồ...</p>
                </div>
              ) : reportsData?.userGrowth?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportsData.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#60a5fa' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#3b82f6' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed rounded-lg">
                  <p className="text-muted-foreground">Chưa có dữ liệu tăng trưởng</p>
                </div>
              )}
            </div>
          </Card>

          {/* Plan Completion Chart */}
          <Card className="p-6 rounded-2xl bg-card border-border">
            <h3 className="font-bold text-foreground mb-6">Tỷ lệ hoàn thành kế hoạch</h3>
            <div className="h-[300px] w-full">
              {isDataLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Đang tải biểu đồ...</p>
                </div>
              ) : reportsData?.planCompletion?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportsData.planCompletion}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="status"
                    >
                      {reportsData.planCompletion.map((entry, index) => {
                        const COLORS = {
                          passed: '#22c55e',
                          failed: '#ef4444',
                          submitted: '#3b82f6',
                          pending: '#a1a1aa'
                        };
                        return <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || '#8884d8'} />;
                      })}
                    </Pie>
                    <Tooltip />
                    <Legend 
                      formatter={(value) => {
                        const labels = {
                          passed: 'Đã đạt',
                          failed: 'Chưa đạt',
                          submitted: 'Đã nộp',
                          pending: 'Đang chờ'
                        };
                        return labels[value as keyof typeof labels] || value;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed rounded-lg">
                  <p className="text-muted-foreground">Chưa có dữ liệu lộ trình</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Coaches */}
          <Card className="p-6 rounded-2xl bg-card border-border">
            <h3 className="font-bold text-foreground mb-4">Huấn luyện viên đóng góp nhiều nhất</h3>
            <div className="space-y-3">
              {reportsData?.topCoaches?.length ? (
                reportsData.topCoaches.map((coach, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border">
                    <p className="font-medium text-foreground text-sm">{coach.name}</p>
                    <p className="text-xs font-semibold text-primary ml-2">{coach.post_count} bài viết</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có dữ liệu</p>
              )}
            </div>
          </Card>

          {/* Popular Content */}
          <Card className="p-6 rounded-2xl bg-card border-border">
            <h3 className="font-bold text-foreground mb-4">Bài viết mới nhất</h3>
            <div className="space-y-3">
              {reportsData?.recentPosts?.length ? (
                reportsData.recentPosts.map((post, idx) => (
                  <div key={idx} className="flex flex-col p-3 rounded-lg bg-secondary/20 border border-border">
                    <p className="font-medium text-foreground text-sm line-clamp-1">{post.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(post.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có bài viết</p>
              )}
            </div>
          </Card>

          {/* Health Goals */}
          <Card className="p-6 rounded-2xl bg-card border-border">
            <h3 className="font-bold text-foreground mb-4">Mục tiêu sức khỏe</h3>
            <div className="space-y-3">
              {reportsData?.goals?.length ? (
                reportsData.goals.map((goal, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border">
                    <p className="font-medium text-foreground text-sm">{getGoalLabel(goal.goal)}</p>
                    <p className="text-xs font-semibold text-primary ml-2">{goal.count} người</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có dữ liệu</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
