export type UserRole = 'user' | 'coach' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt?: Date
}

export interface HealthMetrics {
  id: string
  userId: string
  height: number // cm
  weight: number // kg
  age: number
  bmi: number
  bmr: number // Basal Metabolic Rate
  tdee: number // Total Daily Energy Expenditure
  bodyFatPercentage?: number
  createdAt: Date
}

export interface WeightEntry {
  id: string
  userId: string
  weight: number // kg
  date: Date
}

export interface Workout {
  id: string
  userId?: string
  coachId?: string
  name: string
  duration: number // minutes
  intensity: 'light' | 'moderate' | 'high'
  caloriesBurned: number
  category: string
  date: Date
}

export interface Meal {
  id: string
  userId: string
  name: string
  calories: number
  protein: number // grams
  carbs: number // grams
  fat: number // grams
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  date: Date
}

export interface Article {
  id: string
  coachId: string
  title: string
  content: string
  category: string
  status: 'draft' | 'pending' | 'published'
  views: number
  comments: number
  createdAt: Date
  updatedAt: Date
}

export interface Goal {
  id: string
  userId: string
  title: string
  description: string
  target: string
  timeline: string
  progress: number // percentage 0-100
  status: 'active' | 'completed' | 'abandoned'
  createdAt: Date
}

export interface ModerationItem {
  id: string
  type: 'weight-update' | 'article-comment' | 'image-upload'
  userId: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
}
