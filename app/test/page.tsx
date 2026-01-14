'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  data?: any
}

export default function TestPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const tests: Array<{
    name: string
    test: () => Promise<{ success: boolean; message: string; data?: any }>
  }> = [
    {
      name: '环境变量检查',
      test: async () => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!url || !key) {
          return {
            success: false,
            message: `缺少环境变量: ${!url ? 'NEXT_PUBLIC_SUPABASE_URL' : ''} ${!key ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : ''}`.trim(),
          }
        }

        if (url.includes('your_supabase') || key.includes('your_supabase')) {
          return {
            success: false,
            message: '请先配置 .env.local 文件，填入真实的 Supabase 配置',
          }
        }

        return {
          success: true,
          message: '环境变量配置正确',
          data: { url: url.substring(0, 30) + '...', keyLength: key.length },
        }
      },
    },
    {
      name: 'Supabase 客户端连接',
      test: async () => {
        try {
          const client = supabase
          if (!client) {
            return { success: false, message: '无法创建 Supabase 客户端' }
          }
          return { success: true, message: 'Supabase 客户端创建成功' }
        } catch (error: any) {
          return { success: false, message: `连接失败: ${error.message}` }
        }
      },
    },
    {
      name: '数据库连接测试',
      test: async () => {
        try {
          // 尝试执行一个简单的查询
          const { data, error } = await supabase.from('_test_connection').select('*').limit(1)
          
          // 如果表不存在，这是预期的，说明连接是正常的
          if (error) {
            if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
              return {
                success: true,
                message: '数据库连接正常（测试表不存在是预期的）',
              }
            }
            return { success: false, message: `数据库错误: ${error.message}` }
          }
          return { success: true, message: '数据库连接成功', data }
        } catch (error: any) {
          return { success: false, message: `连接异常: ${error.message}` }
        }
      },
    },
    {
      name: 'Realtime 功能测试',
      test: async () => {
        try {
          const channel = supabase.channel('test-channel')
          const subscribePromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Realtime 订阅超时'))
            }, 5000)

            channel
              .on('presence', { event: 'sync' }, () => {
                clearTimeout(timeout)
                resolve(true)
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

          await subscribePromise
          await supabase.removeChannel(channel)

          return { success: true, message: 'Realtime 功能正常' }
        } catch (error: any) {
          return { success: false, message: `Realtime 测试失败: ${error.message}` }
        }
      },
    },
    {
      name: '创建测试表（如果不存在）',
      test: async () => {
        try {
          // 注意：这需要 Supabase SQL Editor 中执行，这里只是提示
          return {
            success: true,
            message: '请在 Supabase SQL Editor 中创建测试表（见下方 SQL）',
            data: {
              sql: `CREATE TABLE IF NOT EXISTS test_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
            },
          }
        } catch (error: any) {
          return { success: false, message: `错误: ${error.message}` }
        }
      },
    },
    {
      name: '插入测试数据',
      test: async () => {
        try {
          const { data, error } = await supabase
            .from('test_table')
            .insert({ name: `测试数据 ${new Date().toISOString()}` })
            .select()
            .single()

          if (error) {
            if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
              return {
                success: false,
                message: 'test_table 表不存在，请先在 Supabase 中创建',
              }
            }
            return { success: false, message: `插入失败: ${error.message}` }
          }

          return { success: true, message: '数据插入成功', data }
        } catch (error: any) {
          return { success: false, message: `插入异常: ${error.message}` }
        }
      },
    },
    {
      name: '查询测试数据',
      test: async () => {
        try {
          const { data, error } = await supabase.from('test_table').select('*').limit(5).order('created_at', { ascending: false })

          if (error) {
            if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
              return {
                success: false,
                message: 'test_table 表不存在',
              }
            }
            return { success: false, message: `查询失败: ${error.message}` }
          }

          return {
            success: true,
            message: `查询成功，找到 ${data?.length || 0} 条记录`,
            data: data,
          }
        } catch (error: any) {
          return { success: false, message: `查询异常: ${error.message}` }
        }
      },
    },
  ]

  const runTests = async () => {
    setIsRunning(true)
    const newResults: TestResult[] = []

    for (const test of tests) {
      // 设置当前测试为 pending
      const currentIndex = newResults.length
      newResults.push({
        name: test.name,
        status: 'pending',
        message: '测试中...',
      })
      setResults([...newResults])

      try {
        const result = await test.test()
        newResults[currentIndex] = {
          name: test.name,
          status: result.success ? 'success' : 'error',
          message: result.message,
          data: result.data,
        }
        setResults([...newResults])
      } catch (error: any) {
        newResults[currentIndex] = {
          name: test.name,
          status: 'error',
          message: `测试异常: ${error.message}`,
        }
        setResults([...newResults])
      }

      // 短暂延迟，让用户看到进度
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    setIsRunning(false)
  }

  useEffect(() => {
    // 自动运行基础测试
    runTests()
  }, [])

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return '✓'
      case 'error':
        return '✗'
      case 'pending':
        return '⟳'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase 连接测试</h1>
          <p className="text-gray-600 mb-4">
            此页面用于测试 Supabase 连接和基本功能。确保已配置 <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> 文件。
          </p>
          <button
            onClick={runTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? '测试中...' : '重新运行测试'}
          </button>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{getStatusIcon(result.status)}</span>
                  <h3 className="font-semibold">{result.name}</h3>
                </div>
                <span className="text-sm font-medium uppercase">{result.status}</span>
              </div>
              <p className="text-sm mb-2">{result.message}</p>
              {result.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">查看详情</summary>
                  <pre className="mt-2 p-2 bg-white/50 rounded text-xs overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">配置说明</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>复制 <code className="bg-blue-100 px-1 rounded">.env.local.example</code> 为 <code className="bg-blue-100 px-1 rounded">.env.local</code></li>
            <li>在 Supabase 项目设置中获取 URL 和 Anon Key</li>
            <li>填入 <code className="bg-blue-100 px-1 rounded">.env.local</code> 文件</li>
            <li>重启开发服务器（如果正在运行）</li>
            <li>刷新此页面查看测试结果</li>
          </ol>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">创建测试表 SQL</h3>
          <p className="text-sm text-yellow-800 mb-2">
            在 Supabase SQL Editor 中执行以下 SQL 创建测试表：
          </p>
          <pre className="bg-yellow-100 p-3 rounded text-xs overflow-auto">
            {`CREATE TABLE IF NOT EXISTS test_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 Row Level Security (可选)
ALTER TABLE test_table ENABLE ROW LEVEL SECURITY;

-- 允许所有操作（测试用）
CREATE POLICY "Allow all operations" ON test_table FOR ALL USING (true);`}
          </pre>
        </div>
      </div>
    </div>
  )
}
