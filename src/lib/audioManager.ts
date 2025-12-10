/**
 * Audio Manager - Sistema de gerenciamento de áudio para Calmee
 * 
 * Funcionalidades:
 * - Play/Pause/Stop para cada som
 * - Loop para tracks de ambiente
 * - Controle de volume individual e global
 * - Crossfade suave entre faixas
 * - Preload inteligente
 * - Compatibilidade mobile (iOS Safari e Android Chrome)
 * - Fallback MP3/OGG
 */

export type AudioKey = 
  | 'ambiente_rain' 
  | 'ambiente_wind' 
  | 'ambiente_ocean'
  | 'ambiente_piano'
  | 'ambiente_birds'
  | 'ambiente_water'
  | 'ambiente_fireplace'
  | 'ambiente_bowl'
  | 'ambiente_whitenoise'
  | 'ambiente_underwater'
  | 'medit_30s' 
  | 'medit_60s'
  | 'medit_90s'
  | 'medit_crise'
  | 'medit_dormir'
  | 'medit_ansiedade'
  | 'medit_profunda'
  | 'medit_ambiente'
  | 'sleep_story'

export interface AudioConfig {
  key: AudioKey
  src: string
  fallbackSrc?: string
  loop?: boolean
  preload?: 'auto' | 'metadata' | 'none'
  volume?: number
}

export interface AudioState {
  isPlaying: boolean
  isPaused: boolean
  volume: number
  currentTime: number
  duration: number
}

class AudioManager {
  private audioElements: Map<AudioKey, HTMLAudioElement> = new Map()
  private audioConfigs: Map<AudioKey, AudioConfig> = new Map()
  private globalVolume: number = 1.0
  private currentlyPlaying: AudioKey | null = null
  private fadeIntervals: Map<AudioKey, number> = new Map()
  private userInteracted: boolean = false

  /**
   * Inicializa o AudioManager com as configurações de áudio
   */
  constructor() {
    // Detectar primeiro gesto do usuário (necessário para mobile)
    if (typeof window !== 'undefined') {
      const enableAudio = () => {
        this.userInteracted = true
        document.removeEventListener('click', enableAudio)
        document.removeEventListener('touchstart', enableAudio)
      }
      document.addEventListener('click', enableAudio)
      document.addEventListener('touchstart', enableAudio)
    }
  }

  /**
   * Registra uma configuração de áudio
   */
  register(config: AudioConfig): void {
    this.audioConfigs.set(config.key, config)
    
    // Criar elemento de áudio
    if (typeof window !== 'undefined') {
      const audio = new Audio()
      audio.preload = config.preload || 'metadata'
      audio.loop = config.loop || false
      audio.volume = (config.volume || 1.0) * this.globalVolume
      
      // Tentar carregar fonte principal
      audio.src = config.src
      
      // Fallback para formato alternativo
      if (config.fallbackSrc) {
        audio.addEventListener('error', () => {
          console.warn(`Falha ao carregar ${config.src}, tentando fallback...`)
          audio.src = config.fallbackSrc!
        })
      }
      
      this.audioElements.set(config.key, audio)
    }
  }

  /**
   * Registra múltiplas configurações de áudio
   */
  registerMultiple(configs: AudioConfig[]): void {
    configs.forEach(config => this.register(config))
  }

  /**
   * Reproduz um áudio
   */
  async play(key: AudioKey): Promise<void> {
    if (!this.userInteracted) {
      console.warn('Áudio bloqueado: aguardando interação do usuário')
      return
    }

    const audio = this.audioElements.get(key)
    if (!audio) {
      console.error(`Áudio não encontrado: ${key}`)
      return
    }

    try {
      // Pausar áudio anterior se existir
      if (this.currentlyPlaying && this.currentlyPlaying !== key) {
        await this.stop(this.currentlyPlaying)
      }

      await audio.play()
      this.currentlyPlaying = key
    } catch (error) {
      console.error(`Erro ao reproduzir áudio ${key}:`, error)
    }
  }

