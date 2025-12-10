'use client'

import { useState, useEffect, useRef } from 'react'
import { Waves, Sparkles, Wind, Heart, Music, TrendingUp, Settings, ChevronRight, Play, Pause, Check, Users, BookOpen, Palette, Lightbulb, Send, ThumbsUp, MessageCircle, Edit3, Save, X, CloudRain, Droplets, Flame, Bell, Radio, Fish, Bird } from 'lucide-react'
import { getAudioManager, defaultAudioConfigs, type AudioKey } from '@/lib/audioManager'

type Screen = 'welcome' | 'onboarding1' | 'onboarding2' | 'onboarding3' | 'home' | 'sos' | 'breathing' | 'grounding' | 'meditation' | 'soundscapes' | 'mood' | 'progress' | 'settings' | 'community' | 'journal' | 'customize' | 'quotes'

export default function CalmeeApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome')
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [breathingActive, setBreathingActive] = useState(false)
  const [groundingStep, setGroundingStep] = useState(0)
  const [meditationPlaying, setMeditationPlaying] = useState<number | null>(null)
  const [soundscapePlaying, setSoundscapePlaying] = useState<number | null>(null)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  
  // Audio Manager
  const audioManagerRef = useRef(getAudioManager())
  
  // Community state
  const [communityPosts, setCommunityPosts] = useState<any[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  
  // Journal state
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  const [journalTitle, setJournalTitle] = useState('')
  const [journalContent, setJournalContent] = useState('')
  const [journalMood, setJournalMood] = useState('neutral')
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  
  // Customization state
  const [preferences, setPreferences] = useState({
    dailyReminders: true,
    reminderTime: '09:00',
    soundEffects: true,
    hapticFeedback: true,
    theme: 'light' as 'light' | 'dark' | 'auto',
    breathingDuration: 4
  })
  
  // Quotes state
  const [dailyQuote, setDailyQuote] = useState<any>(null)
  const [allQuotes, setAllQuotes] = useState<any[]>([])

  // Initialize Audio Manager
  useEffect(() => {
    const audioManager = audioManagerRef.current
    audioManager.registerMultiple(defaultAudioConfigs)
    
    // Cleanup on unmount
    return () => {
      audioManager.cleanup()
    }
  }, [])

  // Load daily quote on mount
  useEffect(() => {
    loadDailyQuote()
  }, [])

  const loadDailyQuote = () => {
    const quotes = [
      { quote: 'A paz vem de dentro. Não a procure fora.', author: 'Buda', category: 'peace' },
      { quote: 'Respire. Você está vivo. Você está bem.', author: 'Thich Nhat Hanh', category: 'breathing' },
      { quote: 'O presente é o único momento que realmente temos.', author: 'Eckhart Tolle', category: 'mindfulness' },
      { quote: 'Seja gentil consigo mesmo. Você está fazendo o melhor que pode.', author: 'Anônimo', category: 'self-care' },
      { quote: 'Cada respiração é uma nova chance de recomeçar.', author: 'Anônimo', category: 'breathing' },
      { quote: 'Você é mais forte do que pensa.', author: 'Anônimo', category: 'motivation' },
      { quote: 'A calma é um superpoder.', author: 'Anônimo', category: 'peace' },
      { quote: 'Permita-se sentir. Todas as emoções são válidas.', author: 'Anônimo', category: 'emotions' },
      { quote: 'O autocuidado não é egoísmo, é necessidade.', author: 'Anônimo', category: 'self-care' },
      { quote: 'Você merece paz e tranquilidade.', author: 'Anônimo', category: 'peace' }
    ]
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setDailyQuote(randomQuote)
    setAllQuotes(quotes)
  }

  // Audio control functions with AudioManager
  const playMeditation = async (index: number) => {
    const audioManager = audioManagerRef.current
    const meditationKeys: AudioKey[] = [
      'medit_crise', 
      'medit_dormir', 
      'medit_ansiedade', 
      'medit_profunda', 
      'medit_ambiente',
      'medit_30s', 
      'medit_60s', 
      'medit_90s'
    ]
    const key = meditationKeys[index]
    
    if (meditationPlaying === index) {
      // Pause current meditation
      audioManager.pause(key)
      setMeditationPlaying(null)
    } else {
      // Stop all soundscapes
      setSoundscapePlaying(null)
      
      // If another meditation is playing, crossfade
      if (meditationPlaying !== null) {
        const fromKey = meditationKeys[meditationPlaying]
        await audioManager.fade(fromKey, key, 1200)
      } else {
        await audioManager.play(key)
      }
      
      setMeditationPlaying(index)
    }
  }

  const playSoundscape = async (index: number) => {
    const audioManager = audioManagerRef.current
    const soundscapeKeys: AudioKey[] = ['ambiente_rain', 'ambiente_ocean', 'ambiente_wind', 'ambiente_piano', 'ambiente_birds', 'ambiente_water', 'ambiente_fireplace', 'ambiente_bowl', 'ambiente_whitenoise', 'ambiente_underwater']
    const key = soundscapeKeys[index]
    
    if (soundscapePlaying === index) {
      // Pause current soundscape
      audioManager.pause(key)
      setSoundscapePlaying(null)
    } else {
      // Stop all meditations
      setMeditationPlaying(null)
      
      // If another soundscape is playing, crossfade
      if (soundscapePlaying !== null) {
        const fromKey = soundscapeKeys[soundscapePlaying]
        await audioManager.fade(fromKey, key, 1000)
      } else {
        await audioManager.play(key)
      }
      
      setSoundscapePlaying(index)
    }
  }

  // Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF] via-[#FFF8F5] to-[#F0F9FF] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="w-24 h-24 mx-auto bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <Waves className="w-12 h-12 text-[#A78BFA]" strokeWidth={1.5} />
            </div>
            <h1 className="text-5xl font-light text-[#6B7280] tracking-tight">Calmee</h1>
            <p className="text-lg font-light text-[#9CA3AF]">Seu santuário de paz</p>
          </div>
          
          <div className="space-y-3 pt-8">
            <button 
              onClick={() => setCurrentScreen('onboarding1')}
              className="w-full py-4 bg-gradient-to-r from-[#A78BFA] to-[#ead8f2] text-white rounded-full font-light text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Comece Sua Jornada
            </button>
            <button 
              onClick={() => setCurrentScreen('home')}
              className="w-full py-4 bg-white/50 backdrop-blur-sm text-[#9CA3AF] rounded-full font-light text-lg hover:bg-white/70 transition-all duration-300"
            >
              Já tenho uma conta
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Onboarding Screens
  if (currentScreen === 'onboarding1' || currentScreen === 'onboarding2' || currentScreen === 'onboarding3') {
    const onboardingData = [
      {
        icon: <Heart className="w-16 h-16 text-[#F9A8D4]" strokeWidth={1} />,
        title: "Encontre Sua Calma",
        description: "Alívio instantâneo quando as emoções são avassaladoras"
      },
      {
        icon: <Sparkles className="w-16 h-16 text-[#A78BFA]" strokeWidth={1} />,
        title: "Técnicas Suaves",
        description: "Ferramentas baseadas em ciência projetadas para sua paz"
      },
      {
        icon: <Wind className="w-16 h-16 text-[#7DD3FC]" strokeWidth={1} />,
        title: "Seu Espaço Seguro",
        description: "Uma zona sem julgamentos, sempre aqui para você"
      }
    ]

    const currentData = onboardingData[onboardingStep]
    const isLast = onboardingStep === 2

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F5] via-[#F5F3FF] to-[#F0F9FF] flex flex-col items-center justify-between p-6 py-12">
        <div className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-md">
          <div className="w-32 h-32 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl">
            {currentData.icon}
          </div>
          
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-light text-[#6B7280]">{currentData.title}</h2>
            <p className="text-lg font-light text-[#9CA3AF] leading-relaxed px-4">{currentData.description}</p>
          </div>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === onboardingStep ? 'w-8 bg-[#A78BFA]' : 'w-1.5 bg-[#E5E7EB]'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={() => {
              if (isLast) {
                setCurrentScreen('home')
              } else {
                setOnboardingStep(onboardingStep + 1)
                setCurrentScreen(`onboarding${onboardingStep + 2}` as Screen)
              }
            }}
            className="w-full py-4 bg-gradient-to-r from-[#A78BFA] to-[#ead8f2] text-white rounded-full font-light text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isLast ? 'Começar' : 'Continuar'}
          </button>

          {!isLast && (
            <button 
              onClick={() => setCurrentScreen('home')}
              className="w-full py-2 text-[#9CA3AF] font-light text-sm"
            >
              Pular
            </button>
          )}
        </div>
      </div>
    )
  }

  // Home Screen
  if (currentScreen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF] to-[#FFF8F5] p-6 pb-24">
        <div className="max-w-md mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center pt-4">
            <div>
              <h1 className="text-2xl font-light text-[#6B7280]">Olá, Sarah</h1>
              <p className="text-sm font-light text-[#9CA3AF]">Como você está se sentindo hoje?</p>
            </div>
            <button 
              onClick={() => setCurrentScreen('settings')}
              className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md"
            >
              <Settings className="w-5 h-5 text-[#9CA3AF]" strokeWidth={1.5} />
            </button>
          </div>



          {/* Daily Quote Card */}
          {dailyQuote && (
            <div className="bg-gradient-to-br from-[#A78BFA]/10 to-[#F9A8D4]/10 rounded-3xl p-6 shadow-lg border border-white/50">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-[#A78BFA] flex-shrink-0 mt-1" strokeWidth={1.5} />
                <div className="flex-1">
                  <p className="text-sm font-light text-[#9CA3AF] mb-2">Frase do Dia</p>
                  <p className="text-lg font-light text-[#6B7280] leading-relaxed mb-2">"{dailyQuote.quote}"</p>
                  <p className="text-sm font-light text-[#A78BFA]">— {dailyQuote.author}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main CTA */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#A78BFA]/20 to-[#F9A8D4]/20 rounded-[2rem] blur-2xl" />
            <button 
              onClick={() => setCurrentScreen('sos')}
              className="relative w-full py-16 bg-gradient-to-br from-[#A78BFA] to-[#ead8f2] rounded-[2rem] shadow-2xl hover:shadow-3xl transition-all duration-300 flex flex-col items-center justify-center space-y-3"
            >
              <Waves className="w-16 h-16 text-white" strokeWidth={1} />
              <span className="text-3xl font-light text-white">Me Acalme Agora</span>
            </button>
          </div>

          {/* Quick Tools */}
          <div className="space-y-3">
            <h2 className="text-lg font-light text-[#6B7280] px-2">Ferramentas Rápidas</h2>
            <div className="grid grid-cols-2 gap-3">
              <ToolCard 
                icon={<Wind className="w-8 h-8" strokeWidth={2} />}
                title="Respiração"
                color="from-[#B5E4EA] to-[#ead8f2]"
                onClick={() => setCurrentScreen('breathing')}
              />
              <ToolCard 
                icon={<Sparkles className="w-8 h-8" strokeWidth={2} />}
                title="Aterramento"
                color="from-[#FEAFAB] to-[#ead8f2]"
                onClick={() => setCurrentScreen('grounding')}
              />
              <ToolCard 
                icon={<Heart className="w-8 h-8" strokeWidth={2} />}
                title="Meditação"
                color="from-[#f5debc] to-[#ead8f2]"
                onClick={() => setCurrentScreen('meditation')}
              />
              <ToolCard 
                icon={<Music className="w-8 h-8" strokeWidth={2} />}
                title="Sons"
                color="from-[#FBD5B0] to-[#ead8f2]"
                onClick={() => setCurrentScreen('soundscapes')}
              />
            </div>
          </div>

          {/* New Features Grid */}
          <div className="grid grid-cols-2 gap-3">
            <FeatureCard 
              icon={<Users className="w-8 h-8" strokeWidth={2} />}
              title="Comunidade"
              color="from-[#ead8f2] to-[#B5E4EA]"
              onClick={() => setCurrentScreen('community')}
            />
            <FeatureCard 
              icon={<BookOpen className="w-8 h-8" strokeWidth={2} />}
              title="Diário"
              color="from-[#ead8f2] to-[#FECACA]"
              onClick={() => setCurrentScreen('journal')}
            />
          </div>

          {/* Daily Check-in */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-light text-[#6B7280]">Check-in Diário</h3>
              <ChevronRight className="w-5 h-5 text-[#9CA3AF]" strokeWidth={1.5} />
            </div>
            <button 
              onClick={() => setCurrentScreen('mood')}
              className="w-full py-3 bg-gradient-to-r from-[#A78BFA]/20 to-[#F9A8D4]/20 rounded-2xl text-[#6B7280] font-light"
            >
              Como você se sente agora?
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav current="home" onChange={setCurrentScreen} />
      </div>
    )
  }

  // Community Screen
  if (currentScreen === 'community') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF] to-[#FFF8F5] p-6 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-[#9CA3AF] font-light flex items-center gap-2"
          >
            ← Voltar
          </button>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-light text-[#6B7280]">Comunidade</h1>
            <p className="text-lg font-light text-[#9CA3AF]">Compartilhe sua jornada</p>
          </div>

          {/* New Post */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg space-y-4">
            <textarea 
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Compartilhe como você está se sentindo..."
              className="w-full h-24 bg-white/50 rounded-2xl p-4 text-[#6B7280] font-light text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/50"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-light text-[#9CA3AF]">
                <input 
                  type="checkbox" 
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                Postar anonimamente
              </label>
              <button 
                onClick={() => {
                  if (newPostContent.trim()) {
                    setCommunityPosts([
                      {
                        id: Date.now(),
                        userName: isAnonymous ? 'Anônimo' : 'Sarah',
                        content: newPostContent,
                        mood: selectedMood,
                        likes: 0,
                        comments: 0,
                        createdAt: new Date()
                      },
                      ...communityPosts
                    ])
                    setNewPostContent('')
                    setIsAnonymous(false)
                  }
                }}
                className="px-6 py-2 bg-gradient-to-r from-[#A78BFA] to-[#ead8f2] text-white rounded-full font-light text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Send className="w-4 h-4" strokeWidth={1.5} />
                Publicar
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {communityPosts.length === 0 ? (
              <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-12 text-center">
                <Users className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" strokeWidth={1} />
                <p className="text-lg font-light text-[#9CA3AF]">Seja o primeiro a compartilhar</p>
                <p className="text-sm font-light text-[#9CA3AF] mt-2">Sua experiência pode ajudar outros</p>
              </div>
            ) : (
              communityPosts.map((post) => (
                <CommunityPostCard key={post.id} post={post} />
              ))
            )}
          </div>
        </div>

        <BottomNav current="community" onChange={setCurrentScreen} />
      </div>
    )
  }

  // Journal Screen
  if (currentScreen === 'journal') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F5] to-[#F5F3FF] p-6 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-[#9CA3AF] font-light flex items-center gap-2"
          >
            ← Voltar
          </button>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-light text-[#6B7280]">Diário de Emoções</h1>
            <p className="text-lg font-light text-[#9CA3AF]">Registre seus sentimentos</p>
          </div>

          {/* New Entry Form */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg space-y-4">
            <input 
              type="text"
              value={journalTitle}
              onChange={(e) => setJournalTitle(e.target.value)}
              placeholder="Título da entrada..."
              className="w-full bg-white/50 rounded-2xl p-4 text-[#6B7280] font-light focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/50"
            />
            <textarea 
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
              placeholder="Como você está se sentindo hoje?"
              className="w-full h-32 bg-white/50 rounded-2xl p-4 text-[#6B7280] font-light resize-none focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/50"
            />
            
            {/* Mood Selector */}
            <div className="space-y-2">
              <p className="text-sm font-light text-[#9CA3AF]">Como você se sente?</p>
              <div className="flex gap-2">
                {['😊', '😌', '😐', '😔', '😰'].map((emoji, i) => (
                  <button 
                    key={i}
                    onClick={() => setJournalMood(['peaceful', 'calm', 'neutral', 'low', 'anxious'][i])}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                      journalMood === ['peaceful', 'calm', 'neutral', 'low', 'anxious'][i]
                        ? 'bg-[#A78BFA] scale-110'
                        : 'bg-white/50'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                if (journalTitle.trim() && journalContent.trim()) {
                  setJournalEntries([
                    {
                      id: Date.now(),
                      title: journalTitle,
                      content: journalContent,
                      mood: journalMood,
                      createdAt: new Date()
                    },
                    ...journalEntries
                  ])
                  setJournalTitle('')
                  setJournalContent('')
                  setJournalMood('neutral')
                }
              }}
              className="w-full py-3 bg-gradient-to-r from-[#A78BFA] to-[#ead8f2] text-white rounded-full font-light shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" strokeWidth={1.5} />
              Salvar Entrada
            </button>
          </div>

          {/* Journal Entries */}
          <div className="space-y-4">
            {journalEntries.length === 0 ? (
              <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-12 text-center">
                <BookOpen className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" strokeWidth={1} />
                <p className="text-lg font-light text-[#9CA3AF]">Seu diário está vazio</p>
                <p className="text-sm font-light text-[#9CA3AF] mt-2">Comece registrando seus sentimentos</p>
              </div>
            ) : (
              journalEntries.map((entry) => (
                <JournalEntryCard 
                  key={entry.id} 
                  entry={entry}
                  onEdit={(id) => setEditingEntry(id)}
                  onDelete={(id) => setJournalEntries(journalEntries.filter(e => e.id !== id))}
                />
              ))
            )}
          </div>
        </div>

        <BottomNav current="journal" onChange={setCurrentScreen} />
      </div>
    )
  }

  // Quotes Screen
  if (currentScreen === 'quotes') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF] to-[#FFF8F5] p-6 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-[#9CA3AF] font-light flex items-center gap-2"
          >
            ← Voltar
          </button>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-light text-[#6B7280]">Frases Motivacionais</h1>
            <p className="text-lg font-light text-[#9CA3AF]">Inspiração para sua jornada</p>
          </div>

          {/* Quotes Grid */}
          <div className="space-y-4">
            {allQuotes.map((quote, i) => (
              <div 
                key={i}
                className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-6 h-6 text-[#A78BFA] flex-shrink-0 mt-1" strokeWidth={1.5} />
                  <div className="flex-1">
                    <p className="text-lg font-light text-[#6B7280] leading-relaxed mb-3">"{quote.quote}"</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-light text-[#A78BFA]">— {quote.author}</p>
                      <span className="text-xs font-light text-[#9CA3AF] bg-white/50 px-3 py-1 rounded-full">
                        {quote.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // SOS Screen
  if (currentScreen === 'sos') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F5] to-[#F5F3FF] p-6">
        <div className="max-w-md mx-auto space-y-6">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-[#9CA3AF] font-light flex items-center gap-2"
          >
            ← Voltar
          </button>

          <div className="text-center space-y-2 py-8">
            <h1 className="text-3xl font-light text-[#6B7280]">Você Está Seguro Aqui</h1>
            <p className="text-lg font-light text-[#9CA3AF]">Escolha o que parece certo para você</p>
          </div>

          <div className="space-y-4">
            <SOSCard 
              icon={<Wind className="w-8 h-8" strokeWidth={1} />}
              title="Exercício de Respiração"
              subtitle="Acalme seu sistema nervoso"
              color="from-[#B5E4EA] to-[#ead8f2]"
              onClick={() => setCurrentScreen('breathing')}
            />
            <SOSCard 
              icon={<Sparkles className="w-8 h-8" strokeWidth={1} />}
              title="Aterramento 5-4-3-2-1"
              subtitle="Conecte-se com o presente"
              color="from-[#FEAFAB] to-[#ead8f2]"
              onClick={() => setCurrentScreen('grounding')}
            />
            <SOSCard 
              icon={<Heart className="w-8 h-8" strokeWidth={1} />}
              title="Meditação Rápida"
              subtitle="30 segundos de paz"
              color="from-[#A78BFA] to-[#ead8f2]"
              onClick={() => setCurrentScreen('meditation')}
            />
            <SOSCard 
              icon={<Music className="w-8 h-8" strokeWidth={1} />}
              title="Sons Calmantes"
              subtitle="Paisagens sonoras relaxantes"
              color="from-[#FBD5B0] to-[#ead8f2]"
              onClick={() => setCurrentScreen('soundscapes')}
            />
          </div>
        </div>
      </div>
    )
  }

  // Breathing Exercise Screen
  if (currentScreen === 'breathing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F0F9FF] to-[#E0F2FE] p-6 flex flex-col">
        <button 
          onClick={() => setCurrentScreen('home')}
          className="text-[#9CA3AF] font-light flex items-center gap-2 mb-8"
        >
          ← Voltar
        </button>

        <div className="flex-1 flex flex-col items-center justify-center space-y-12">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-light text-[#6B7280]">Exercício de Respiração</h1>
            <p className="text-lg font-light text-[#9CA3AF]">Siga o ritmo suave</p>
          </div>

          {/* Breathing Circle Animation */}
          <div className="relative w-64 h-64">
            <div className={`absolute inset-0 bg-gradient-to-br from-[#7DD3FC] to-[#ead8f2] rounded-full transition-all duration-4000 ${breathingActive ? 'scale-100 opacity-40' : 'scale-75 opacity-20'}`} />
            <div className={`absolute inset-8 bg-gradient-to-br from-[#7DD3FC] to-[#ead8f2] rounded-full transition-all duration-4000 ${breathingActive ? 'scale-100 opacity-60' : 'scale-75 opacity-40'}`} />
            <div className={`absolute inset-16 bg-gradient-to-br from-[#7DD3FC] to-[#ead8f2] rounded-full flex items-center justify-center transition-all duration-4000 ${breathingActive ? 'scale-110' : 'scale-100'}`}>
              <span className="text-white text-2xl font-light">
                {breathingActive ? 'Inspire' : 'Expire'}
              </span>
            </div>
          </div>

          <button 
            onClick={() => setBreathingActive(!breathingActive)}
            className="px-12 py-4 bg-gradient-to-r from-[#7DD3FC] to-[#ead8f2] text-white rounded-full font-light text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {breathingActive ? 'Pausar' : 'Iniciar'}
          </button>
        </div>
      </div>
    )
  }

  // Grounding Technique Screen
  if (currentScreen === 'grounding') {
    const groundingSteps = [
      { number: 5, text: "Nomeie 5 coisas que você pode ver", color: "from-[#F9A8D4] to-[#ead8f2]" },
      { number: 4, text: "Nomeie 4 coisas que você pode tocar", color: "from-[#A78BFA] to-[#ead8f2]" },
      { number: 3, text: "Nomeie 3 coisas que você pode ouvir", color: "from-[#7DD3FC] to-[#ead8f2]" },
      { number: 2, text: "Nomeie 2 coisas que você pode cheirar", color: "from-[#E8B86D] to-[#ead8f2]" },
      { number: 1, text: "Nomeie 1 coisa que você pode saborear", color: "from-[#6BBF7A] to-[#ead8f2]" }
    ]

    const currentStep = groundingSteps[groundingStep]

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F5] to-[#F5F3FF] p-6 flex flex-col">
        <button 
          onClick={() => {
            setGroundingStep(0)
            setCurrentScreen('home')
          }}
          className="text-[#9CA3AF] font-light flex items-center gap-2 mb-8"
        >
          ← Voltar
        </button>

        <div className="flex-1 flex flex-col items-center justify-center space-y-12">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-light text-[#6B7280]">Aterramento 5-4-3-2-1</h1>
            <p className="text-lg font-light text-[#9CA3AF]">Conecte-se com seus sentidos</p>
          </div>

          <div className={`w-48 h-48 bg-gradient-to-br ${currentStep.color} rounded-full flex items-center justify-center shadow-2xl`}>
            <span className="text-8xl font-light text-white">{currentStep.number}</span>
          </div>

          <div className="text-center space-y-4 px-6">
            <p className="text-2xl font-light text-[#6B7280]">{currentStep.text}</p>
            <div className="flex justify-center gap-2 pt-4">
              {groundingSteps.map((_, i) => (
                <div 
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === groundingStep ? 'bg-[#A78BFA]' : 'bg-[#E5E7EB]'}`}
                />
              ))}
            </div>
          </div>

          <button 
            onClick={() => {
              if (groundingStep < 4) {
                setGroundingStep(groundingStep + 1)
              } else {
                setGroundingStep(0)
                setCurrentScreen('home')
              }
            }}
            className={`px-12 py-4 bg-gradient-to-r ${currentStep.color} text-white rounded-full font-light text-lg shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            {groundingStep < 4 ? 'Próximo' : 'Concluir'}
          </button>
        </div>
      </div>
    )
  }

  // Meditation Screen
  if (currentScreen === 'meditation') {
    const meditations = [
      { 
        title: "Crise - Acalmando Rápido", 
        duration: "3 min", 
        description: "Alívio imediato em momentos de crise",
        key: 'medit_crise' as AudioKey
      },
      { 
        title: "Dormir com Segurança", 
        duration: "10 min", 
        description: "Relaxamento profundo para o sono",
        key: 'medit_dormir' as AudioKey
      },
      { 
        title: "Ansiedade Matinal", 
        duration: "5 min", 
        description: "Comece o dia com tranquilidade",
        key: 'medit_ansiedade' as AudioKey
      },
      { 
        title: "Meditação Profunda", 
        duration: "15 min", 
        description: "Conexão interior profunda",
        key: 'medit_profunda' as AudioKey
      },
      { 
        title: "Ambiente Confortável", 
        duration: "8 min", 
        description: "Crie seu espaço de paz",
        key: 'medit_ambiente' as AudioKey
      },
      { 
        title: "Reinício Rápido", 
        duration: "30 seg", 
        description: "Calma instantânea",
        key: 'medit_30s' as AudioKey
      },
      { 
        title: "Pausa Suave", 
        duration: "60 seg", 
        description: "Momento de paz",
        key: 'medit_60s' as AudioKey
      },
      { 
        title: "Mini Retiro", 
        duration: "90 seg", 
        description: "Relaxamento profundo",
        key: 'medit_90s' as AudioKey
      }
    ]

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF] to-[#FFF8F5] p-6 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          <button 
            onClick={() => {
              audioManagerRef.current.stopAll()
              setMeditationPlaying(null)
              setCurrentScreen('home')
            }}
            className="text-[#9CA3AF] font-light flex items-center gap-2"
          >
            ← Voltar
          </button>

          <div className="text-center space-y-2 py-8">
            <h1 className="text-3xl font-light text-[#6B7280]">Micro-Meditações</h1>
            <p className="text-lg font-light text-[#9CA3AF]">Momentos curtos de paz</p>
          </div>

          {/* Info message */}
          <div className="bg-[#A78BFA]/10 rounded-3xl p-4 text-center">
            <p className="text-sm font-light text-[#6B7280]">
              💡 Coloque seus arquivos de áudio em <code className="bg-white/50 px-2 py-1 rounded text-xs">/public/assets/sounds/meditacoes/</code>
            </p>
          </div>

          <div className="space-y-4">
            {meditations.map((med, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-light text-[#6B7280]">{med.title}</h3>
                    <p className="text-base font-light text-[#9CA3AF] mt-1">{med.description}</p>
                    <p className="text-sm font-light text-[#A78BFA] mt-1">{med.duration}</p>
                  </div>
                  <button 
                    onClick={() => playMeditation(i)}
                    className="w-14 h-14 bg-gradient-to-br from-[#A78BFA] to-[#ead8f2] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {meditationPlaying === i ? (
                      <Pause className="w-6 h-6 text-white" strokeWidth={2} />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-1" strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Soundscapes Screen
  if (currentScreen === 'soundscapes') {
    const soundscapes = [
      { 
        title: "Chuva Suave", 
        icon: <CloudRain className="w-8 h-8" strokeWidth={1.5} />, 
        color: "from-[#7DD3FC] to-[#ead8f2]",
        key: 'ambiente_rain' as AudioKey
      },
      { 
        title: "Ondas do Oceano", 
        icon: <Waves className="w-8 h-8" strokeWidth={1.5} />, 
        color: "from-[#60A5FA] to-[#ead8f2]",
        key: 'ambiente_ocean' as AudioKey
      },
      { 
        title: "Vento Suave", 
        icon: <Wind className="w-8 h-8" strokeWidth={1.5} />, 
        color: "from-[#6BBF7A] to-[#ead8f2]",
        key: 'ambiente_wind' as AudioKey
      },
      { 
        title: "Notas de Piano", 
        icon: <Music className="w-8 h-8" strokeWidth={1.5} />, 
        color: "from-[#A78BFA] to-[#ead8f2]",
        key: 'ambiente_piano' as AudioKey
      },
      { 
        title: "Pássaros", 
        icon: <Bird className="w-8 h-8" strokeWidth={1.5} />, 
        color: "from-[#FCD34D] to-[#ead8f2]",
        key: 'ambiente_birds' as AudioKey
      },
      { 
        title: "Água Corrente", 
        icon: <Droplets className="w-8 h-8" strokeWidth={1.5} />, 
        color: "from-[#67E8F9] to-[#ead8f2]",
        key: 'ambiente_water' as AudioKey
      },
      { 
        title: "Lareira", 
        icon: <Flame className="w-8 h-8" strokeWidth={1.5} />, 
        color: "from-[#FB923C] to-[#ead8f2]",
        key: 'ambiente_fireplace' as AudioKey
      },
      { 
        title: "Taça Tibetana", 
        icon: <Bell className="w-8 h-8" strokeWidth={1.5} />, 
        color: "from-[#E9D5FF] to-[#ead8f2]",
        key: 'ambiente_bowl' as AudioKey
      },
      { 
        title: "White Noise", 
        icon: <Radio className="w-8 h-8" strokeWidth={1.5} />, 
        color: "from-[#D1D5DB] to-[#ead8f2]",
        key: 'ambiente_whitenoise' as AudioKey
      },
      { 
        title: "Som Subaquático", 
        icon: <Fish className="w-8 h-8" strokeWidth={1.5} />, 
        color: "from-[#3B82F6] to-[#ead8f2]",
        key: 'ambiente_underwater' as AudioKey
      }
    ]

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F0F9FF] to-[#E0F2FE] p-6 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          <button 
            onClick={() => {
              audioManagerRef.current.stopAll()
              setSoundscapePlaying(null)
              setCurrentScreen('home')
            }}
            className="text-[#9CA3AF] font-light flex items-center gap-2"
          >
            ← Voltar
          </button>

          <div className="text-center space-y-2 py-8">
            <h1 className="text-3xl font-light text-[#6B7280]">Paisagens Sonoras</h1>
            <p className="text-lg font-light text-[#9CA3AF]">Sons ambientes relaxantes</p>
          </div>

          {/* Info message */}
          <div className="bg-[#7DD3FC]/10 rounded-3xl p-4 text-center">
            <p className="text-sm font-light text-[#6B7280]">
              💡 Coloque seus arquivos de áudio em <code className="bg-white/50 px-2 py-1 rounded text-xs">/public/assets/sounds/ambientes/</code>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {soundscapes.map((sound, i) => (
              <button 
                key={i}
                onClick={() => playSoundscape(i)}
                className={`relative aspect-square w-full bg-gradient-to-br ${sound.color} rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center space-y-3 ${soundscapePlaying === i ? 'ring-4 ring-white/50 scale-105' : ''}`}
              >
                <div className="text-white">{sound.icon}</div>
                <span className="text-white font-light text-base text-center px-2">{sound.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Mood Check-in Screen
  if (currentScreen === 'mood') {
    const moods = [
      { emoji: "😊", label: "Tranquilo", color: "from-[#6BBF7A] to-[#ead8f2]" },
      { emoji: "😌", label: "Calmo", color: "from-[#7DD3FC] to-[#ead8f2]" },
      { emoji: "😐", label: "Neutro", color: "from-[#E5E7EB] to-[#ead8f2]" },
      { emoji: "😔", label: "Baixo", color: "from-[#A78BFA] to-[#ead8f2]" },
      { emoji: "😰", label: "Ansioso", color: "from-[#F9A8D4] to-[#ead8f2]" }
    ]

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F5] to-[#F5F3FF] p-6">
        <div className="max-w-md mx-auto space-y-6">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-[#9CA3AF] font-light flex items-center gap-2"
          >
            ← Voltar
          </button>

          <div className="text-center space-y-2 py-8">
            <h1 className="text-3xl font-light text-[#6B7280]">Como Você Está Se Sentindo?</h1>
            <p className="text-lg font-light text-[#9CA3AF]">Suas emoções são válidas</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {moods.map((mood, i) => (
              <button 
                key={i}
                onClick={() => setSelectedMood(mood.label)}
                className={`aspect-square bg-gradient-to-br ${mood.color} rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center space-y-2 ${selectedMood === mood.label ? 'ring-4 ring-[#A78BFA]/50 scale-105' : ''}`}
              >
                <span className="text-4xl">{mood.emoji}</span>
                <span className="text-sm font-light text-[#6B7280]">{mood.label}</span>
              </button>
            ))}
          </div>

          {selectedMood && (
            <button 
              onClick={() => setCurrentScreen('home')}
              className="w-full py-4 bg-gradient-to-r from-[#A78BFA] to-[#ead8f2] text-white rounded-full font-light text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Salvar Check-in
            </button>
          )}
        </div>
      </div>
    )
  }

  // Progress Screen
  if (currentScreen === 'progress') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF] to-[#FFF8F5] p-6 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2 py-4">
            <h1 className="text-3xl font-light text-[#6B7280]">Sua Jornada</h1>
            <p className="text-lg font-light text-[#9CA3AF]">Progresso bonito</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-[#A78BFA]/20 to-[#ead8f2]/20 rounded-3xl p-6 space-y-2">
              <p className="text-sm font-light text-[#9CA3AF]">Esta Semana</p>
              <p className="text-4xl font-light text-[#6B7280]">12</p>
              <p className="text-xs font-light text-[#9CA3AF]">Sessões</p>
            </div>
            <div className="bg-gradient-to-br from-[#7DD3FC]/20 to-[#ead8f2]/20 rounded-3xl p-6 space-y-2">
              <p className="text-sm font-light text-[#9CA3AF]">Sequência</p>
              <p className="text-4xl font-light text-[#6B7280]">7</p>
              <p className="text-xs font-light text-[#9CA3AF]">Dias</p>
            </div>
          </div>

          {/* Mood Trend */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg space-y-4">
            <h3 className="text-lg font-light text-[#6B7280]">Tendência de Humor</h3>
            <div className="h-32 flex items-end justify-between gap-2">
              {[40, 60, 45, 70, 55, 80, 75].map((height, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-[#A78BFA] to-[#ead8f2] rounded-t-lg" style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="flex justify-between text-xs font-light text-[#9CA3AF]">
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg space-y-3">
            <h3 className="text-lg font-light text-[#6B7280]">Insights</h3>
            <div className="space-y-2">
              <InsightItem text="Você está mais calmo pela manhã" />
              <InsightItem text="Exercícios de respiração ajudam você mais" />
              <InsightItem text="Sequência de 7 dias! Continue assim 🌟" />
            </div>
          </div>
        </div>

        <BottomNav current="progress" onChange={setCurrentScreen} />
      </div>
    )
  }

  // Settings Screen
  if (currentScreen === 'settings') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF] to-[#FFF8F5] p-6 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-[#9CA3AF] font-light flex items-center gap-2"
          >
            ← Voltar
          </button>

          <div className="text-center space-y-2 py-4">
            <h1 className="text-3xl font-light text-[#6B7280]">Configurações</h1>
            <p className="text-lg font-light text-[#9CA3AF]">Personalize sua experiência</p>
          </div>

          {/* Customization Quick Access */}
          <button 
            onClick={() => setCurrentScreen('customize')}
            className="w-full bg-gradient-to-br from-[#A78BFA]/20 to-[#F9A8D4]/20 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#A78BFA] to-[#ead8f2] rounded-2xl flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-light text-[#6B7280]">Personalização</h3>
              <p className="text-sm font-light text-[#9CA3AF]">Ajuste sua experiência</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#9CA3AF]" strokeWidth={1.5} />
          </button>

          <div className="space-y-4">
            <SettingsSection title="Preferências">
              <SettingsItem label="Lembretes Diários" />
              <SettingsItem label="Efeitos Sonoros" />
              <SettingsItem label="Feedback Tátil" />
            </SettingsSection>

            <SettingsSection title="Conta">
              <SettingsItem label="Perfil" hasArrow />
              <SettingsItem label="Assinatura" hasArrow />
              <SettingsItem label="Privacidade" hasArrow />
            </SettingsSection>

            <SettingsSection title="Suporte">
              <SettingsItem label="Central de Ajuda" hasArrow />
              <SettingsItem label="Contate-nos" hasArrow />
              <SettingsItem label="Avalie o Calmee" hasArrow />
            </SettingsSection>
          </div>

          <div className="text-center pt-8">
            <p className="text-sm font-light text-[#9CA3AF]">Versão 1.0.0</p>
            <p className="text-xs font-light text-[#9CA3AF] mt-1">Feito com carinho 💜</p>
          </div>
        </div>

        <BottomNav current="settings" onChange={setCurrentScreen} />
      </div>
    )
  }

  // Customize Screen
  if (currentScreen === 'customize') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F5] to-[#F5F3FF] p-6 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          <button 
            onClick={() => setCurrentScreen('settings')}
            className="text-[#9CA3AF] font-light flex items-center gap-2"
          >
            ← Voltar
          </button>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-light text-[#6B7280]">Personalização</h1>
            <p className="text-lg font-light text-[#9CA3AF]">Ajuste sua experiência</p>
          </div>

          <div className="space-y-4">
            {/* Theme Selection */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg space-y-4">
              <h3 className="text-lg font-light text-[#6B7280]">Tema</h3>
              <div className="grid grid-cols-3 gap-3">
                {['light', 'dark', 'auto'].map((theme) => (
                  <button 
                    key={theme}
                    onClick={() => setPreferences({...preferences, theme: theme as any})}
                    className={`py-3 rounded-2xl font-light text-sm transition-all duration-300 ${
                      preferences.theme === theme
                        ? 'bg-gradient-to-r from-[#A78BFA] to-[#ead8f2] text-white shadow-lg'
                        : 'bg-white/50 text-[#9CA3AF]'
                    }`}
                  >
                    {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Auto'}
                  </button>
                ))}
              </div>
            </div>

            {/* Breathing Duration */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-light text-[#6B7280]">Duração da Respiração</h3>
                <span className="text-2xl font-light text-[#A78BFA]">{preferences.breathingDuration}s</span>
              </div>
              <input 
                type="range"
                min="3"
                max="8"
                value={preferences.breathingDuration}
                onChange={(e) => setPreferences({...preferences, breathingDuration: parseInt(e.target.value)})}
                className="w-full"
              />
              <div className="flex justify-between text-xs font-light text-[#9CA3AF]">
                <span>3s</span>
                <span>8s</span>
              </div>
            </div>

            {/* Reminder Time */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg space-y-4">
              <h3 className="text-lg font-light text-[#6B7280]">Horário do Lembrete</h3>
              <input 
                type="time"
                value={preferences.reminderTime}
                onChange={(e) => setPreferences({...preferences, reminderTime: e.target.value})}
                className="w-full bg-white/50 rounded-2xl p-4 text-[#6B7280] font-light focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/50"
              />
            </div>

            {/* Toggle Options */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg space-y-3">
              <h3 className="text-lg font-light text-[#6B7280] mb-4">Opções</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-light text-[#6B7280]">Lembretes Diários</span>
                  <button 
                    onClick={() => setPreferences({...preferences, dailyReminders: !preferences.dailyReminders})}
                    className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${
                      preferences.dailyReminders ? 'bg-[#A78BFA]' : 'bg-[#E5E7EB]'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                      preferences.dailyReminders ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-light text-[#6B7280]">Efeitos Sonoros</span>
                  <button 
                    onClick={() => setPreferences({...preferences, soundEffects: !preferences.soundEffects})}
                    className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${
                      preferences.soundEffects ? 'bg-[#A78BFA]' : 'bg-[#E5E7EB]'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                      preferences.soundEffects ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-light text-[#6B7280]">Feedback Tátil</span>
                  <button 
                    onClick={() => setPreferences({...preferences, hapticFeedback: !preferences.hapticFeedback})}
                    className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${
                      preferences.hapticFeedback ? 'bg-[#A78BFA]' : 'bg-[#E5E7EB]'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                      preferences.hapticFeedback ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setCurrentScreen('settings')}
              className="w-full py-4 bg-gradient-to-r from-[#A78BFA] to-[#ead8f2] text-white rounded-full font-light text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Salvar Preferências
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// Helper Components
function ToolCard({ icon, title, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`bg-gradient-to-br ${color} rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center space-y-3 aspect-square`}
    >
      <div className="text-white">{icon}</div>
      <span className="text-white font-light text-base">{title}</span>
    </button>
  )
}

function FeatureCard({ icon, title, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`bg-gradient-to-br ${color} rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center space-y-3 aspect-square`}
    >
      <div className="text-white">{icon}</div>
      <span className="text-white font-light text-base">{title}</span>
    </button>
  )
}

function SOSCard({ icon, title, subtitle, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-4"
    >
      <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
        <div className="text-white">{icon}</div>
      </div>
      <div className="flex-1 text-left">
        <h3 className="text-lg font-light text-[#6B7280]">{title}</h3>
        <p className="text-sm font-light text-[#9CA3AF]">{subtitle}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-[#9CA3AF]" strokeWidth={1.5} />
    </button>
  )
}

function CommunityPostCard({ post }: any) {
  const [likes, setLikes] = useState(post.likes || 0)
  const [liked, setLiked] = useState(false)

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#A78BFA] to-[#ead8f2] rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-light text-sm">{post.userName[0]}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-light text-[#6B7280]">{post.userName}</span>
            <span className="text-xs font-light text-[#9CA3AF]">• há 2h</span>
          </div>
          <p className="text-sm font-light text-[#6B7280] leading-relaxed">{post.content}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 pt-2 border-t border-[#E5E7EB]/50">
        <button 
          onClick={() => {
            setLiked(!liked)
            setLikes(liked ? likes - 1 : likes + 1)
          }}
          className="flex items-center gap-2 text-sm font-light text-[#9CA3AF] hover:text-[#A78BFA] transition-colors"
        >
          <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-[#A78BFA] text-[#A78BFA]' : ''}`} strokeWidth={1.5} />
          <span>{likes}</span>
        </button>
        <button className="flex items-center gap-2 text-sm font-light text-[#9CA3AF] hover:text-[#A78BFA] transition-colors">
          <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
          <span>{post.comments || 0}</span>
        </button>
      </div>
    </div>
  )
}

function JournalEntryCard({ entry, onEdit, onDelete }: any) {
  const moodEmojis: any = {
    peaceful: '😊',
    calm: '😌',
    neutral: '😐',
    low: '😔',
    anxious: '😰'
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{moodEmojis[entry.mood]}</span>
            <h3 className="text-lg font-light text-[#6B7280]">{entry.title}</h3>
          </div>
          <p className="text-sm font-light text-[#9CA3AF] leading-relaxed">{entry.content}</p>
          <p className="text-xs font-light text-[#9CA3AF] mt-2">
            {new Date(entry.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(entry.id)}
            className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center hover:bg-[#A78BFA]/20 transition-colors"
          >
            <Edit3 className="w-4 h-4 text-[#A78BFA]" strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => onDelete(entry.id)}
            className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
          >
            <X className="w-4 h-4 text-red-400" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

function InsightItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-6 h-6 bg-gradient-to-br from-[#A78BFA] to-[#ead8f2] rounded-full flex items-center justify-center flex-shrink-0">
        <Check className="w-4 h-4 text-white" strokeWidth={2} />
      </div>
      <p className="text-sm font-light text-[#6B7280]">{text}</p>
    </div>
  )
}

function SettingsSection({ title, children }: any) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg space-y-3">
      <h3 className="text-lg font-light text-[#6B7280] mb-4">{title}</h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

function SettingsItem({ label, hasArrow = false }: any) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-light text-[#6B7280]">{label}</span>
      {hasArrow ? (
        <ChevronRight className="w-5 h-5 text-[#9CA3AF]" strokeWidth={1.5} />
      ) : (
        <div className="w-11 h-6 bg-[#A78BFA] rounded-full relative">
          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
        </div>
      )}
    </div>
  )
}

function BottomNav({ current, onChange }: { current: string, onChange: (screen: Screen) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-[#E5E7EB]/50 px-6 py-4">
      <div className="max-w-md mx-auto flex justify-around items-center">
        <NavItem 
          icon={<Waves strokeWidth={2} />} 
          label="Início" 
          active={current === 'home'}
          onClick={() => onChange('home')}
        />
        <NavItem 
          icon={<Users strokeWidth={2} />} 
          label="Comunidade" 
          active={current === 'community'}
          onClick={() => onChange('community')}
        />
        <NavItem 
          icon={<BookOpen strokeWidth={2} />} 
          label="Diário" 
          active={current === 'journal'}
          onClick={() => onChange('journal')}
        />
        <NavItem 
          icon={<TrendingUp strokeWidth={2} />} 
          label="Progresso" 
          active={current === 'progress'}
          onClick={() => onChange('progress')}
        />
        <NavItem 
          icon={<Settings strokeWidth={2} />} 
          label="Ajustes" 
          active={current === 'settings'}
          onClick={() => onChange('settings')}
        />
      </div>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-[#A78BFA]' : 'text-[#9CA3AF]'}`}
    >
      <div className="w-6 h-6">{icon}</div>
      <span className="text-xs font-light">{label}</span>
    </button>
  )
}
