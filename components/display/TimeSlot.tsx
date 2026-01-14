'use client'

import { TimeSlot as TimeSlotType } from '@/lib/types'
import { Clock } from 'lucide-react'

interface TimeSlotProps {
  slot: TimeSlotType
  isActive?: boolean
}

export function TimeSlot({ slot, isActive = false }: TimeSlotProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg ${
        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
      }`}
    >
      <Clock className={`w-6 h-6 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
      <span className="text-xl font-semibold">{slot.time}</span>
      {slot.label && (
        <span className={`text-lg ${isActive ? 'opacity-90' : 'opacity-70'}`}>
          {slot.label}
        </span>
      )}
    </div>
  )
}
