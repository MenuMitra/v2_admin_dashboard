"use client";

import { useState, useEffect } from 'react';
import { getApiEnvironment, setApiEnvironment } from '@/utils/auth';

/**
 * Environment Switcher Component
 * Allows users to switch between development and production environments
 * Only displayed in development mode
 */
export default function EnvSwitcher() {
  const [currentEnv, setCurrentEnv] = useState('dev');
  const [isClient, setIsClient] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const env = getApiEnvironment();
    setCurrentEnv(env);
    
    // Only show switcher in development mode or if explicitly enabled
    const isDev = process.env.NODE_ENV === 'development';
    const forceShow = localStorage.getItem('showEnvSwitcher') === 'true';
    setShowSwitcher(isDev || forceShow);
  }, []);

  const handleEnvChange = (env) => {
    setApiEnvironment(env);
    setCurrentEnv(env);
  };

  // Don't render anything during SSR or if switcher should be hidden
  if (!isClient || !showSwitcher) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-md p-3 rounded-lg shadow-lg border border-white/20 z-50">
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/80">Environment:</span>
        <div className="flex rounded-md overflow-hidden">
          <button
            className={`text-xs px-3 py-1 transition-colors ${
              currentEnv === 'dev'
                ? 'bg-indigo-600 text-white'
                : 'bg-white/20 text-white/80 hover:bg-white/30'
            }`}
            onClick={() => handleEnvChange('dev')}
          >
            DEV
          </button>
          <button
            className={`text-xs px-3 py-1 transition-colors ${
              currentEnv === 'prod'
                ? 'bg-emerald-600 text-white'
                : 'bg-white/20 text-white/80 hover:bg-white/30'
            }`}
            onClick={() => handleEnvChange('prod')}
          >
            PROD
          </button>
        </div>
      </div>
    </div>
  );
} 