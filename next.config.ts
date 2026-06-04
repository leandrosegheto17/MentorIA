import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse e firecrawl devem rodar no runtime Node.js, não serem bundlados
  // Pacotes que devem rodar no runtime Node.js nativo (não bundlados pelo Turbopack)
  serverExternalPackages: [
    'pdf-parse',
    '@mendable/firecrawl-js',
    '@prisma/client',
    '@prisma/adapter-pg',
    'pg',
  ],
};

export default nextConfig;
