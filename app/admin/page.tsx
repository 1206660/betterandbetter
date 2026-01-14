import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, List, Eye, Settings } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">管理后台</h1>
          <p className="text-lg text-muted-foreground">BetterAndBetter 健康提醒管理</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                提醒管理
              </CardTitle>
              <CardDescription>查看、创建和编辑健康提醒</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/reminders">
                <Button className="w-full">管理提醒</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                实时预览
              </CardTitle>
              <CardDescription>预览 Pad 端显示效果</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/preview">
                <Button variant="outline" className="w-full">查看预览</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                展示页面
              </CardTitle>
              <CardDescription>查看老人 Pad 端页面</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/display" target="_blank">
                <Button variant="outline" className="w-full">打开展示页</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
