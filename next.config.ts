import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ygoprodeck.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev', 
      }
    ],
  },
};

export default nextConfig;
