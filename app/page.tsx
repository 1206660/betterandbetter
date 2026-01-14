import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Settings, Eye, TestTube } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            BetterAndBetter
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-2">
            家庭健康提醒应用
          </p>
          <p className="text-lg text-muted-foreground/70">
            为老年人设计的健康提醒系统
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                展示页面
              </CardTitle>
              <CardDescription>老人 Pad 端健康提醒展示</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/display" target="_blank">
                <Button className="w-full">查看展示页</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                管理后台
              </CardTitle>
              <CardDescription>创建和管理健康提醒</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full">进入管理</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
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
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5 text-primary" />
                测试功能
              </CardTitle>
              <CardDescription>测试 Supabase 连接和功能</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/test">
                <Button variant="outline" className="w-full">测试连接</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
