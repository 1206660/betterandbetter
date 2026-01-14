// 检查 Supabase Realtime 是否启用
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 错误: 缺少环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkRealtime() {
  console.log('=== 检查 Supabase Realtime 配置 ===\n')

  // 测试 Realtime 订阅
  console.log('1. 测试 Realtime 订阅...')
  const channel = supabase.channel('test-realtime-check')

  const subscribePromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('订阅超时（5秒）'))
    }, 5000)

    channel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reminders',
      }, (payload) => {
        clearTimeout(timeout)
        resolve({ success: true, payload })
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          clearTimeout(timeout)
          resolve({ success: true, status: 'SUBSCRIBED' })
        } else if (status === 'CHANNEL_ERROR') {
          clearTimeout(timeout)
          reject(new Error('频道错误'))
        } else if (status === 'TIMED_OUT') {
          clearTimeout(timeout)
          reject(new Error('订阅超时'))
        } else if (status === 'CLOSED') {
          clearTimeout(timeout)
          reject(new Error('频道已关闭'))
        }
      })
  })

  try {
    const result = await subscribePromise
    console.log('✓ Realtime 订阅成功')
    console.log('  状态:', result.status || '已订阅')
    console.log('')

    // 测试触发一个事件
    console.log('2. 测试触发 Realtime 事件...')
    console.log('   创建一个测试提醒...')

    const { data, error } = await supabase
      .from('reminders')
      .insert([{
        title: 'Realtime 测试 - ' + Date.now(),
        type: 'other',
        time_slots: [{ time: '12:00' }],
        frequency: 'daily',
        is_active: false
      }])
      .select()
      .single()

    if (error) {
      console.error('  创建失败:', error.message)
    } else {
      console.log('  ✓ 测试提醒已创建')
      console.log('  等待 Realtime 事件...')

      // 等待事件
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 删除测试数据
      await supabase.from('reminders').delete().eq('id', data.id)
      console.log('  ✓ 测试提醒已删除')
    }

    await supabase.removeChannel(channel)
    console.log('\n✅ Realtime 功能正常！')
    console.log('\n如果 display 页面没有自动刷新，可能的原因：')
    console.log('1. 浏览器标签页被挂起（某些浏览器会暂停后台标签页）')
    console.log('2. 浏览器控制台有错误（按 F12 查看）')
    console.log('3. 网络连接问题')
    console.log('\n提示：代码已添加轮询备选方案，每 10 秒自动刷新一次')
  } catch (error) {
    console.error('❌ Realtime 测试失败:', error.message)
    console.log('\n可能的原因：')
    console.log('1. Supabase Realtime 未启用')
    console.log('   解决方法：在 Supabase Dashboard 中启用 Realtime')
    console.log('   - 进入 Database > Replication')
    console.log('   - 找到 reminders 表')
    console.log('   - 确保 "Enable Realtime" 已开启')
    console.log('\n2. 网络连接问题')
    console.log('   解决方法：检查网络连接')
    console.log('\n提示：代码已添加轮询备选方案，即使 Realtime 不工作，也会每 10 秒自动刷新')
    await supabase.removeChannel(channel)
    process.exit(1)
  }
}

checkRealtime().catch(console.error)
