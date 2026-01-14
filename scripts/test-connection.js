// 简单的 Supabase 连接测试脚本
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('=== Supabase 连接测试 ===\n')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 错误: 缺少环境变量')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗')
  process.exit(1)
}

console.log('✓ 环境变量检查通过')
console.log('URL:', supabaseUrl)
console.log('Key 长度:', supabaseAnonKey.length, '字符\n')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('正在测试数据库连接...')
    // 尝试一个简单的查询（即使表不存在，也能测试连接）
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1)
    
    if (error) {
      // 表不存在是正常的，说明连接是通的
      if (error.code === 'PGRST116' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
        console.log('✓ 数据库连接正常（测试表不存在是预期的）')
        console.log('  提示: 可以在 Supabase SQL Editor 中创建 test_table 表进行完整测试')
      } else {
        console.error('❌ 数据库错误:', error.message)
        console.error('   错误代码:', error.code)
        return false
      }
    } else {
      console.log('✓ 数据库连接成功')
    }
    
    console.log('\n✅ 所有测试通过！')
    return true
  } catch (error) {
    console.error('❌ 连接异常:', error.message)
    return false
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1)
})
