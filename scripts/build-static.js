/**
 * Custom build script for static export
 * This script generates a static export of only core pages
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define core pages to include in the static export
const corePaths = [
  '/',
  '/dashboard',
  '/auth/login',
  '/outlets',
  '/owners',
  '/partners',
  '/qr-templates',
  '/profile',
  '/404'
];

// Set environment variables for static build
process.env.NODE_ENV = 'production';
process.env.NEXT_PUBLIC_API_ENV = 'prod';
process.env.NEXT_PUBLIC_STATIC_EXPORT = 'true';

console.log('🚀 Starting custom static build...');

try {
  // Run Next.js build with export mode
  console.log('Building Next.js application with static export...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('✅ Static build completed successfully!');
  console.log('📂 Static files are available in the "out" directory');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
} 