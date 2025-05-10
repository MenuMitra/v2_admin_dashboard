/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_ENV: 'dev', // Change to 'prod' for production
    NEXT_PUBLIC_API_URL: 'https://men4u.xyz/v2', // Kept for backward compatibility
  },
  images: {
    domains: ['men4u.xyz', 'dev.men4u.xyz', 'staging.men4u.xyz'],
  },
 
};

module.exports = nextConfig; 