import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 支持 Docker 部署
  output: process.env.DOCKER_BUILD === 'true' 
    ? 'standalone' 
    : process.env.CLOUDFLARE_PAGES === 'true'
    ? 'export' // Cloudflare Pages 静态导出
    : undefined,
  // Cloudflare Pages 静态导出需要禁用图片优化
  images: process.env.CLOUDFLARE_PAGES === 'true' ? {
    unoptimized: true,
  } : undefined,
};

export default nextConfig;
