'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Reminder } from '@/lib/types'
import { ReminderForm } from '@/components/admin/ReminderForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function RemindersPage() {
  const router = useRouter()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | undefined>()

  const fetchReminders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setReminders((data || []) as Reminder[])
    } catch (error) {
      console.error('获取提醒失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReminders()

    // 订阅实时更新
    const channel = supabase
      .channel('reminders-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
        },
        (payload) => {
          console.log('管理页面 Realtime 事件:', payload.eventType)
          fetchReminders()
        }
      )
      .subscribe((status) => {
        console.log('管理页面 Realtime 订阅状态:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✓ 管理页面 Realtime 订阅成功')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('✗ 管理页面 Realtime 订阅失败')
        }
      })

    // 备选方案：轮询
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchReminders()
      }
    }, 5000) // 每 5 秒轮询一次

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [])

  const handleSubmit = async (data: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingReminder) {
        const { error } = await supabase
          .from('reminders')
          .update(data)
          .eq('id', editingReminder.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('reminders').insert([data])
        if (error) throw error
      }

      setIsDialogOpen(false)
      setEditingReminder(undefined)
      fetchReminders()
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个提醒吗？')) return

    try {
      const { error } = await supabase.from('reminders').delete().eq('id', id)
      if (error) throw error
      fetchReminders()
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
    }
  }

  const handleToggleActive = async (reminder: Reminder) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_active: !reminder.is_active })
        .eq('id', reminder.id)

      if (error) throw error
      fetchReminders()
    } catch (error) {
      console.error('更新失败:', error)
    }
  }

  const openCreateDialog = () => {
    setEditingReminder(undefined)
    setIsDialogOpen(true)
  }

  const openEditDialog = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setIsDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold mb-2">提醒管理</h1>
            <p className="text-lg text-muted-foreground">管理所有健康提醒</p>
          </div>
          <div className="flex gap-4">
            <Link href="/admin">
              <Button variant="outline">返回</Button>
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  新建提醒
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingReminder ? '编辑提醒' : '新建提醒'}</DialogTitle>
                </DialogHeader>
                <ReminderForm
                  reminder={editingReminder}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setIsDialogOpen(false)
                    setEditingReminder(undefined)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-muted-foreground">加载中...</div>
          </div>
        ) : reminders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg text-muted-foreground mb-4">暂无提醒</p>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                创建第一个提醒
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reminders.map((reminder) => (
              <Card key={reminder.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-2xl">{reminder.title}</CardTitle>
                        {reminder.is_active ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>类型: {reminder.type}</span>
                        <span>频率: {reminder.frequency}</span>
                        {reminder.time_slots.length > 0 && (
                          <span>时间: {reminder.time_slots.map((s) => s.time).join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(reminder)}
                      >
                        {reminder.is_active ? '停用' : '启用'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(reminder)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(reminder.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {reminder.description && (
                  <CardContent>
                    <p className="text-muted-foreground">{reminder.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
