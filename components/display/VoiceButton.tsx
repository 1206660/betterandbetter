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
  const [isSupported, setIsSupported] = useState(true) // 默认显示，让用户尝试

  useEffect(() => {
    // 确保只在客户端检查
    if (typeof window === 'undefined') {
      console.log('[VoiceButton] 服务器端渲染，跳过检查')
      return
    }
    
    console.log('[VoiceButton] 开始检查语音支持...')
    console.log('[VoiceButton] window.speechSynthesis:', typeof window.speechSynthesis)
    console.log('[VoiceButton] navigator.userAgent:', navigator.userAgent)
    
    // 检查基础支持 - 只要有 speechSynthesis API 就显示按钮
    // 移动设备上即使语音列表为空也可能支持（需要用户交互后加载）
    const hasBasicSupport = 'speechSynthesis' in window
    
    console.log('[VoiceButton] hasBasicSupport:', hasBasicSupport)
    
    if (hasBasicSupport) {
      // 立即显示按钮，不等待语音列表加载
      setIsSupported(true)
      console.log('[VoiceButton] ✅ 语音功能已启用，按钮将显示')
      
      // 异步尝试加载语音服务（不影响按钮显示）
      const checkVoiceSupport = () => {
        try {
          const voiceService = getVoiceService()
          const voices = voiceService.getVoices()
          console.log('[VoiceButton] 可用语音数量:', voices.length)
          if (voices.length > 0) {
            console.log('[VoiceButton] 语音列表:', voices.map(v => v.name).slice(0, 3))
          }
        } catch (error) {
          console.warn('[VoiceButton] 语音服务初始化失败:', error)
          // 即使初始化失败，也保持按钮显示，让用户尝试
        }
      }
      
      // 延迟检查（移动设备可能需要更长时间加载语音列表）
      setTimeout(checkVoiceSupport, 100)
      setTimeout(checkVoiceSupport, 500)
      setTimeout(checkVoiceSupport, 2000)
      
      // 监听语音列表变化事件
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
          console.log('[VoiceButton] 语音列表已更新')
          checkVoiceSupport()
        }
      }
      
      return () => {
        if (window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = null
        }
      }
    } else {
      console.log('[VoiceButton] ❌ 浏览器不支持语音合成，但按钮仍会显示让用户尝试')
      // 即使不支持也显示按钮，点击时会提示
      setIsSupported(true)
    }
  }, [])

  const handleClick = async () => {
    console.log('[VoiceButton] 点击语音按钮，文本:', text.substring(0, 20))
    
    if (!isSupported) {
      alert('您的浏览器不支持语音播报功能')
      return
    }

    try {
      // 安全地获取语音服务
      let voiceService
      try {
        voiceService = getVoiceService()
      } catch (error: any) {
        console.error('[VoiceButton] 获取语音服务失败:', error)
        alert(`无法初始化语音服务: ${error.message || '未知错误'}`)
        return
      }

      if (!voiceService) {
        alert('语音服务未初始化，请刷新页面重试')
        return
      }

      if (isSpeaking) {
        console.log('[VoiceButton] 停止播报')
        voiceService.stop()
        setIsSpeaking(false)
      } else {
        console.log('[VoiceButton] 开始播报')
        setIsSpeaking(true)
        
        try {
          // 移动设备上，确保语音列表已加载
          const voices = voiceService.getVoices()
          console.log('[VoiceButton] 当前可用语音数量:', voices.length)
          
          if (voices.length === 0) {
            console.log('[VoiceButton] 语音列表为空，等待加载...')
            // 等待一下让语音列表加载
            await new Promise(resolve => setTimeout(resolve, 300))
            // 再次尝试获取
            const voicesAfterWait = voiceService.getVoices()
            console.log('[VoiceButton] 等待后语音数量:', voicesAfterWait.length)
          }
          
          await voiceService.speak(text)
          console.log('[VoiceButton] 播报完成')
        } catch (speakError: any) {
          console.error('[VoiceButton] speak 调用失败:', speakError)
          throw speakError
        } finally {
          setIsSpeaking(false)
        }
      }
    } catch (error: any) {
      console.error('[VoiceButton] 语音播报失败:', error)
      setIsSpeaking(false)
      const errorMsg = error.message || '未知错误'
      alert(`语音播报失败: ${errorMsg}\n\n请检查：\n1. 设备音量是否开启\n2. 浏览器是否允许播放声音\n3. 是否在静音模式下`)
    }
  }

  // 始终显示按钮，让用户尝试（即使不支持也会在点击时提示）
  // if (!isSupported) {
  //   return null
  // }

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
