'use client'

import { useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { getVoiceService } from '@/lib/voice'

interface VoiceButtonProps {
  text: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function VoiceButton({ text, className = '', size = 'md' }: VoiceButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // 确保只在客户端检查
    if (typeof window === 'undefined') {
      setIsSupported(false)
      return
    }
    
    // 检查基础支持
    const hasBasicSupport = 'speechSynthesis' in window
    
    if (!hasBasicSupport) {
      setIsSupported(false)
      return
    }
    
    // 移动设备上，语音列表可能需要延迟加载
    // 先设置为支持，然后尝试加载语音服务
    setIsSupported(true)
    
    // 延迟检查，等待语音列表加载（移动设备可能需要更长时间）
    const checkVoiceSupport = () => {
      try {
        const voiceService = getVoiceService()
        // 即使语音列表为空，也显示按钮（某些移动浏览器需要用户交互后才加载语音）
        // 用户点击时会尝试播放，如果失败会显示提示
        const voices = voiceService.getVoices()
        console.log('可用语音数量:', voices.length)
        // 在移动设备上，即使没有语音也显示按钮，让用户尝试
        setIsSupported(true)
      } catch (error) {
        console.warn('语音服务初始化失败:', error)
        // 即使初始化失败，如果浏览器支持 speechSynthesis，也显示按钮
        setIsSupported(hasBasicSupport)
      }
    }
    
    // 立即检查
    checkVoiceSupport()
    
    // 延迟检查（移动设备可能需要更长时间加载语音列表）
    const timer1 = setTimeout(checkVoiceSupport, 500)
    const timer2 = setTimeout(checkVoiceSupport, 2000)
    
    // 监听语音列表变化事件
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = checkVoiceSupport
    }
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  const handleClick = async () => {
    if (!isSupported) {
      alert('您的浏览器不支持语音播报功能')
      return
    }

    try {
      const voiceService = getVoiceService()

      if (isSpeaking) {
        voiceService.stop()
        setIsSpeaking(false)
      } else {
        setIsSpeaking(true)
        await voiceService.speak(text)
        setIsSpeaking(false)
      }
    } catch (error) {
      console.error('语音播报失败:', error)
      setIsSpeaking(false)
    }
  }

  if (!isSupported) {
    return null
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        isSpeaking
          ? 'bg-primary text-primary-foreground animate-pulse'
          : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
      } ${className}`}
      aria-label={isSpeaking ? '停止播报' : '语音播报'}
      aria-pressed={isSpeaking}
    >
      {isSpeaking ? (
        <VolumeX className={iconSizes[size]} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
    </button>
  )
}
