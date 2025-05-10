"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.push('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto border-4 border-indigo-600 border-dashed rounded-full animate-spin"></div>
        <h2 className="mt-4 text-xl font-medium text-gray-700">Redirecting to login...</h2>
      </div>
    </div>
  );
}
