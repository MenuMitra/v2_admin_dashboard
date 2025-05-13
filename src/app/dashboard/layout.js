"use client";

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for SidebarLayout to prevent hydration issues
const SidebarLayout = dynamic(() => import('@/components/Sidebar'), {
  ssr: false
});

export default function DashboardLayout({ children }) {
  return <SidebarLayout>{children}</SidebarLayout>;
} 