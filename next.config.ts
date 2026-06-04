import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse e firecrawl devem rodar no runtime Node.js, não serem bundlados
  serverExternalPackages: ['pdf-parse', '@mendable/firecrawl-js'],
};

export default nextConfig;
