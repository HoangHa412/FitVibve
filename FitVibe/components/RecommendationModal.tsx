'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles, Flame } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

export interface MatchedRoute {
  id: number
  title: string
  coach_name: string
  price: number
  target_goal: string
  match_score?: number
  match_reason?: string
}

interface RecommendationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  content: string
  matchedRoutes?: MatchedRoute[]
}

export function RecommendationModal({ open, onOpenChange, content, matchedRoutes }: RecommendationModalProps) {
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] flex flex-col p-6 rounded-3xl overflow-hidden bg-card/95 backdrop-blur-xl border border-border shadow-2xl">
        <DialogHeader className="shrink-0 pb-2 border-b border-border/50">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <DialogTitle className="text-xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-primary bg-clip-text text-transparent">
              Lộ trình AI Cá Nhân Hóa & Đề Xuất
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Phân tích chuyên sâu dựa trên chỉ số BMI, mục tiêu và danh mục lộ trình đào tạo của FitVibe.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-6">
          {/* Matched System Routes Section */}
          {matchedRoutes && matchedRoutes.length > 0 && (
            <div className="p-4 rounded-3xl bg-secondary/30 border border-primary/20 space-y-3.5 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h4 className="font-black text-xs uppercase tracking-wider text-foreground">
                    Lộ trình FitVibe phù hợp nhất với bạn
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-muted-foreground">
                  {matchedRoutes.length} lộ trình đề xuất
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchedRoutes.slice(0, 2).map((route) => (
                  <div
                    key={route.id}
                    onClick={() => {
                      onOpenChange(false)
                      router.push(`/dashboard/routes/${route.id}`)
                    }}
                    className="p-3.5 rounded-2xl bg-card border border-border/80 hover:border-primary/60 transition-all duration-200 hover:shadow-xl hover:shadow-primary/5 cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                          {route.target_goal === 'weight_loss' ? 'Giảm cân' : route.target_goal === 'muscle_gain' ? 'Tăng cơ' : 'Duy trì vóc dáng'}
                        </span>
                        {route.match_score && (
                          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20">
                            <Flame className="w-3 h-3 text-orange-400" /> {route.match_score}% Phù hợp
                          </span>
                        )}
                      </div>
                      <h5 className="font-black text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                        {route.title}
                      </h5>
                      <p className="text-[11px] text-muted-foreground mb-2">
                        HLV: <span className="font-semibold text-foreground/80">{route.coach_name}</span>
                      </p>
                      {route.match_reason && (
                        <p className="text-[10px] text-primary/90 italic bg-primary/5 p-1.5 rounded-lg mb-2 line-clamp-2">
                          ✨ {route.match_reason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-1">
                      <span className="font-black text-sm text-primary">
                        {Math.floor(route.price).toLocaleString()}đ
                      </span>
                      <Button size="sm" className="h-7 text-xs px-3 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground group-hover:translate-x-0.5 transition-transform">
                        Xem ngay →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Markdown Advice Content */}
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none leading-relaxed">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
