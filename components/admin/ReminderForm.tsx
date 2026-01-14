'use client'

import { useState } from 'react'
import { Reminder, ReminderType, ReminderFrequency, TimeSlot } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X, Clock } from 'lucide-react'

interface ReminderFormProps {
  reminder?: Reminder
  onSubmit: (data: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  onCancel?: () => void
}

export function ReminderForm({ reminder, onSubmit, onCancel }: ReminderFormProps) {
  const [title, setTitle] = useState(reminder?.title || '')
  const [type, setType] = useState<ReminderType>(reminder?.type || 'medication')
  const [description, setDescription] = useState(reminder?.description || '')
  const [frequency, setFrequency] = useState<ReminderFrequency>(reminder?.frequency || 'daily')
  const [startDate, setStartDate] = useState(reminder?.start_date || '')
  const [endDate, setEndDate] = useState(reminder?.end_date || '')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(reminder?.time_slots || [{ time: '08:00' }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { time: '08:00' }])
  }

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index))
  }

  const updateTimeSlot = (index: number, field: 'time' | 'label', value: string) => {
    const updated = [...timeSlots]
    updated[index] = { ...updated[index], [field]: value }
    setTimeSlots(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || timeSlots.length === 0) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        type,
        description: description.trim() || undefined,
        time_slots: timeSlots,
        frequency,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        is_active: reminder?.is_active ?? true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：降压药"
              required
              className="text-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">类型 *</Label>
              <Select value={type} onValueChange={(v) => setType(v as ReminderType)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medication">用药</SelectItem>
                  <SelectItem value="checkup">检查</SelectItem>
                  <SelectItem value="test">化验</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="frequency">频率 *</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as ReminderFrequency)}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">每日</SelectItem>
                  <SelectItem value="weekly">每周</SelectItem>
                  <SelectItem value="monthly">每月</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="添加详细说明..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">开始日期</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">结束日期</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            提醒时间
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {timeSlots.map((slot, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1">
                <Label>时间 {index + 1}</Label>
                <Input
                  type="time"
                  value={slot.time}
                  onChange={(e) => updateTimeSlot(index, 'time', e.target.value)}
                  required
                />
              </div>
              <div className="flex-1">
                <Label>标签（可选）</Label>
                <Input
                  value={slot.label || ''}
                  onChange={(e) => updateTimeSlot(index, 'label', e.target.value)}
                  placeholder="例如：早餐后"
                />
              </div>
              {timeSlots.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeTimeSlot(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addTimeSlot} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            添加时间点
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? '保存中...' : reminder ? '更新提醒' : '创建提醒'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
      </div>
    </form>
  )
}
