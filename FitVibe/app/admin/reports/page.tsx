'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { API_BASE_URL } from '@/lib/api'
import FitVibeLogo, { FitVibeLogoTheme } from '@/components/FitVibeLogo'
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
  coachEarnings?: number;
  platformProfit?: number;
  totalWithdrawn?: number;
  withdrawalHistory?: { amount: string; status: string; created_at: string; coach_name: string }[];
}

export default function AdminReportsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [reportsData, setReportsData] = useState<ReportsData | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [logoPreviewBg, setLogoPreviewBg] = useState<'light' | 'dark'>('light')

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
    const totalRev = reportsData.totalRevenue || 0;
    const coachShare = reportsData.coachEarnings || Math.round(totalRev * 0.8);
    const platformGain = reportsData.platformProfit || Math.round(totalRev * 0.2);
    csvRows.push("THONG KE TONG QUAN");
    csvRows.push(`Tong doanh so noi dung GMV (VND),${totalRev}`);
    csvRows.push(`Thu nhap HLV phan bo 80% (VND),${coachShare}`);
    csvRows.push(`Loi nhuan nen tang FitVibe 20% (VND),${platformGain}`);
    csvRows.push(`Tong tien HLV da rut (VND),${reportsData.totalWithdrawn || 0}`);
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

        {/* Bộ Nhận Diện & Logo FitVibe cho Báo Cáo / Đồ Án */}
        <Card className="p-6 rounded-2xl bg-card border-border shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🎨</span>
                <h3 className="font-bold text-lg text-foreground">Bộ Nhận Diện & Logo FitVibe Cho Báo Cáo / Đồ Án</h3>
                <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Chống Chìm Nền Trắng
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Các biến thể màu sắc tối ưu độ tương phản cao — đảm bảo logo luôn nổi bật, sắc nét trên trang in Word, Slide thuyết trình hay Poster đồ án.
              </p>
            </div>

            {/* Toggle nền xem trước */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/60 border border-border/40 text-xs">
              <span className="text-[11px] font-semibold text-muted-foreground px-2">Xem thử:</span>
              <button
                type="button"
                onClick={() => setLogoPreviewBg('light')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  logoPreviewBg === 'light'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                ⚪ Nền trắng
              </button>
              <button
                type="button"
                onClick={() => setLogoPreviewBg('dark')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  logoPreviewBg === 'dark'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                ⚫ Nền tối
              </button>
            </div>
          </div>

          {/* Grid các Theme Logo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {[
              {
                id: 'contrast',
                title: 'Tương Phản Cao (Khuyên Dùng)',
                desc: 'Icon xanh emerald + Chữ than chì đậm (#0f172a). Đọc siêu rõ trên giấy in & nền trắng.',
                theme: 'contrast' as FitVibeLogoTheme,
                badge: 'Khuyên Dùng Cho Word / Slide',
                png: '/fitvibe-logo-contrast.png',
                svg: '/fitvibe-logo-contrast.svg',
              },
              {
                id: 'badge',
                title: 'Thẻ Card Bo Góc (Card Badge)',
                desc: 'Logo đặt trong khung thẻ trắng có viền và đổ bóng mềm, chèn vào tài liệu là nổi khối ngay.',
                theme: 'badge' as FitVibeLogoTheme,
                badge: 'Nổi Bật Mọi Nền',
                png: '/fitvibe-logo-badge.png',
                svg: '/fitvibe-logo-badge.svg',
              },
              {
                id: 'darkgreen',
                title: 'Xanh Rừng Đậm (Deep Forest)',
                desc: 'Màu xanh rêu đậm (#047857/#064e3b) sang trọng, tạo cảm giác chuyên nghiệp trên báo cáo.',
                theme: 'darkgreen' as FitVibeLogoTheme,
                badge: 'Sang Trọng',
                png: '/fitvibe-logo-darkgreen.png',
                svg: '/fitvibe-logo-darkgreen.svg',
              },
              {
                id: 'black',
                title: 'Đen Trắng Thuần (Monochrome)',
                desc: 'Toàn bộ màu đen 100% (#000000) phục vụ in ấn photo hoặc văn bản đồ án tiêu chuẩn.',
                theme: 'black' as FitVibeLogoTheme,
                badge: 'In Ấn Tiêu Chuẩn',
                png: '/fitvibe-logo-black.png',
                svg: '/fitvibe-logo-black.svg',
              },
              {
                id: 'emerald',
                title: 'Xanh Ngọc Thương Hiệu (Brand Emerald)',
                desc: 'Toàn bộ logo sắc xanh ngọc nguyên bản (#0eb880) đặc trưng nhận diện của FitVibe.',
                theme: 'emerald' as FitVibeLogoTheme,
                badge: 'Màu Nhận Diện Gốc',
                png: '/fitvibe-logo.png',
                svg: '/fitvibe-logo.svg',
              },
              {
                id: 'white',
                title: 'Bản Nền Tối (White on Dark)',
                desc: 'Biểu tượng xanh + Chữ trắng tinh khôi (#ffffff), hoàn hảo cho Slide và màn hình tối.',
                theme: 'white' as FitVibeLogoTheme,
                badge: 'Dành Cho Slide Tối',
                png: '/fitvibe-logo-white.png',
                svg: '/fitvibe-logo-white.svg',
              },
            ].map((variant) => (
              <div
                key={variant.id}
                className="p-4 rounded-xl border border-border/80 bg-secondary/15 flex flex-col justify-between hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                      {variant.badge}
                    </span>
                  </div>
                  {/* Canvas hiển thị logo */}
                  <div
                    className={`h-24 rounded-lg flex items-center justify-center p-3 mb-3 border transition-colors ${
                      logoPreviewBg === 'dark'
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <FitVibeLogo
                      theme={variant.theme}
                      className="max-h-12 w-auto max-w-[85%]"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-foreground mb-1">{variant.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {variant.desc}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                  <a
                    href={variant.png}
                    download
                    className="flex-1 text-center py-1.5 px-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors"
                  >
                    ⬇️ Tải PNG
                  </a>
                  <a
                    href={variant.svg}
                    download
                    className="flex-1 text-center py-1.5 px-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold border border-border/50 transition-colors"
                  >
                    ⬇️ Tải SVG
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            { 
              label: 'Tổng doanh số nội dung (GMV)', 
              value: isDataLoading ? '...' : formatCurrency(reportsData?.totalRevenue || 0), 
              color: 'text-primary',
              subtitle: '100% Giao dịch mua lộ trình & bài tập'
            },
            { 
              label: 'Thu nhập HLV phân bổ (80%)', 
              value: isDataLoading ? '...' : formatCurrency(reportsData?.coachEarnings || (reportsData?.totalRevenue || 0) * 0.8), 
              color: 'text-blue-500',
              subtitle: 'Doanh thu chia sẻ cho các Huấn luyện viên'
            },
            { 
              label: 'Lợi nhuận nền tảng (20% phí sàn)', 
              value: isDataLoading ? '...' : formatCurrency(reportsData?.platformProfit || (reportsData?.totalRevenue || 0) * 0.2), 
              color: 'text-emerald-500',
              subtitle: 'Doanh thu thuần giữ lại vận hành nền tảng'
            },
          ].map((metric, idx) => (
            <Card key={idx} className="p-6 rounded-2xl bg-gradient-to-br from-card to-secondary/5 border-border">
              <p className="text-xs text-muted-foreground mb-1 font-medium">{metric.label}</p>
              <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
              <p className="text-[11px] text-muted-foreground mt-2">{metric.subtitle}</p>
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
