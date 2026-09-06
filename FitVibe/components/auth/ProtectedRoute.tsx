'use client'

import { useAuth, type UserRole } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
      return
    }

    if (
      !loading &&
      user &&
      requiredRoles &&
      !requiredRoles.includes(user.role)
    ) {
      // Redirect to appropriate dashboard based on user role
      const path = user.role === 'admin' ? '/admin' : user.role === 'coach' ? '/coach' : '/dashboard'
      router.push(path)
    }
  }, [user, loading, requiredRoles, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary"></div>
          <p className="mt-4 text-foreground/60">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
