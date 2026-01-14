export type ReminderType = 'medication' | 'checkup' | 'test' | 'other'
export type ReminderFrequency = 'daily' | 'weekly' | 'monthly' | 'custom'

export interface TimeSlot {
  time: string // HH:mm 格式，如 "08:00"
  label?: string // 可选标签，如 "早餐后"
}

export interface Reminder {
  id: string
  title: string
  type: ReminderType
  description?: string
  time_slots: TimeSlot[]
  frequency: ReminderFrequency
  start_date?: string // ISO date string
  end_date?: string // ISO date string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      reminders: {
        Row: Reminder
        Insert: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Reminder, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
