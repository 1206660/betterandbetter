import type { NextConfig } from "next";

// 检测是否在 Cloudflare Pages 环境中
const isCloudflarePages = 
  process.env.CLOUDFLARE_PAGES === 'true' || 
  process.env.CF_PAGES === '1' ||
  process.env.CF_PAGES_BRANCH !== undefined;

// 获取环境变量（构建时）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 调试：在构建时输出环境变量状态（仅在构建时，不会出现在客户端）
if (typeof window === 'undefined' && isCloudflarePages) {
  console.log('[Next.js Config] Cloudflare Pages 环境检测:');
  console.log('[Next.js Config] NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ 已配置' : '✗ 未配置');
  console.log('[Next.js Config] NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓ 已配置' : '✗ 未配置');
}

const nextConfig: NextConfig = {
  // 支持 Docker 部署
  output: process.env.DOCKER_BUILD === 'true' 
    ? 'standalone' 
    : isCloudflarePages
    ? 'export' // Cloudflare Pages 静态导出
    : undefined,
  // Cloudflare Pages 静态导出需要禁用图片优化
  images: isCloudflarePages ? {
    unoptimized: true,
  } : undefined,
  // 明确指定需要在构建时注入的环境变量
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey || '',
  },
};

export default nextConfig;
