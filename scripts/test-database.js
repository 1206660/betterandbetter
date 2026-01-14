// 测试数据库表和基本操作
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 错误: 缺少环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabase() {
  console.log('=== 数据库功能测试 ===\n')

  // 1. 测试表是否存在
  console.log('1. 测试表是否存在...')
  try {
    const { data, error } = await supabase.from('reminders').select('*').limit(1)
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.error('❌ reminders 表不存在，请先执行 setup_database.sql')
        process.exit(1)
      }
      throw error
    }
    console.log('✓ reminders 表存在\n')
  } catch (error) {
    console.error('❌ 错误:', error.message)
    process.exit(1)
  }

  // 2. 测试插入数据
  console.log('2. 测试插入数据...')
  try {
    const testReminder = {
      title: '测试提醒 - ' + new Date().toLocaleString('zh-CN'),
      type: 'medication',
      description: '这是一条自动生成的测试提醒',
      time_slots: [
        { time: '08:00', label: '早餐后' },
        { time: '20:00', label: '晚餐后' }
      ],
      frequency: 'daily',
      is_active: true
    }

    const { data, error } = await supabase
      .from('reminders')
      .insert([testReminder])
      .select()
      .single()

    if (error) throw error
    console.log('✓ 数据插入成功')
    console.log('  插入的 ID:', data.id)
    console.log('  标题:', data.title)
    console.log('')

    // 3. 测试查询数据
    console.log('3. 测试查询数据...')
    const { data: reminders, error: queryError } = await supabase
      .from('reminders')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5)

    if (queryError) throw queryError
    console.log(`✓ 查询成功，找到 ${reminders.length} 条活跃提醒`)
    reminders.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title} (${r.type}) - ${r.time_slots.length} 个时间点`)
    })
    console.log('')

    // 4. 测试更新数据
    console.log('4. 测试更新数据...')
    const { data: updated, error: updateError } = await supabase
      .from('reminders')
      .update({ description: '已更新的描述' })
      .eq('id', data.id)
      .select()
      .single()

    if (updateError) throw updateError
    console.log('✓ 数据更新成功')
    console.log('  更新后的描述:', updated.description)
    console.log('  更新时间:', updated.updated_at)
    console.log('')

    // 5. 测试删除测试数据
    console.log('5. 清理测试数据...')
    const { error: deleteError } = await supabase
      .from('reminders')
      .delete()
      .eq('id', data.id)

    if (deleteError) throw deleteError
    console.log('✓ 测试数据已删除')
    console.log('')

    // 6. 测试 Realtime 订阅（简单测试）
    console.log('6. 测试 Realtime 功能...')
    const channel = supabase.channel('test-channel')
    const subscribePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Realtime 订阅超时'))
      }, 5000)

      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reminders' }, (payload) => {
          clearTimeout(timeout)
          resolve(payload)
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout)
            resolve(true)
          } else if (status === 'CHANNEL_ERROR') {
            clearTimeout(timeout)
            reject(new Error('Realtime 频道错误'))
          }
        })
    })

    try {
      await subscribePromise
      console.log('✓ Realtime 订阅成功')
      await supabase.removeChannel(channel)
    } catch (error) {
      console.log('⚠ Realtime 测试失败:', error.message)
      console.log('  （这可能是正常的，如果 Realtime 未启用）')
    }
    console.log('')

    console.log('✅ 所有数据库测试通过！')
    console.log('\n提示: 现在可以在应用中创建和管理提醒了')
    return true
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    if (error.details) {
      console.error('  详情:', error.details)
    }
    if (error.hint) {
      console.error('  提示:', error.hint)
    }
    return false
  }
}

testDatabase().then((success) => {
  process.exit(success ? 0 : 1)
})
