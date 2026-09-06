'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { adminApi } from '@/lib/api'
import { Button } from '@/components/ui/button'

export default function AdminWithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const navItems = [
        { label: 'Tổng quan', href: '/admin' },
        { label: 'Thành viên', href: '/admin/members' },
        { label: 'Danh mục', href: '/admin/categories' },
        { label: 'Bài viết', href: '/admin/posts' },
        { label: 'Báo cáo', href: '/admin/reports' },
        { label: 'Rút tiền', href: '/admin/withdrawals' }
    ]

    const fetchWithdrawals = async () => {
        try {
            const data = await adminApi.getWithdrawals()
            setWithdrawals(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWithdrawals()
    }, [])

    const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
        if (!confirm(`Bạn có chắc chắn muốn ${status === 'approved' ? 'duyệt' : 'từ chối'} yêu cầu này?`)) return;
        
        try {
            await adminApi.updateWithdrawalStatus(id, status)
            // Refresh list
            fetchWithdrawals()
        } catch (err: any) {
            alert(err.message || 'Lỗi khi cập nhật trạng thái')
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">Đã duyệt</span>
            case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">Từ chối</span>
            default: return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-medium">Chờ duyệt</span>
        }
    }

    return (
        <DashboardLayout navItems={navItems}>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-foreground">Yêu Cầu Rút Tiền</h2>
                    <p className="text-muted-foreground mt-1">Quản lý và duyệt các lệnh rút tiền từ Huấn luyện viên</p>
                </div>

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-64 bg-muted rounded-xl"></div>
                    </div>
                ) : (
                    <div className="glass p-6 rounded-2xl border border-border">
                        {withdrawals.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">Chưa có yêu cầu rút tiền nào.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 rounded-tl-lg">Thời gian</th>
                                            <th className="px-4 py-3">Huấn luyện viên</th>
                                            <th className="px-4 py-3">Số tiền</th>
                                            <th className="px-4 py-3">Thông tin chuyển khoản</th>
                                            <th className="px-4 py-3">Trạng thái</th>
                                            <th className="px-4 py-3 rounded-tr-lg">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {withdrawals.map((w: any) => (
                                            <tr key={w.id} className="border-b border-border/50 hover:bg-muted/20">
                                                <td className="px-4 py-3 whitespace-nowrap">{new Date(w.created_at).toLocaleString('vi-VN')}</td>
                                                <td className="px-4 py-3">
                                                    <p className="font-bold">{w.coach_name}</p>
                                                    <p className="text-xs text-muted-foreground">{w.coach_email}</p>
                                                </td>
                                                <td className="px-4 py-3 font-bold text-primary">{formatCurrency(parseFloat(w.amount))}</td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">{w.bank_name}</p>
                                                    <p className="font-mono text-xs">{w.account_number}</p>
                                                    <p className="text-xs text-muted-foreground uppercase">{w.account_name}</p>
                                                </td>
                                                <td className="px-4 py-3">{getStatusBadge(w.status)}</td>
                                                <td className="px-4 py-3">
                                                    {w.status === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <Button 
                                                                size="sm" 
                                                                onClick={() => handleUpdateStatus(w.id, 'approved')}
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                            >
                                                                Duyệt
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="destructive"
                                                                onClick={() => handleUpdateStatus(w.id, 'rejected')}
                                                            >
                                                                Từ chối
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
