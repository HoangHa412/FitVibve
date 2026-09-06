'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function PaymentResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const success = searchParams.get('success') === 'true'
  const amount = searchParams.get('amount')
  const message = searchParams.get('message')

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/10 p-4">
      <Card className="max-w-md w-full p-8 text-center rounded-[2rem] shadow-2xl border-none">
        {success ? (
          <>
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">Thanh toán thành công!</h2>
            <p className="text-muted-foreground mb-6">
              Bạn đã nạp thành công <span className="font-bold text-primary">{amount ? parseInt(amount).toLocaleString('vi-VN') : ''}đ</span> vào ví.
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">Thanh toán thất bại</h2>
            <p className="text-muted-foreground mb-6">
              {message || 'Có lỗi xảy ra trong quá trình thanh toán.'}
            </p>
          </>
        )}
        <Button 
          onClick={() => router.push('/dashboard')}
          className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl"
        >
          Trở về Dashboard
        </Button>
      </Card>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Đang tải...</div>}>
      <PaymentResultContent />
    </Suspense>
  )
}
