import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 支持 Docker 部署
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  // Cloudflare Pages 支持（如果需要）
  // 注意：Cloudflare Pages 现在原生支持 Next.js，可能不需要特殊配置
};

export default nextConfig;
