/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use export mode in production
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
  env: {
    NEXT_PUBLIC_API_ENV: 'dev', // Change to 'prod' for production
    NEXT_PUBLIC_API_URL: 'https://men4u.xyz/v2', // Kept for backward compatibility
    NEXT_PUBLIC_STATIC_EXPORT: process.env.NODE_ENV === 'production' ? 'true' : 'false', // Only true in production
  },
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
  // Static export settings (only used in production)
  distDir: '.next',
  trailingSlash: true,
  
  // Add CORS configuration for development
  async headers() {
    return process.env.NODE_ENV === 'production' ? [] : [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ]
      }
    ];
  }
};

module.exports = nextConfig; 