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
    
    // 检查基础支持 - 只要有 speechSynthesis API 就显示按钮
    // 移动设备上即使语音列表为空也可能支持（需要用户交互后加载）
    const hasBasicSupport = 'speechSynthesis' in window
    
    if (hasBasicSupport) {
      // 立即显示按钮，不等待语音列表加载
      setIsSupported(true)
      console.log('✅ 语音功能已启用')
      
      // 异步尝试加载语音服务（不影响按钮显示）
      const checkVoiceSupport = () => {
        try {
          const voiceService = getVoiceService()
          const voices = voiceService.getVoices()
          console.log('可用语音数量:', voices.length)
        } catch (error) {
          console.warn('语音服务初始化失败:', error)
          // 即使初始化失败，也保持按钮显示，让用户尝试
        }
      }
      
      // 延迟检查（移动设备可能需要更长时间加载语音列表）
      setTimeout(checkVoiceSupport, 100)
      setTimeout(checkVoiceSupport, 500)
      setTimeout(checkVoiceSupport, 2000)
      
      // 监听语音列表变化事件
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = checkVoiceSupport
      }
      
      return () => {
        if (window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = null
        }
      }
    } else {
      setIsSupported(false)
      console.log('❌ 浏览器不支持语音合成')
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
