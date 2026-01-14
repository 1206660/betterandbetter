'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Reminder } from '@/lib/types'
import { ReminderCard } from '@/components/display/ReminderCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PreviewPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
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

  // 更新当前时间
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
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 获取提醒
  const fetchReminders = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${today}`)
        .or(`end_date.is.null,end_date.gte.${today}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      const todayReminders = (data || []).filter((reminder) => {
        if (reminder.frequency === 'daily') return true
        return true
      }) as Reminder[]

      setReminders(todayReminders)
    } catch (error) {
      console.error('获取提醒失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 初始加载和实时订阅
  useEffect(() => {
    fetchReminders()

    const channel = supabase
      .channel('preview-reminders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
        },
        () => {
          fetchReminders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const sortedReminders = [...reminders].sort((a, b) => {
    const aFirstTime = a.time_slots[0]?.time || '99:99'
    const bFirstTime = b.time_slots[0]?.time || '99:99'
    return aFirstTime.localeCompare(bFirstTime)
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold">实时预览</h1>
            <p className="text-sm text-muted-foreground">Pad 端显示效果预览</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchReminders}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
            <Link href="/admin">
              <Button variant="outline">返回管理</Button>
            </Link>
            <Link href="/display" target="_blank">
              <Button>打开展示页</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">
          {/* 头部 */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-primary" />
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
                健康提醒
              </h2>
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-muted-foreground mb-2">
              {currentDate}
            </div>
            <div className="text-3xl md:text-4xl font-bold text-primary">
              {currentTime}
            </div>
          </div>

          {/* 提醒列表 */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-2xl text-muted-foreground">加载中...</div>
            </div>
          ) : sortedReminders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-2xl text-muted-foreground mb-2">暂无提醒</div>
                <div className="text-lg text-muted-foreground/70 mb-4">
                  请在管理页面添加提醒
                </div>
                <Link href="/admin/reminders">
                  <Button>去创建提醒</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:gap-8">
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
    </div>
  )
}
