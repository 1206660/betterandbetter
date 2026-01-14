import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 支持 Docker 部署
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
};

export default nextConfig;
