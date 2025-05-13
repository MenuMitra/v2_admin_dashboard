/**
 * CORS Proxy for local development
 * 
 * This utility helps work around CORS issues in local development by
 * providing functions to route API requests through public CORS proxies.
 */

// Make sure we're running on the client side
const isClient = typeof window !== 'undefined';

// Available free CORS proxies
const CORS_PROXIES = {
  CORSPROXY_IO: 'https://corsproxy.io/?',
  THINGPROXY: 'https://thingproxy.freeboard.io/fetch/',
  ALLORIGINS: 'https://api.allorigins.win/raw?url=',
};

// The default proxy to use
export const DEFAULT_PROXY = CORS_PROXIES.CORSPROXY_IO;

/**
 * Apply a CORS proxy to a URL
 * @param {string} url - The original URL
 * @param {string} proxy - The proxy to use (from CORS_PROXIES)
 * @returns {string} - The proxied URL
 */
export const applyProxy = (url, proxy = DEFAULT_PROXY) => {
  // For development only - don't use in production
  if (!isClient || process.env.NODE_ENV === 'production') {
    return url;
  }
  
  try {
    // Remove any existing proxy
    const cleanUrl = url.replace(/https?:\/\/cors-anywhere\.herokuapp\.com\//, '')
      .replace(/https?:\/\/api\.allorigins\.win\/raw\?url=/, '')
      .replace(/https?:\/\/corsproxy\.io\/\?/, '')
      .replace(/https?:\/\/thingproxy\.freeboard\.io\/fetch\//, '');
    
    // Apply the selected proxy
    return `${proxy}${cleanUrl}`;
  } catch (e) {
    console.error('Error applying CORS proxy:', e);
    return url;
  }
};

/**
 * Format headers for use with the selected proxy
 * @param {Object} headers - Original headers
 * @param {string} proxy - The proxy being used
 * @returns {Object} - Modified headers for the proxy
 */
export const formatProxyHeaders = (headers = {}, proxy = DEFAULT_PROXY) => {
  if (!isClient) return headers;
  
  try {
    // Clone the headers to avoid modifying the original
    const formattedHeaders = { ...headers };
    
    // allorigins doesn't support custom headers
    if (proxy === CORS_PROXIES.ALLORIGINS) {
      return {}; 
    }
    
    return formattedHeaders;
  } catch (e) {
    console.error('Error formatting proxy headers:', e);
    return headers;
  }
};

/**
 * Make a fetch request through a CORS proxy
 * @param {string} url - The original URL to fetch
 * @param {Object} options - Fetch options
 * @param {string} proxy - The proxy to use (from CORS_PROXIES)
 * @returns {Promise<Response>} - Fetch response
 */
export const fetchWithProxy = async (url, options = {}, proxy = DEFAULT_PROXY) => {
  // Don't use in production or server-side
  if (!isClient || process.env.NODE_ENV === 'production') {
    return fetch(url, options);
  }
  
  try {
    const proxiedUrl = applyProxy(url, proxy);
    const proxyOptions = { ...options };
    
    // Modify headers for the proxy if needed
    if (proxyOptions.headers) {
      proxyOptions.headers = formatProxyHeaders(proxyOptions.headers, proxy);
    }
    
    return fetch(proxiedUrl, proxyOptions);
  } catch (e) {
    console.error('Error fetching with proxy:', e);
    // Fall back to direct fetch if proxy fails
    return fetch(url, options);
  }
}; 