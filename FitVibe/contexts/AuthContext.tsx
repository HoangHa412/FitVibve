'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi, userApi } from '@/lib/api'

export type UserRole = 'user' | 'coach' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar_url?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<any>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  signup: (data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('fitvibe-user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('fitvibe-user')
      }
    }
    setLoading(false)
  }, [])

  const refreshUser = async () => {
    try {
      const data = await userApi.getMe() as any
      const updatedUser: User = {
        id: data.user.id.toString(),
        email: data.user.email,
        name: data.user.full_name,
        // Fallback to current role if not provided by backend (should be fixed now)
        role: (data.user.role || user?.role) as UserRole,
        avatar_url: data.user.avatar_url
      }
      setUser(updatedUser)
      localStorage.setItem('fitvibe-user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Failed to refresh user', error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password)
      const mockUser: User = {
        id: (data.user.id as number).toString(),
        email: data.user.email as string,
        name: data.user.full_name as string,
        role: data.user.role as UserRole,
        avatar_url: data.user.avatar_url as string,
      }
      setUser(mockUser)
      localStorage.setItem('fitvibe-user', JSON.stringify(mockUser))
      localStorage.setItem('fitvibe-token', data.token)
      return data
    } catch (error: unknown) {
      throw error
    }
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('fitvibe-user')
    localStorage.removeItem('fitvibe-token')
  }

  const signup = async (data: any) => {
    try {
      await authApi.register(data)
    } catch (error: unknown) {
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, signup }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