  /**
   * Pausa um áudio
   */
  pause(key: AudioKey): void {
    const audio = this.audioElements.get(key)
    if (audio) {
      audio.pause()
      if (this.currentlyPlaying === key) {
        this.currentlyPlaying = null
      }
    }
  }

  /**
   * Para um áudio e reseta para o início
   */
  stop(key: AudioKey): void {
    const audio = this.audioElements.get(key)
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      if (this.currentlyPlaying === key) {
        this.currentlyPlaying = null
      }
    }
  }

  /**
   * Para todos os áudios
   */
  stopAll(): void {
    this.audioElements.forEach((audio, key) => {
      this.stop(key)
    })
  }

  /**
   * Define o volume de um áudio específico (0.0 a 1.0)
   */
  setVolume(key: AudioKey, volume: number): void {
    const audio = this.audioElements.get(key)
    if (audio) {
      const clampedVolume = Math.max(0, Math.min(1, volume))
      audio.volume = clampedVolume * this.globalVolume
      
      // Atualizar config
      const config = this.audioConfigs.get(key)
      if (config) {
        config.volume = clampedVolume
      }
    }
  }

  /**
   * Define o volume global (afeta todos os áudios)
   */
  setGlobalVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    this.globalVolume = clampedVolume
    
    // Atualizar volume de todos os áudios
    this.audioElements.forEach((audio, key) => {
      const config = this.audioConfigs.get(key)
      const localVolume = config?.volume || 1.0
      audio.volume = localVolume * this.globalVolume
    })
  }

  /**
   * Obtém o volume global
   */
  getGlobalVolume(): number {
    return this.globalVolume
  }

  /**
   * Obtém o volume de um áudio específico
   */
  getVolume(key: AudioKey): number {
    const config = this.audioConfigs.get(key)
    return config?.volume || 1.0
  }

  /**
   * Crossfade entre dois áudios
   * @param fromKey - Áudio que está tocando
   * @param toKey - Áudio para o qual fazer fade
   * @param duration - Duração do fade em ms (padrão: 1000ms)
   */
  async fade(fromKey: AudioKey, toKey: AudioKey, duration: number = 1000): Promise<void> {
    const fromAudio = this.audioElements.get(fromKey)
    const toAudio = this.audioElements.get(toKey)
    
    if (!fromAudio || !toAudio) {
      console.error('Áudios não encontrados para crossfade')
      return
    }

    // Cancelar fades anteriores
    this.cancelFade(fromKey)
    this.cancelFade(toKey)

    const fromConfig = this.audioConfigs.get(fromKey)
    const toConfig = this.audioConfigs.get(toKey)
    
    const fromTargetVolume = (fromConfig?.volume || 1.0) * this.globalVolume
    const toTargetVolume = (toConfig?.volume || 1.0) * this.globalVolume
    
    const steps = 60 // 60 steps para animação suave
    const stepDuration = duration / steps
    const fromVolumeStep = fromTargetVolume / steps
    const toVolumeStep = toTargetVolume / steps

    // Iniciar áudio de destino com volume 0
    toAudio.volume = 0
    await toAudio.play()
    this.currentlyPlaying = toKey

    let currentStep = 0

    return new Promise((resolve) => {
      const intervalId = window.setInterval(() => {
        currentStep++

        // Fade out do áudio anterior
        if (fromAudio) {
          fromAudio.volume = Math.max(0, fromTargetVolume - (fromVolumeStep * currentStep))
        }

        // Fade in do novo áudio
        if (toAudio) {
          toAudio.volume = Math.min(toTargetVolume, toVolumeStep * currentStep)
        }

        // Finalizar fade
        if (currentStep >= steps) {
          window.clearInterval(intervalId)
          this.fadeIntervals.delete(fromKey)
          this.fadeIntervals.delete(toKey)
          
          // Parar áudio anterior
          if (fromAudio) {
            fromAudio.pause()
            fromAudio.currentTime = 0
          }
          
          resolve()
        }
      }, stepDuration)

      this.fadeIntervals.set(fromKey, intervalId)
      this.fadeIntervals.set(toKey, intervalId)
    })
  }

  /**
   * Cancela um fade em andamento
   */
  private cancelFade(key: AudioKey): void {
    const intervalId = this.fadeIntervals.get(key)
    if (intervalId) {
      window.clearInterval(intervalId)
      this.fadeIntervals.delete(key)
    }
  }

  /**
   * Obtém o estado atual de um áudio
   */
  getState(key: AudioKey): AudioState | null {
    const audio = this.audioElements.get(key)
    if (!audio) return null

    return {
      isPlaying: !audio.paused && !audio.ended,
      isPaused: audio.paused,
      volume: audio.volume,
      currentTime: audio.currentTime,
      duration: audio.duration || 0
    }
  }

  /**
   * Verifica se um áudio está tocando
   */
  isPlaying(key: AudioKey): boolean {
    const audio = this.audioElements.get(key)
    return audio ? !audio.paused && !audio.ended : false
  }

  /**
   * Obtém a chave do áudio atualmente tocando
   */
  getCurrentlyPlaying(): AudioKey | null {
    return this.currentlyPlaying
  }

  /**
   * Limpa recursos (importante para evitar memory leaks)
   */
  cleanup(): void {
    // Cancelar todos os fades
    this.fadeIntervals.forEach((intervalId) => {
      window.clearInterval(intervalId)
    })
    this.fadeIntervals.clear()

    // Parar e limpar todos os áudios
    this.audioElements.forEach((audio) => {
      audio.pause()
      audio.src = ''
      audio.load()
    })
    
    this.audioElements.clear()
    this.audioConfigs.clear()
    this.currentlyPlaying = null
  }

  /**
   * Descarrega um áudio específico (útil ao sair de telas)
   */
  unload(key: AudioKey): void {
    this.cancelFade(key)
    const audio = this.audioElements.get(key)
    
    if (audio) {
      audio.pause()
      audio.src = ''
      audio.load()
      this.audioElements.delete(key)
    }
    
    this.audioConfigs.delete(key)
    
    if (this.currentlyPlaying === key) {
      this.currentlyPlaying = null
    }
  }
}

