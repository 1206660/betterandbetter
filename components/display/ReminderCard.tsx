'use client'

import { Reminder, TimeSlot } from '@/lib/types'
import { Clock, Pill, Stethoscope, TestTube, AlertCircle } from 'lucide-react'

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

  // 根据状态确定样式 - 白底黑字风格
  const getCardStyle = () => {
    if (isActive) {
      return 'bg-black text-white border-black shadow-lg'
    } else if (isUpcoming) {
      return 'bg-black/20 text-black border-black/40'
    } else if (isPast) {
      return 'bg-white text-black/40 border-black/10 opacity-50'
    }
    return 'bg-white text-black border-black/20'
  }

  // 根据状态确定时间样式
  const getTimeStyle = () => {
    if (isActive) {
      return 'text-white'
    } else if (isUpcoming) {
      return 'text-black'
    } else if (isPast) {
      return 'text-black/40 line-through'
    }
    return 'text-black'
  }

  return (
    <div
      className={`rounded-lg p-4 border-2 transition-all duration-200 ${getCardStyle()}`}
      role="article"
      aria-label={`提醒: ${reminder.title}`}
    >
      <div className="flex items-center gap-4">
        {/* 时间显示 - 放大一倍 */}
        <div className={`flex-shrink-0 text-center min-w-[140px] ${getTimeStyle()}`}>
          {nearestSlot && (
            <>
              <div className={`text-4xl font-bold leading-tight ${getTimeStyle()}`}>
                {nearestSlot.time}
              </div>
              {reminder.time_slots.length > 1 && (
                <div className="text-sm mt-1 opacity-70">
                  +{reminder.time_slots.length - 1}
                </div>
              )}
              {/* 状态标签 */}
              {isActive && (
                <div className="text-sm mt-1 font-bold">现在</div>
              )}
              {isUpcoming && (
                <div className="text-sm mt-1 font-bold">即将</div>
              )}
              {isPast && (
                <div className="text-sm mt-1">已过</div>
              )}
            </>
          )}
        </div>

        {/* 图标 */}
        <div
          className={`flex-shrink-0 p-3 rounded ${
            isActive
              ? 'bg-white/20'
              : isUpcoming
              ? 'bg-black/20'
              : isPast
              ? 'bg-black/10'
              : 'bg-black/10'
          }`}
        >
          <Icon
            className={`w-8 h-8 ${
              isActive
                ? 'text-white'
                : isUpcoming
                ? 'text-black'
                : isPast
                ? 'text-black/40'
                : 'text-black'
            }`}
          />
        </div>

        {/* 内容 - 放大一倍，去掉类型标签 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold leading-tight">{reminder.title}</h3>
          {reminder.description && (
            <p className="text-base opacity-70 line-clamp-1 mt-1">{reminder.description}</p>
          )}
          {/* 所有时间点 - 放大一倍 */}
          {reminder.time_slots.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {reminder.time_slots.slice(1).map((slot, index) => (
                <div key={index} className="flex items-center gap-1 text-sm opacity-70">
                  <Clock className="w-5 h-5" />
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
