'use client'

import { Reminder, TimeSlot } from '@/lib/types'
import { Clock, Pill, Stethoscope, TestTube, AlertCircle } from 'lucide-react'
import { VoiceButton } from './VoiceButton'

interface ReminderCardProps {
  reminder: Reminder
  currentTime: string
}

const typeIcons = {
  medication: Pill,
  checkup: Stethoscope,
  test: TestTube,
  other: AlertCircle,
}

const typeLabels = {
  medication: '用药',
  checkup: '检查',
  test: '化验',
  other: '其他',
}

export function ReminderCard({ reminder, currentTime }: ReminderCardProps) {
  const Icon = typeIcons[reminder.type] || AlertCircle
  const typeLabel = typeLabels[reminder.type] || '其他'

  // 获取时间状态
  const getTimeStatus = (): {
    status: 'past' | 'upcoming' | 'active' | 'normal'
    nearestSlot: TimeSlot | null
    nearestMinutes: number
    currentMinutes: number
  } => {
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    // 找到最近的时间点
    let nearestSlot: TimeSlot | null = null
    let nearestMinutes = Infinity
    let status: 'past' | 'upcoming' | 'active' | 'normal' = 'normal'

    reminder.time_slots.forEach((slot) => {
      const [hour, minute] = slot.time.split(':').map(Number)
      const slotMinutes = hour * 60 + minute
      const diff = slotMinutes - currentMinutes

      // 找到最近的时间点
      if (Math.abs(diff) < Math.abs(nearestMinutes - currentMinutes)) {
        nearestMinutes = slotMinutes
        nearestSlot = slot
      }

      // 判断状态
      if (Math.abs(diff) <= 15) {
        // 当前时间 ±15 分钟内
        status = 'active'
      } else if (diff > 0 && diff <= 30) {
        // 未来 30 分钟内
        if (status !== 'active') {
          status = 'upcoming'
        }
      } else if (diff < 0 && Math.abs(diff) <= 30) {
        // 过去 30 分钟内
        if (status === 'normal') {
          status = 'past'
        }
      }
    })

    return { 
      status: status as 'past' | 'upcoming' | 'active' | 'normal',
      nearestSlot, 
      nearestMinutes, 
      currentMinutes 
    }
  }

  const { status, nearestSlot } = getTimeStatus()
  const isActive = status === 'active'
  const isUpcoming = status === 'upcoming'
  const isPast = status === 'past'

  // 根据状态确定样式
  const getCardStyle = () => {
    if (isActive) {
      return 'bg-primary text-primary-foreground border-primary shadow-lg ring-4 ring-primary/30'
    } else if (isUpcoming) {
      return 'bg-accent text-accent-foreground border-accent shadow-md ring-2 ring-accent/50 animate-pulse'
    } else if (isPast) {
      return 'bg-muted text-muted-foreground border-muted-foreground/30 opacity-60'
    }
    return 'bg-card text-card-foreground border-border'
  }

  // 根据状态确定时间样式
  const getTimeStyle = () => {
    if (isActive) {
      return 'text-primary-foreground'
    } else if (isUpcoming) {
      return 'text-accent-foreground'
    } else if (isPast) {
      return 'text-muted-foreground line-through'
    }
    return 'text-primary'
  }

  return (
    <div
      className={`rounded-xl p-4 border-2 transition-all duration-300 ${getCardStyle()}`}
      role="article"
      aria-label={`提醒: ${reminder.title}`}
    >
      <div className="flex items-center gap-4">
        {/* 时间显示 - 强化 */}
        <div className={`flex-shrink-0 text-center min-w-[100px] ${getTimeStyle()}`}>
          {nearestSlot && (
            <>
              <div className={`text-3xl font-bold leading-tight ${getTimeStyle()}`}>
                {nearestSlot.time}
              </div>
              {reminder.time_slots.length > 1 && (
                <div className="text-xs mt-1 opacity-70">
                  +{reminder.time_slots.length - 1}个
                </div>
              )}
              {/* 状态标签 */}
              {isActive && (
                <div className="text-xs mt-1 font-bold animate-pulse">现在</div>
              )}
              {isUpcoming && (
                <div className="text-xs mt-1 font-bold">即将</div>
              )}
              {isPast && (
                <div className="text-xs mt-1">已过</div>
              )}
            </>
          )}
        </div>

        {/* 图标 */}
        <div
          className={`flex-shrink-0 p-2 rounded-lg ${
            isActive
              ? 'bg-primary-foreground/20'
              : isUpcoming
              ? 'bg-accent-foreground/20'
              : isPast
              ? 'bg-muted-foreground/20'
              : 'bg-muted'
          }`}
        >
          <Icon
            className={`w-6 h-6 ${
              isActive
                ? 'text-primary-foreground'
                : isUpcoming
                ? 'text-accent-foreground'
                : isPast
                ? 'text-muted-foreground'
                : 'text-primary'
            }`}
          />
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${
                isActive
                  ? 'bg-primary-foreground/20'
                  : isUpcoming
                  ? 'bg-accent-foreground/20'
                  : isPast
                  ? 'bg-muted-foreground/20'
                  : 'bg-muted'
              }`}
            >
              {typeLabel}
            </span>
            {isUpcoming && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent-foreground/30 animate-pulse">
                即将到来
              </span>
            )}
            {isPast && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted-foreground/30">
                已过期
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold flex-1">{reminder.title}</h3>
            {nearestSlot && (
              <VoiceButton
                text={`现在是${nearestSlot.time}，${typeLabel}提醒：${reminder.title}${reminder.description ? `。${reminder.description}` : ''}`}
                size="md"
                className="flex-shrink-0"
              />
            )}
          </div>
          {reminder.description && (
            <p className="text-sm opacity-80 line-clamp-1">{reminder.description}</p>
          )}
          {/* 所有时间点 */}
          {reminder.time_slots.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {reminder.time_slots.slice(1).map((slot, index) => (
                <div key={index} className="flex items-center gap-1 text-sm opacity-80">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium">{slot.time}</span>
                  {slot.label && (
                    <span className="text-xs">({slot.label})</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
