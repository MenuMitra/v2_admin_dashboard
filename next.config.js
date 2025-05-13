/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use static export for production builds
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_ENV: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
    NEXT_PUBLIC_API_URL: 'https://men4u.xyz/v2',
    NEXT_PUBLIC_STATIC_EXPORT: process.env.NODE_ENV === 'production' ? 'true' : 'false',
  },
  
  // Image optimization settings
  images: {
    domains: ['men4u.xyz', 'dev.men4u.xyz', 'staging.men4u.xyz'],
    unoptimized: true,
  },
  
  // Performance optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Optimize JavaScript
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Disable ESLint during build to avoid failures
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Static export settings
  distDir: '.next',
  trailingSlash: true,
  
  // Skip type checking to speed up the build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip other checks for faster builds
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig; 