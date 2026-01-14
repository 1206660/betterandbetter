import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '健康提醒 - BetterAndBetter',
  description: '每日健康提醒展示',
}

export default function DisplayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
