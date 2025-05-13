/**
 * Globals configuration
 * Sets up global variables in a safe way without using dangerouslySetInnerHTML
 */

// Set global process.env for client-side if it doesn't exist
if (typeof window !== 'undefined' && !window.process) {
  window.process = {
    env: {
      NEXT_PUBLIC_API_URL: 'https://men4u.xyz/v2',
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
  };
}

// Export a dummy function to prevent tree-shaking
export const setupGlobals = () => {
  // This function just ensures the above code runs
  return true;
}; 