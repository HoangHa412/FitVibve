'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { coachApi } from '@/lib/api'
import { Button } from '@/components/ui/button'

export default function WalletPage() {
    const [balance, setBalance] = useState(0)
    const [withdrawals, setWithdrawals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [form, setForm] = useState({
        amount: '',
        bank_name: '',
        account_number: '',
        account_name: ''
    })

    const navItems = [
        { label: 'Tổng quan', href: '/coach' },
        { label: 'Học viên', href: '/coach/clients' },
        { label: 'Nội dung', href: '/coach/content' },
        { label: 'Lộ trình', href: '/coach/routes' },
        { label: 'Kiểm duyệt', href: '/coach/moderation' },
        { label: 'Ví / Rút tiền', href: '/coach/wallet' }
    ]

    const fetchData = async () => {
        try {
            const statsData = await coachApi.getStats()
            setBalance(statsData.balance)

            const historyData = await coachApi.getWithdrawals()
            setWithdrawals(historyData)
        } catch (err: any) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        
        const amountNum = parseFloat(form.amount)
        if (isNaN(amountNum) || amountNum <= 0) {
            return setError('Số tiền không hợp lệ.')
        }
        if (amountNum > balance) {
            return setError('Số dư không đủ.')
        }

        setSubmitting(true)
        try {
            await coachApi.requestWithdrawal({
                amount: amountNum,
                bank_name: form.bank_name,
                account_number: form.account_number,
                account_name: form.account_name
            })
            setSuccess('Yêu cầu rút tiền thành công. Vui lòng chờ admin duyệt.')
            setForm({ amount: '', bank_name: '', account_number: '', account_name: '' })
            fetchData() // refresh data
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi rút tiền.')
        } finally {
            setSubmitting(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">Đã duyệt</span>
            case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">Từ chối</span>
            default: return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-medium">Đang xử lý</span>
        }
    }

    return (
        <DashboardLayout navItems={navItems}>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-foreground">Ví của tôi</h2>
                    <p className="text-muted-foreground mt-1">Quản lý thu nhập và yêu cầu rút tiền</p>
                </div>

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-32 bg-muted rounded-xl"></div>
                        <div className="h-64 bg-muted rounded-xl"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Stats & Form */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="p-6 bg-gradient-to-br from-primary to-accent rounded-2xl text-white shadow-lg">
                                <h3 className="text-white/80 font-medium">Số dư khả dụng</h3>
                                <div className="text-4xl font-bold mt-2">{formatCurrency(balance)}</div>
                            </div>

                            <div className="glass p-6 rounded-2xl border border-border">
                                <h3 className="text-xl font-bold mb-4">Tạo lệnh rút tiền</h3>
                                {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                                {success && <div className="p-3 mb-4 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Số tiền rút (VND)</label>
                                        <input 
                                            type="number" 
                                            name="amount"
                                            value={form.amount}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-2 bg-background border border-border rounded-lg text-sm"
                                            placeholder="Ví dụ: 500000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tên ngân hàng</label>
                                        <input 
                                            type="text" 
                                            name="bank_name"
                                            value={form.bank_name}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-2 bg-background border border-border rounded-lg text-sm"
                                            placeholder="Vietcombank, Techcombank..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Số tài khoản</label>
                                        <input 
                                            type="text" 
                                            name="account_number"
                                            value={form.account_number}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-2 bg-background border border-border rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tên chủ tài khoản</label>
                                        <input 
                                            type="text" 
                                            name="account_name"
                                            value={form.account_name}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-2 bg-background border border-border rounded-lg text-sm uppercase"
                                            placeholder="NGUYEN VAN A"
                                        />
                                    </div>
                                    <Button type="submit" disabled={submitting || balance <= 0} className="w-full">
                                        {submitting ? 'Đang xử lý...' : 'Xác nhận rút tiền'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* History Table */}
                        <div className="lg:col-span-2">
                            <div className="glass p-6 rounded-2xl border border-border h-full">
                                <h3 className="text-xl font-bold mb-4">Lịch sử rút tiền</h3>
                                {withdrawals.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground">Chưa có lịch sử rút tiền nào.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                                <tr>
                                                    <th className="px-4 py-3 rounded-tl-lg">Thời gian</th>
                                                    <th className="px-4 py-3">Số tiền</th>
                                                    <th className="px-4 py-3">Ngân hàng</th>
                                                    <th className="px-4 py-3">STK</th>
                                                    <th className="px-4 py-3 rounded-tr-lg">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {withdrawals.map((w: any) => (
                                                    <tr key={w.id} className="border-b border-border/50 hover:bg-muted/20">
                                                        <td className="px-4 py-3">{new Date(w.created_at).toLocaleString('vi-VN')}</td>
                                                        <td className="px-4 py-3 font-medium">{formatCurrency(parseFloat(w.amount))}</td>
                                                        <td className="px-4 py-3">{w.bank_name}</td>
                                                        <td className="px-4 py-3">
                                                            {w.account_number}<br/>
                                                            <span className="text-xs text-muted-foreground">{w.account_name}</span>
                                                        </td>
                                                        <td className="px-4 py-3">{getStatusBadge(w.status)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
