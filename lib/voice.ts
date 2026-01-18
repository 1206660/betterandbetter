/**
 * 语音播报服务
 * 使用 Web Speech API 实现文本转语音功能
 */

export interface VoiceOptions {
  rate?: number // 语速 0.1-10，默认 1
  pitch?: number // 音调 0-2，默认 1
  volume?: number // 音量 0-1，默认 1
  lang?: string // 语言代码，默认 'zh-CN'
  voice?: SpeechSynthesisVoice // 语音对象
}

export class VoiceService {
  private synth: SpeechSynthesis
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private isSpeaking = false
  private voices: SpeechSynthesisVoice[] = []

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('VoiceService 只能在浏览器环境中使用')
    }
    this.synth = window.speechSynthesis

    // 加载可用语音列表
    this.loadVoices()

    // 某些浏览器需要延迟加载语音
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.loadVoices()
      }
    }
  }

  /**
   * 加载可用语音列表
   */
  private loadVoices(): void {
    this.voices = this.synth.getVoices()
  }

  /**
   * 检查浏览器是否支持语音合成
   */
  isSupported(): boolean {
    if (typeof window === 'undefined') {
      return false
    }
    // 基础检查：是否存在 speechSynthesis API
    const hasAPI = 'speechSynthesis' in window
    if (!hasAPI) {
      return false
    }
    // 移动设备上，即使语音列表为空也可能支持（需要用户交互后加载）
    // 所以只要有 API 就返回 true
    return true
  }

  /**
   * 获取可用的语音列表
   */
  getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0) {
      this.loadVoices()
    }
    return this.voices
  }

  /**
   * 获取中文语音（优先选择）
   */
  getChineseVoice(): SpeechSynthesisVoice | undefined {
    const voices = this.getVoices()
    // 优先选择中文语音
    return (
      voices.find((v) => v.lang.startsWith('zh-CN') && v.name.includes('Chinese')) ||
      voices.find((v) => v.lang.startsWith('zh-CN')) ||
      voices.find((v) => v.lang.includes('zh'))
    )
  }

  /**
   * 播报文本
   */
  speak(text: string, options?: VoiceOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('浏览器不支持语音合成'))
        return
      }

      // 停止当前播报
      this.stop()

      const utterance = new SpeechSynthesisUtterance(text)

      // 设置默认选项
      utterance.rate = options?.rate ?? 1
      utterance.pitch = options?.pitch ?? 1
      utterance.volume = options?.volume ?? 1
      utterance.lang = options?.lang ?? 'zh-CN'

      // 优先使用中文语音
      if (!options?.voice) {
        const chineseVoice = this.getChineseVoice()
        if (chineseVoice) {
          utterance.voice = chineseVoice
        }
      } else {
        utterance.voice = options.voice
      }

      // 播报完成回调
      utterance.onend = () => {
        this.isSpeaking = false
        this.currentUtterance = null
        resolve()
      }

      // 播报错误回调
      utterance.onerror = (event) => {
        this.isSpeaking = false
        this.currentUtterance = null
        reject(new Error(`语音播报失败: ${event.error}`))
      }

      this.currentUtterance = utterance
      this.isSpeaking = true
      this.synth.speak(utterance)
    })
  }

  /**
   * 停止播报
   */
  stop(): void {
    if (this.synth.speaking) {
      this.synth.cancel()
    }
    this.isSpeaking = false
    this.currentUtterance = null
  }

  /**
   * 检查是否正在播报
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking
  }

  /**
   * 播报提醒内容
   */
  speakReminder(
    title: string,
    type: string,
    time: string,
    description?: string
  ): Promise<void> {
    const typeLabels: Record<string, string> = {
      medication: '用药',
      checkup: '检查',
      test: '化验',
      other: '其他',
    }

    const typeLabel = typeLabels[type] || '提醒'
    let text = `现在是${time}，${typeLabel}提醒：${title}`

    if (description) {
      text += `。${description}`
    }

    return this.speak(text, {
      rate: 0.9, // 稍微慢一点，方便老人听清楚
      pitch: 1,
      volume: 1,
    })
  }
}

// 单例实例
let voiceServiceInstance: VoiceService | null = null

/**
 * 获取语音服务单例
 */
export function getVoiceService(): VoiceService {
  if (!voiceServiceInstance) {
    voiceServiceInstance = new VoiceService()
  }
  return voiceServiceInstance
}
