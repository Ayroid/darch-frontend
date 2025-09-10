import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Enable standalone output for Docker optimization
  output: 'standalone',
  
  // Optimize for production
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['@radix-ui/react-icons', 'react-icons'],
  },
  
  // Image optimization for Docker
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