// Singleton instance
let audioManagerInstance: AudioManager | null = null

/**
 * Obtém a instância singleton do AudioManager
 */
export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager()
  }
  return audioManagerInstance
}

/**
 * Configurações padrão de áudio para o Calmee
 */
export const defaultAudioConfigs: AudioConfig[] = [
  // Ambientes (loop ativado, preload auto)
  {
    key: 'ambiente_rain',
    src: '/assets/sounds/ambientes/ambiente_rain.mp3',
    fallbackSrc: '/assets/sounds/ambientes/ambiente_rain.ogg',
    loop: true,
    preload: 'auto',
    volume: 0.7
  },
  {
    key: 'ambiente_wind',
    src: '/assets/sounds/ambientes/ambiente_wind.mp3',
    fallbackSrc: '/assets/sounds/ambientes/ambiente_wind.ogg',
    loop: true,
    preload: 'auto',
    volume: 0.7
  },
  {
    key: 'ambiente_ocean',
    src: '/assets/sounds/ambientes/ambiente_ocean.mp3',
    fallbackSrc: '/assets/sounds/ambientes/ambiente_ocean.ogg',
    loop: true,
    preload: 'auto',
    volume: 0.7
  },
  {
    key: 'ambiente_piano',
    src: '/assets/sounds/ambientes/ambiente_piano.mp3',
    fallbackSrc: '/assets/sounds/ambientes/ambiente_piano.ogg',
    loop: true,
    preload: 'auto',
    volume: 0.6
  },
  {
    key: 'ambiente_birds',
    src: '/assets/sounds/ambientes/ambiente_birds.mp3',
    fallbackSrc: '/assets/sounds/ambientes/ambiente_birds.ogg',
    loop: true,
    preload: 'auto',
    volume: 0.7
  },
  {
    key: 'ambiente_water',
    src: '/assets/sounds/ambientes/ambiente_water.mp3',
    fallbackSrc: '/assets/sounds/ambientes/ambiente_water.ogg',
    loop: true,
    preload: 'auto',
    volume: 0.7
  },
  {
    key: 'ambiente_fireplace',
    src: '/assets/sounds/ambientes/ambiente_fireplace.mp3',
    fallbackSrc: '/assets/sounds/ambientes/ambiente_fireplace.ogg',
    loop: true,
    preload: 'auto',
    volume: 0.7
  },
  {
    key: 'ambiente_bowl',
    src: '/assets/sounds/ambientes/ambiente_bowl.mp3',
    fallbackSrc: '/assets/sounds/ambientes/ambiente_bowl.ogg',
    loop: true,
    preload: 'auto',
    volume: 0.7
  },
  {
    key: 'ambiente_whitenoise',
    src: '/assets/sounds/ambientes/ambiente_whitenoise.mp3',
    fallbackSrc: '/assets/sounds/ambientes/ambiente_whitenoise.ogg',
    loop: true,
    preload: 'auto',
    volume: 0.7
  },
  {
    key: 'ambiente_underwater',
    src: '/assets/sounds/ambientes/ambiente_underwater.mp3',
    fallbackSrc: '/assets/sounds/ambientes/ambiente_underwater.ogg',
    loop: true,
    preload: 'auto',
    volume: 0.7
  },
  
  // Meditações (sem loop, preload metadata)
  {
    key: 'medit_crise',
    src: '/assets/sounds/meditacoes/medit_crise.mp3',
    fallbackSrc: '/assets/sounds/meditacoes/medit_crise.ogg',
    loop: false,
    preload: 'metadata',
    volume: 0.8
  },
  {
    key: 'medit_dormir',
    src: '/assets/sounds/meditacoes/medit_dormir.mp3',
    fallbackSrc: '/assets/sounds/meditacoes/medit_dormir.ogg',
    loop: false,
    preload: 'metadata',
    volume: 0.8
  },
  {
    key: 'medit_ansiedade',
    src: '/assets/sounds/meditacoes/medit_ansiedade.mp3',
    fallbackSrc: '/assets/sounds/meditacoes/medit_ansiedade.ogg',
    loop: false,
    preload: 'metadata',
    volume: 0.8
  },
  {
    key: 'medit_profunda',
    src: '/assets/sounds/meditacoes/medit_profunda.mp3',
    fallbackSrc: '/assets/sounds/meditacoes/medit_profunda.ogg',
    loop: false,
    preload: 'metadata',
    volume: 0.8
  },
  {
    key: 'medit_ambiente',
    src: '/assets/sounds/meditacoes/medit_ambiente.mp3',
    fallbackSrc: '/assets/sounds/meditacoes/medit_ambiente.ogg',
    loop: false,
    preload: 'metadata',
    volume: 0.8
  },
  {
    key: 'medit_30s',
    src: '/assets/sounds/meditacoes/medit_30s.mp3',
    fallbackSrc: '/assets/sounds/meditacoes/medit_30s.ogg',
    loop: false,
    preload: 'metadata',
    volume: 0.8
  },
  {
    key: 'medit_60s',
    src: '/assets/sounds/meditacoes/medit_60s.mp3',
    fallbackSrc: '/assets/sounds/meditacoes/medit_60s.ogg',
    loop: false,
    preload: 'metadata',
    volume: 0.8
  },
  {
    key: 'medit_90s',
    src: '/assets/sounds/meditacoes/medit_90s.mp3',
    fallbackSrc: '/assets/sounds/meditacoes/medit_90s.ogg',
    loop: false,
    preload: 'metadata',
    volume: 0.8
  },
  
  // Sleep story (sem loop, preload none - carregamento on-demand)
  {
    key: 'sleep_story',
    src: '/assets/sounds/meditacoes/sleep_story.mp3',
    fallbackSrc: '/assets/sounds/meditacoes/sleep_story.ogg',
    loop: false,
    preload: 'none',
    volume: 0.8
  }
]

export default AudioManager
