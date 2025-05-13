'use client';

import { useEffect } from 'react';
import { setupGlobals } from '@/utils/globals';

// This is a client component that initializes global variables
export default function GlobalsInitializer() {
  useEffect(() => {
    // Call the setup function when the component mounts (client-side only)
    setupGlobals();
  }, []);

  // This component doesn't render anything
  return null;
} 