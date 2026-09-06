'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { coachApi, categoryApi, videoApi } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface Post {
  id: number;
  title: string;
  category_id: number;
  content: string;
  video_url: string;
  calories_info: number;
  price: number;
  status: string;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  type: string;
}
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CoachContentPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPost, setNewPost] = useState({
    category_id: '',
    title: '',
    content: '',
    video_url: '',
    calories_info: '',
    price: '0'
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Detail & Edit State
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState<Partial<Post>>({})

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'coach')) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role === 'coach') {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [postsData, catsData] = await Promise.all([
        coachApi.getMyPosts(),
        categoryApi.getAll()
      ])
      setPosts(postsData as any)
      setCategories(catsData as any)
    } catch (error) {
      toast.error('Không thể tải dữ liệu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.category_id) {
      toast.error('Vui lòng điền tiêu đề và danh mục')
      return
    }
    try {
      setIsUploading(true)
      let videoUrl = newPost.video_url
      
      // If a video file was selected, upload it first
      if (videoFile) {
        const uploadRes = await videoApi.upload(videoFile)
        if (uploadRes.success) {
          videoUrl = uploadRes.filename // Store filename instead of YouTube URL
        } else {
          toast.error('Lỗi khi upload video')
          return
        }
      }
      
      await coachApi.createPost({
        ...newPost,
        video_url: videoUrl,
        category_id: parseInt(newPost.category_id),
        calories_info: parseInt(newPost.calories_info || '0'),
        price: parseFloat(newPost.price || '0')
      })
      toast.success('Đã gửi bài tập chờ duyệt')
      setIsDialogOpen(false)
      fetchData()
      setNewPost({ category_id: '', title: '', content: '', video_url: '', calories_info: '', price: '0' })
      setVideoFile(null)
    } catch (error) {
      toast.error('Lỗi khi tạo bài tập')
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdatePost = async () => {
    if (!selectedPost || !editData.title || !editData.category_id) return
    try {
      setIsUploading(true)
      let videoUrl = editData.video_url

      if (videoFile) {
        const uploadRes = await videoApi.upload(videoFile)
        if (uploadRes.success) {
          videoUrl = uploadRes.filename
        } else {
          toast.error('Lỗi khi upload video')
          return
        }
      }

      await coachApi.updatePost(selectedPost.id, {
        ...editData,
        video_url: videoUrl,
        category_id: parseInt(editData.category_id.toString()),
        calories_info: parseInt(editData.calories_info?.toString() || '0'),
        price: parseFloat(editData.price?.toString() || '0')
      })
      toast.success('Đã cập nhật bài tập (Chờ duyệt lại)')
      setIsDetailOpen(false)
      setIsEditMode(false)
      setVideoFile(null)
      fetchData()
    } catch (error) {
      toast.error('Lỗi khi cập nhật bài tập')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeletePost = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa bài tập này không?')) return
    try {
      await coachApi.deletePost(id)
      toast.success('Đã xóa bài tập')
      setIsDetailOpen(false)
      fetchData()
    } catch (error) {
      toast.error('Lỗi khi xóa bài tập')
    }
  }

  if (authLoading || !user || user.role !== 'coach') {
    return null
  }

  const navItems = [
    { label: 'Tổng quan', href: '/coach' },
    { label: 'Danh sách học viên', href: '/coach/clients' },
    { label: 'Lộ trình tập luyện', href: '/coach/routes' },
    { label: 'Bài viết & nội dung', href: '/coach/content' },
    { label: 'Hàng chờ duyệt', href: '/coach/moderation' },
    { label: 'Ví / Rút tiền', href: '/coach/wallet' },
  ]

  const getCategoryName = (id: number) => {
    return categories.find(c => c.id === id)?.name || 'N/A'
  }

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Bài viết & nội dung</h2>
            <p className="text-muted-foreground">Quản lý các bài tập và kiến thức sức khỏe của bạn</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-lg">+ Viết bài mới</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Tạo bài viết mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tiêu đề</Label>
                    <Input
                      placeholder="VD: 15 phút tập bụng tại nhà"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Danh mục</Label>
                    <Select onValueChange={(v) => setNewPost({ ...newPost, category_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <div className="p-2 text-xs font-black text-primary uppercase tracking-widest opacity-50">🏋️ Danh mục Bài tập</div>
                        {categories.filter(cat => cat.type === 'workout').map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                        <div className="p-2 mt-2 text-xs font-black text-accent uppercase tracking-widest opacity-50">🥗 Danh mục Thực đơn</div>
                        {categories.filter(cat => cat.type === 'diet').map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nội dung chi tiết</Label>
                  <Textarea
                    placeholder="Mô tả bài tập hoặc kiến thức chia sẻ..."
                    className="min-h-[150px]"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Video bài tập (.mp4)</Label>
                    <Input
                      type="file"
                      accept="video/mp4,video/mov,video/webm"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setVideoFile(file)
                          setNewPost({ ...newPost, video_url: '' })
                        }
                      }}
                      className="cursor-pointer"
                    />
                    {videoFile && (
                      <p className="text-xs text-accent">✓ {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Calories ước tính</Label>
                    <Input
                      type="number"
                      placeholder="VD: 300"
                      value={newPost.calories_info}
                      onChange={(e) => setNewPost({ ...newPost, calories_info: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Giá bán (VND) - Để 0 nếu Miễn phí</Label>
                  <Input
                    type="number"
                    placeholder="VD: 50000"
                    value={newPost.price}
                    onChange={(e) => setNewPost({ ...newPost, price: e.target.value })}
                  />
                </div>
                <Button className="w-full h-12 text-lg font-bold mt-4" onClick={handleCreatePost} disabled={isUploading}>
                  {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang upload...</> : 'Gửi duyệt bài viết'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Article List */}
        <Card className="rounded-2xl border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary/20 border-b border-border text-left">
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Bài tập/Bài viết</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Danh mục</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Giá</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {!isLoading && posts.length > 0 ? posts.map((post) => (
                  <tr key={post.id} className="hover:bg-secondary/10 transition-colors group">
                    <td className="px-6 py-4 capitalize font-semibold text-foreground">
                      {post.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-secondary px-2 py-1 rounded text-xs">
                        {getCategoryName(post.category_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${post.status === 'approved' ? 'bg-accent/10 text-accent' :
                        post.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-destructive/10 text-destructive'
                        }`}>
                        {post.status === 'approved' ? '✓ Đã duyệt' : post.status === 'pending' ? '◷ Chờ duyệt' : '✕ Từ chối'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-foreground">
                      {post.price > 0 ? `${Math.floor(post.price).toLocaleString('vi-VN')}đ` : <span className="text-green-500">Free</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary h-8 hover:bg-primary/10"
                          onClick={() => {
                            setSelectedPost(post)
                            setEditData(post)
                            setIsDetailOpen(true)
                            setIsEditMode(true)
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive h-8 hover:bg-destructive/10"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          Xóa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground h-8"
                          onClick={() => {
                            setSelectedPost(post)
                            setEditData(post)
                            setIsDetailOpen(true)
                            setIsEditMode(false)
                          }}
                        >
                          Chi tiết
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : !isLoading && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-muted-foreground">
                      Bạn chưa có bài viết nào. Hãy bấm "Viết bài mới" để bắt đầu!
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">Đang tải...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Detail & Edit Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={(open) => {
          setIsDetailOpen(open)
          if (!open) setIsEditMode(false)
        }}>
          <DialogContent className="max-w-2xl bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {isEditMode ? 'Chỉnh sửa bài viết' : 'Chi tiết bài viết'}
              </DialogTitle>
            </DialogHeader>

            {selectedPost && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tiêu đề</Label>
                    {isEditMode ? (
                      <Input
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      />
                    ) : (
                      <div className="p-2 bg-secondary/20 rounded border border-border text-foreground font-medium">
                        {selectedPost.title}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Danh mục</Label>
                    {isEditMode ? (
                      <Select
                        defaultValue={editData.category_id?.toString()}
                        onValueChange={(v) => setEditData({ ...editData, category_id: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <div className="p-2 text-xs font-black text-primary uppercase tracking-widest opacity-50">🏋️ Danh mục Bài tập</div>
                          {categories.filter(cat => cat.type === 'workout').map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                          ))}
                          <div className="p-2 mt-2 text-xs font-black text-accent uppercase tracking-widest opacity-50">🥗 Danh mục Thực đơn</div>
                          {categories.filter(cat => cat.type === 'diet').map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-2 bg-secondary/20 rounded border border-border text-foreground">
                        {getCategoryName(selectedPost.category_id)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nội dung</Label>
                  {isEditMode ? (
                    <Textarea
                      className="min-h-[150px]"
                      value={editData.content}
                      onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                    />
                  ) : (
                    <div className="p-3 bg-secondary/20 rounded border border-border text-foreground whitespace-pre-wrap text-sm max-h-[200px] overflow-y-auto">
                      {selectedPost.content}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Video Bài Tập (.mp4)</Label>
                    {isEditMode ? (
                      <div>
                        <Input
                          type="file"
                          accept="video/mp4,video/mov,video/webm"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setVideoFile(file)
                              setEditData({ ...editData, video_url: '' })
                            }
                          }}
                          className="cursor-pointer"
                        />
                        {videoFile && (
                          <p className="text-xs text-accent mt-1">✓ {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)</p>
                        )}
                        {!videoFile && editData.video_url && (
                          <p className="text-xs text-muted-foreground mt-1 text-primary truncate max-w-full">
                            Video hiện tại: {editData.video_url}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-2 bg-secondary/20 rounded border border-border text-primary truncate text-sm">
                        {selectedPost.video_url || 'Không có video'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Calories</Label>
                    {isEditMode ? (
                      <Input
                        type="number"
                        value={editData.calories_info}
                        onChange={(e) => setEditData({ ...editData, calories_info: parseInt(e.target.value) })}
                      />
                    ) : (
                      <div className="p-2 bg-secondary/20 rounded border border-border text-foreground text-sm">
                        {selectedPost.calories_info} kcal
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Giá bán (VND)</Label>
                  {isEditMode ? (
                    <Input
                      type="number"
                      value={editData.price}
                      onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                    />
                  ) : (
                    <div className="p-2 bg-secondary/20 rounded border border-border font-bold text-primary">
                      {selectedPost.price > 0 ? `${selectedPost.price.toLocaleString()}đ` : 'Miễn phí'}
                    </div>
                  )}
                </div>

                <DialogFooter className="flex gap-2 sm:justify-between pt-4">
                  <div className="flex gap-2">
                    {!isEditMode && (
                      <Button variant="destructive" size="sm" onClick={() => handleDeletePost(selectedPost.id)}>
                        Xóa bài
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isEditMode ? (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setIsEditMode(false); setVideoFile(null); }}>Hủy</Button>
                        <Button size="sm" onClick={handleUpdatePost} disabled={isUploading}>
                          {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : 'Lưu thay đổi'}
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => setIsEditMode(true)}>Sửa bài</Button>
                    )}
                  </div>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
