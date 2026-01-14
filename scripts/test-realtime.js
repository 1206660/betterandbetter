// 测试实时刷新功能
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 错误: 缺少环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRealtime() {
  console.log('=== 实时刷新功能测试 ===\n')
  console.log('这个测试会创建一个测试提醒，然后删除它')
  console.log('如果 display 页面正在运行，你应该能看到自动刷新\n')

  // 创建测试提醒
  console.log('1. 创建测试提醒...')
  const testReminder = {
    title: '实时测试提醒 - ' + new Date().toLocaleTimeString('zh-CN'),
    type: 'medication',
    description: '这是一个测试实时刷新的提醒',
    time_slots: [
      { time: '08:00', label: '早餐后' }
    ],
    frequency: 'daily',
    is_active: true
  }

  const { data: inserted, error: insertError } = await supabase
    .from('reminders')
    .insert([testReminder])
    .select()
    .single()

  if (insertError) {
    console.error('❌ 创建失败:', insertError.message)
    process.exit(1)
  }

  console.log('✓ 提醒已创建')
  console.log('  ID:', inserted.id)
  console.log('  标题:', inserted.title)
  console.log('\n⏳ 等待 3 秒，观察 display 页面是否自动刷新...\n')

  await new Promise(resolve => setTimeout(resolve, 3000))

  // 更新提醒
  console.log('2. 更新提醒...')
  const { data: updated, error: updateError } = await supabase
    .from('reminders')
    .update({ description: '已更新的描述 - ' + new Date().toLocaleTimeString('zh-CN') })
    .eq('id', inserted.id)
    .select()
    .single()

  if (updateError) {
    console.error('❌ 更新失败:', updateError.message)
  } else {
    console.log('✓ 提醒已更新')
    console.log('  新描述:', updated.description)
    console.log('\n⏳ 等待 3 秒，观察 display 页面是否自动刷新...\n')
  }

  await new Promise(resolve => setTimeout(resolve, 3000))

  // 删除提醒
  console.log('3. 删除测试提醒...')
  const { error: deleteError } = await supabase
    .from('reminders')
    .delete()
    .eq('id', inserted.id)

  if (deleteError) {
    console.error('❌ 删除失败:', deleteError.message)
  } else {
    console.log('✓ 提醒已删除')
    console.log('\n⏳ 等待 3 秒，观察 display 页面是否自动刷新...\n')
  }

  await new Promise(resolve => setTimeout(resolve, 3000))

  console.log('✅ 测试完成！')
  console.log('\n如果 display 页面正在运行，你应该看到了：')
  console.log('  1. 提醒出现（创建时）')
  console.log('  2. 提醒更新（更新时）')
  console.log('  3. 提醒消失（删除时）')
  console.log('\n如果没有看到自动刷新，请检查：')
  console.log('  - display 页面是否在浏览器中打开')
  console.log('  - Supabase Realtime 是否已启用')
  console.log('  - 浏览器控制台是否有错误')
}

testRealtime().catch(console.error)
