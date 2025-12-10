import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types para o banco de dados
export type User = {
  id: string
  email: string
  name: string
  created_at: string
  avatar_url?: string
}

export type UserPreferences = {
  id: string
  user_id: string
  daily_reminders: boolean
  reminder_time: string
  sound_effects: boolean
  haptic_feedback: boolean
  theme: 'light' | 'dark' | 'auto'
  favorite_soundscape?: string
  breathing_duration: number
  created_at: string
  updated_at: string
}

export type MoodEntry = {
  id: string
  user_id: string
  mood: 'peaceful' | 'calm' | 'neutral' | 'low' | 'anxious'
  note?: string
  created_at: string
}

export type Session = {
  id: string
  user_id: string
  type: 'breathing' | 'grounding' | 'meditation' | 'soundscape'
  duration: number
  completed: boolean
  created_at: string
}

export type Achievement = {
  id: string
  user_id: string
  badge_type: string
  earned_at: string
}

export type EmotionalJournal = {
  id: string
  user_id: string
  title: string
  content: string
  mood: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export type EducationalContent = {
  id: string
  title: string
  description: string
  content: string
  category: 'mindfulness' | 'breathing' | 'meditation' | 'wellness'
  duration_minutes: number
  image_url?: string
  created_at: string
}

export type Feedback = {
  id: string
  user_id: string
  rating: number
  comment?: string
  category: 'bug' | 'feature' | 'general'
  created_at: string
}
