'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface Category {
    id: number;
    name: string;
    type: string;
}

export default function AdminCategoriesPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [isDataLoading, setIsDataLoading] = useState(true)

    // Form state
    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [categoryName, setCategoryName] = useState('')
    const [categoryType, setCategoryType] = useState('workout')

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/')
        }
    }, [user, loading, router])

    const fetchCategories = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/categories')
            if (res.ok) {
                setCategories(await res.json())
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
        } finally {
            setIsDataLoading(false)
        }
    }

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchCategories()
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!categoryName.trim()) return

        const token = localStorage.getItem('fitvibe-token')
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
        const body = JSON.stringify({ name: categoryName, type: categoryType })

        try {
            if (isEditing && editId) {
                // Update
                const res = await fetch(`http://localhost:5000/api/admin/categories/${editId}`, {
                    method: 'PUT',
                    headers,
                    body
                })
                if (res.ok) {
                    setCategories(categories.map(c => c.id === editId ? { ...c, name: categoryName, type: categoryType } : c))
                    resetForm()
                }
            } else {
                // Create
                const res = await fetch('http://localhost:5000/api/admin/categories', {
                    method: 'POST',
                    headers,
                    body
                })
                if (res.ok) {
                    const data = await res.json()
                    setCategories([...categories, { id: data.id, name: categoryName, type: categoryType }])
                    resetForm()
                }
            }
        } catch (error) {
            console.error("Error saving category:", error)
        }
    }

    const handleEdit = (category: Category) => {
        setIsEditing(true)
        setEditId(category.id)
        setCategoryName(category.name)
        setCategoryType(category.type)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa danh mục này không?')) return
        try {
            const token = localStorage.getItem('fitvibe-token')
            const res = await fetch(`http://localhost:5000/api/admin/categories/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                setCategories(categories.filter(c => c.id !== id))
            }
        } catch (error) {
            console.error("Error deleting category:", error)
        }
    }

    const resetForm = () => {
        setIsEditing(false)
        setEditId(null)
        setCategoryName('')
        setCategoryType('workout')
    }

    const workoutCategories = categories.filter(c => c.type === 'workout')
    const dietCategories = categories.filter(c => c.type === 'diet')

    const renderCategoryList = (list: Category[], title: string) => (
        <Card className="p-6 rounded-2xl bg-card border-border">
            <h3 className="font-bold text-foreground text-lg mb-4">{title} ({list.length})</h3>
            {list.length > 0 ? (
                <div className="space-y-3">
                    {list.map(category => (
                        <div key={category.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border gap-3">
                            <span className="font-medium text-foreground">{category.name}</span>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>Sửa</Button>
                                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(category.id)}>Xóa</Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-sm">Chưa có danh mục nào.</p>
            )}
        </Card>
    )

    return (
        <DashboardLayout navItems={navItems}>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-2">Quản lý danh mục</h2>
                    <p className="text-muted-foreground">Thêm và chỉnh sửa các danh mục bài tập và thực đơn</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 rounded-2xl bg-card border-border sticky top-6">
                            <h3 className="font-bold text-foreground text-xl mb-4">
                                {isEditing ? 'Sửa danh mục' : 'Thêm danh mục mới'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">Tên danh mục</label>
                                    <Input
                                        placeholder="VD: Giảm mỡ bụng, Keto..."
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">Loại danh mục</label>
                                    <Select value={categoryType} onValueChange={setCategoryType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="workout">Bài tập (Workout)</SelectItem>
                                            <SelectItem value="diet">Thực đơn (Diet)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button type="submit" className="flex-1">
                                        {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
                                    </Button>
                                    {isEditing && (
                                        <Button type="button" variant="outline" onClick={resetForm}>
                                            Hủy
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* Lists */}
                    <div className="lg:col-span-2 space-y-6">
                        {isDataLoading ? (
                            <p className="text-muted-foreground">Đang tải danh mục...</p>
                        ) : (
                            <>
                                {renderCategoryList(workoutCategories, 'Danh mục Bài tập')}
                                {renderCategoryList(dietCategories, 'Danh mục Thực đơn')}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
