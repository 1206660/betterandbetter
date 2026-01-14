'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Reminder } from '@/lib/types'
import { ReminderCard } from '@/components/display/ReminderCard'
import { Calendar, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { cacheReminders, getCachedReminders } from '@/lib/offline'
import { getVoiceService } from '@/lib/voice'

export default function DisplayPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }))
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }))
  
  // 语音播报相关
  const spokenRemindersRef = useRef<Set<string>>(new Set()) // 已播报的提醒ID集合
  const voiceServiceRef = useRef<ReturnType<typeof getVoiceService> | null>(null)

  // 初始化语音服务
  useEffect(() => {
    try {
      voiceServiceRef.current = getVoiceService()
    } catch (error) {
      console.warn('语音服务初始化失败:', error)
    }
  }, [])

  // 更新当前时间并检查是否需要自动播报
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        })
      )
      setCurrentDate(
        now.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        })
      )

      // 检查是否需要自动播报
      checkAndSpeakReminders(now)
    }, 1000)

    return () => clearInterval(timer)
  }, [reminders])

  // 检查并播报提醒
  const checkAndSpeakReminders = (now: Date) => {
    if (!voiceServiceRef.current || !voiceServiceRef.current.isSupported()) {
      return
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    reminders.forEach((reminder) => {
      if (!reminder.is_active) return

      reminder.time_slots.forEach((slot) => {
        const [hour, minute] = slot.time.split(':').map(Number)
        const slotMinutes = hour * 60 + minute
        const diff = Math.abs(slotMinutes - currentMinutes)

        // 在提醒时间 ±2 分钟内自动播报（避免重复播报）
        if (diff <= 2) {
          const reminderKey = `${reminder.id}-${slot.time}`
          
          // 如果已经播报过，跳过
          if (spokenRemindersRef.current.has(reminderKey)) {
            return
          }

          // 标记为已播报
          spokenRemindersRef.current.add(reminderKey)

          // 延迟 1 秒后播报，避免页面加载时立即播报
          setTimeout(() => {
            voiceServiceRef.current?.speakReminder(
              reminder.title,
              reminder.type,
              slot.time,
              reminder.description
            ).catch((error) => {
              console.error('自动播报失败:', error)
            })
          }, 1000)

          // 30 分钟后清除标记，允许重新播报
          setTimeout(() => {
            spokenRemindersRef.current.delete(reminderKey)
          }, 30 * 60 * 1000)
        }
      })
    })
  }

  // 获取今日提醒（静默刷新，不显示加载状态）
  const fetchReminders = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
      }
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${today}`)
        .or(`end_date.is.null,end_date.gte.${today}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // 过滤出今日有效的提醒（根据频率）
      const todayReminders = (data || []).filter((reminder) => {
        if (reminder.frequency === 'daily') return true
        return true
      }) as Reminder[]

      // 只在数据真正变化时才更新，避免不必要的重新渲染
      setReminders((prevReminders) => {
        // 比较数据是否真的变化了
        const prevIds = new Set(prevReminders.map((r) => r.id))
        const newIds = new Set(todayReminders.map((r) => r.id))
        
        // 如果 ID 集合相同，检查内容是否有变化
        if (
          prevIds.size === newIds.size &&
          [...prevIds].every((id) => newIds.has(id))
        ) {
          // ID 相同，检查内容是否有变化
          const hasChanges = todayReminders.some((newReminder) => {
            const oldReminder = prevReminders.find((r) => r.id === newReminder.id)
            if (!oldReminder) return true
            // 比较关键字段
            return (
              oldReminder.title !== newReminder.title ||
              oldReminder.is_active !== newReminder.is_active ||
              JSON.stringify(oldReminder.time_slots) !== JSON.stringify(newReminder.time_slots) ||
              oldReminder.updated_at !== newReminder.updated_at
            )
          })
          
          // 如果没有变化，返回旧数据，避免重新渲染
          if (!hasChanges) {
            return prevReminders
          }
        }

        // 有变化，返回新数据
        return todayReminders
      })

      // 缓存到 IndexedDB
      await cacheReminders(todayReminders)
      setIsOnline(true)
    } catch (error) {
      console.error('获取提醒失败:', error)
      // 网络错误时尝试从缓存读取
      setIsOnline(false)
      const cached = await getCachedReminders()
      if (cached.length > 0) {
        setReminders((prevReminders) => {
          // 只在缓存数据不同时才更新
          const prevIds = new Set(prevReminders.map((r) => r.id))
          const cachedIds = new Set(cached.map((r: Reminder) => r.id))
          if (
            prevIds.size === cachedIds.size &&
            [...prevIds].every((id) => cachedIds.has(id))
          ) {
            return prevReminders
          }
          return cached as Reminder[]
        })
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      fetchReminders()
    }
    const handleOffline = () => {
      setIsOnline(false)
      getCachedReminders().then((cached) => {
        if (cached.length > 0) {
          setReminders(cached as Reminder[])
        }
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 初始加载和实时订阅
  useEffect(() => {
    // 先尝试从缓存加载
    getCachedReminders().then((cached) => {
      if (cached.length > 0) {
        setReminders(cached as Reminder[])
        setLoading(false)
      }
    })

    fetchReminders()

    // 订阅实时更新
    const channel = supabase
      .channel('reminders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
        },
        (payload) => {
          console.log('Realtime 事件:', payload.eventType, payload)
          if (navigator.onLine) {
            // 静默刷新，不显示加载状态
            fetchReminders(true)
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime 订阅状态:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✓ Realtime 订阅成功')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('✗ Realtime 订阅失败，将使用轮询方式')
        }
      })

    // 备选方案：如果 Realtime 不工作，使用轮询（静默刷新）
    const pollInterval = setInterval(() => {
      if (navigator.onLine && document.visibilityState === 'visible') {
        // 静默刷新，不显示加载状态，避免闪烁
        fetchReminders(true)
      }
    }, 10000) // 每 10 秒轮询一次

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [])

  // 按时间状态和最近时间排序提醒
  const sortedReminders = [...reminders].sort((a, b) => {
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    // 获取最近的时间点
    const getNearestMinutes = (reminder: Reminder) => {
      let nearest = Infinity
      reminder.time_slots.forEach((slot) => {
        const [hour, minute] = slot.time.split(':').map(Number)
        const slotMinutes = hour * 60 + minute
        const diff = slotMinutes - currentMinutes
        if (Math.abs(diff) < Math.abs(nearest - currentMinutes)) {
          nearest = slotMinutes
        }
      })
      return nearest === Infinity ? 9999 : nearest
    }

    // 获取状态优先级（即将到来 > 当前 > 正常 > 已过期）
    const getStatusPriority = (reminder: Reminder) => {
      let hasActive = false
      let hasUpcoming = false
      let hasPast = false

      reminder.time_slots.forEach((slot) => {
        const [hour, minute] = slot.time.split(':').map(Number)
        const slotMinutes = hour * 60 + minute
        const diff = slotMinutes - currentMinutes

        if (Math.abs(diff) <= 15) hasActive = true
        else if (diff > 0 && diff <= 30) hasUpcoming = true
        else if (diff < 0 && Math.abs(diff) <= 30) hasPast = true
      })

      if (hasActive) return 0 // 最高优先级
      if (hasUpcoming) return 1
      if (hasPast) return 3 // 最低优先级
      return 2 // 正常
    }

    const aPriority = getStatusPriority(a)
    const bPriority = getStatusPriority(b)

    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    // 相同状态时，按最近时间排序
    const aNearest = getNearestMinutes(a)
    const bNearest = getNearestMinutes(b)

    // 对于未来的时间，按时间升序（早的在前）
    // 对于过去的时间，按时间降序（最近的在前）
    if (aNearest >= currentMinutes && bNearest >= currentMinutes) {
      return aNearest - bNearest
    } else if (aNearest < currentMinutes && bNearest < currentMinutes) {
      return bNearest - aNearest
    } else {
      // 一个未来一个过去，未来优先
      return aNearest >= currentMinutes ? -1 : 1
    }
  })

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* 头部 - 紧凑设计，强化时间显示 */}
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-4">
            <Calendar className="w-6 h-6 text-primary flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-muted-foreground mb-1">{currentDate}</div>
              {/* 强化时间显示 */}
              <div className="relative inline-block">
                <div className="text-5xl md:text-6xl font-bold text-primary animate-time-glow leading-none">
                  {currentTime}
                </div>
                {/* 时间背景光效 */}
                <div className="absolute inset-0 bg-primary/20 blur-xl -z-10 animate-pulse rounded-lg"></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-orange-500" />
              )}
              <span className="text-xs text-muted-foreground">
                {isOnline ? '在线' : '离线'}
              </span>
            </div>
            <button
              onClick={() => fetchReminders(false)}
              disabled={!isOnline}
              className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="刷新提醒"
              aria-disabled={!isOnline}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">刷新</span>
            </button>
          </div>
        </div>

        {/* 提醒列表 */}
        {loading && reminders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-2xl text-muted-foreground">加载中...</div>
          </div>
        ) : sortedReminders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-2xl text-muted-foreground mb-2">暂无提醒</div>
            <div className="text-lg text-muted-foreground/70">
              请在管理页面添加提醒
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                currentTime={currentTime}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
