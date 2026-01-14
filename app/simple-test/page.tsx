'use client'

export default function SimpleTestPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">简单连接测试</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold mb-2">环境变量检查:</h2>
            <div className="bg-gray-100 p-3 rounded">
              <p>NEXT_PUBLIC_SUPABASE_URL: {supabaseUrl ? '✓ 已配置' : '✗ 未配置'}</p>
              <p className="text-sm text-gray-600 mt-1">{supabaseUrl || '无'}</p>
            </div>
          </div>
          
          <div>
            <div className="bg-gray-100 p-3 rounded">
              <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {supabaseKey ? '✓ 已配置' : '✗ 未配置'}</p>
              <p className="text-sm text-gray-600 mt-1">
                {supabaseKey ? `${supabaseKey.substring(0, 20)}... (${supabaseKey.length} 字符)` : '无'}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              <strong>提示:</strong> 如果环境变量显示未配置，请确保：
            </p>
            <ul className="list-disc list-inside text-sm text-blue-800 mt-2 space-y-1">
              <li>.env.local 文件存在于项目根目录</li>
              <li>已重启开发服务器（npm run dev）</li>
              <li>环境变量名称以 NEXT_PUBLIC_ 开头</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
