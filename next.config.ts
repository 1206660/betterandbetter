import type { NextConfig } from "next";

// 检测是否在 Cloudflare Pages 环境中
const isCloudflarePages = 
  process.env.CLOUDFLARE_PAGES === 'true' || 
  process.env.CF_PAGES === '1' ||
  process.env.CF_PAGES_BRANCH !== undefined;

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
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
