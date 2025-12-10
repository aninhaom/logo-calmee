import { supabase } from './supabase'
import type { UserPreferences, MoodEntry, Session, Achievement, EmotionalJournal, Feedback } from './supabase'

// ============ USER PREFERENCES ============
export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateUserPreferences(userId: string, preferences: Partial<UserPreferences>) {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({ 
      user_id: userId, 
      ...preferences,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============ MOOD ENTRIES ============
export async function createMoodEntry(userId: string, mood: MoodEntry['mood'], note?: string) {
  const { data, error } = await supabase
    .from('mood_entries')
    .insert({ user_id: userId, mood, note })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getMoodEntries(userId: string, limit = 30) {
  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export async function getMoodTrend(userId: string, days = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await supabase
    .from('mood_entries')
    .select('mood, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

// ============ SESSIONS ============
export async function createSession(
  userId: string, 
  type: Session['type'], 
  duration: number,
  completed = true
) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({ user_id: userId, type, duration, completed })
    .select()
    .single()
  
  if (error) throw error
  
  // Verificar conquistas após criar sessão
  await checkAndAwardAchievements(userId)
  
  return data
}

export async function getSessionStats(userId: string, days = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
  
  if (error) throw error
  
  const totalSessions = data.length
  const totalMinutes = data.reduce((sum, s) => sum + s.duration, 0)
  const byType = data.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return { totalSessions, totalMinutes, byType, sessions: data }
}

export async function getStreak(userId: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  if (!data || data.length === 0) return 0
  
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  for (const session of data) {
    const sessionDate = new Date(session.created_at)
    sessionDate.setHours(0, 0, 0, 0)
    
    const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === streak) {
      streak++
    } else if (diffDays > streak) {
      break
    }
  }
  
  return streak
}

// ============ ACHIEVEMENTS ============
export async function getAchievements(userId: string) {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
  
  if (error) throw error
  return data
}

async function checkAndAwardAchievements(userId: string) {
  const stats = await getSessionStats(userId, 365)
  const streak = await getStreak(userId)
  const achievements = await getAchievements(userId)
  const earnedBadges = new Set(achievements.map(a => a.badge_type))
  
  const newBadges: string[] = []
  
  // Primeira sessão
  if (stats.totalSessions === 1 && !earnedBadges.has('first_session')) {
    newBadges.push('first_session')
  }
  
  // 7 dias de sequência
  if (streak >= 7 && !earnedBadges.has('week_streak')) {
    newBadges.push('week_streak')
  }
  
  // 30 dias de sequência
  if (streak >= 30 && !earnedBadges.has('month_streak')) {
    newBadges.push('month_streak')
  }
  
  // 10 sessões
  if (stats.totalSessions >= 10 && !earnedBadges.has('ten_sessions')) {
    newBadges.push('ten_sessions')
  }
  
  // 50 sessões
  if (stats.totalSessions >= 50 && !earnedBadges.has('fifty_sessions')) {
    newBadges.push('fifty_sessions')
  }
  
  // Mestre da respiração (20 sessões de respiração)
  if ((stats.byType.breathing || 0) >= 20 && !earnedBadges.has('breathing_master')) {
    newBadges.push('breathing_master')
  }
  
  // Inserir novos badges
  if (newBadges.length > 0) {
    await supabase
      .from('achievements')
      .insert(newBadges.map(badge => ({ user_id: userId, badge_type: badge })))
  }
  
  return newBadges
}

// ============ EMOTIONAL JOURNAL ============
export async function createJournalEntry(
  userId: string,
  title: string,
  content: string,
  mood: string,
  tags?: string[]
) {
  const { data, error } = await supabase
    .from('emotional_journal')
    .insert({ user_id: userId, title, content, mood, tags })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getJournalEntries(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('emotional_journal')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export async function updateJournalEntry(
  entryId: string,
  updates: Partial<EmotionalJournal>
) {
  const { data, error } = await supabase
    .from('emotional_journal')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', entryId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteJournalEntry(entryId: string) {
  const { error } = await supabase
    .from('emotional_journal')
    .delete()
    .eq('id', entryId)
  
  if (error) throw error
}

// ============ EDUCATIONAL CONTENT ============
export async function getEducationalContent(category?: string, limit = 10) {
  let query = supabase
    .from('educational_content')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (category) {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

// ============ FEEDBACK ============
export async function submitFeedback(
  userId: string,
  rating: number,
  comment?: string,
  category: Feedback['category'] = 'general'
) {
  const { data, error } = await supabase
    .from('feedback')
    .insert({ user_id: userId, rating, comment, category })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getUserFeedback(userId: string) {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// ============ COMMUNITY ============
export async function getCommunityPosts(limit = 20) {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export async function createCommunityPost(
  userId: string,
  userName: string,
  content: string,
  mood?: string,
  isAnonymous = false
) {
  const { data, error } = await supabase
    .from('community_posts')
    .insert({ 
      user_id: userId, 
      user_name: isAnonymous ? 'Anônimo' : userName, 
      content, 
      mood,
      is_anonymous: isAnonymous
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function likeCommunityPost(userId: string, postId: string) {
  // Verificar se já curtiu
  const { data: existingLike } = await supabase
    .from('community_likes')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .single()
  
  if (existingLike) {
    // Remover curtida
    await supabase
      .from('community_likes')
      .delete()
      .eq('id', existingLike.id)
    
    // Decrementar contador
    await supabase.rpc('decrement_likes', { post_id: postId })
  } else {
    // Adicionar curtida
    await supabase
      .from('community_likes')
      .insert({ user_id: userId, post_id: postId })
    
    // Incrementar contador
    await supabase.rpc('increment_likes', { post_id: postId })
  }
}

export async function getPostComments(postId: string) {
  const { data, error } = await supabase
    .from('community_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

export async function createComment(
  postId: string,
  userId: string,
  userName: string,
  content: string
) {
  const { data, error } = await supabase
    .from('community_comments')
    .insert({ post_id: postId, user_id: userId, user_name: userName, content })
    .select()
    .single()
  
  if (error) throw error
  
  // Incrementar contador de comentários
  await supabase.rpc('increment_comments', { post_id: postId })
  
  return data
}

// ============ DAILY QUOTES ============
export async function getDailyQuote() {
  // Pegar uma frase aleatória
  const { data, error } = await supabase
    .from('daily_quotes')
    .select('*')
    .limit(1)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  // Se não houver frases, retornar uma padrão
  if (!data || data.length === 0) {
    return {
      quote: 'Respire fundo. Você está fazendo o melhor que pode.',
      author: 'Calmee',
      category: 'motivation'
    }
  }
  
  // Retornar frase aleatória
  return data[Math.floor(Math.random() * data.length)]
}

export async function getAllQuotes(category?: string) {
  let query = supabase
    .from('daily_quotes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (category) {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}
