'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import ReactMarkdown from 'react-markdown'

interface RecommendationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  content: string
}

export function RecommendationModal({ open, onOpenChange, content }: RecommendationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary font-bold">Lộ trình AI cá nhân hóa</DialogTitle>
          <DialogDescription>
            Được tạo riêng cho bạn dựa trên thông tin sức khỏe và mục tiêu.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2 mt-4 prose prose-sm sm:prose-base dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
  )
}
