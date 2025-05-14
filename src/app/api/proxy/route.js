/**
 * API Proxy route for local development
 * 
 * This route acts as a proxy for API requests during local development to avoid CORS issues.
 * It forwards requests to the actual API and returns the response.
 */
import { NextResponse } from 'next/server';

// Required for static export
export const dynamic = "force-static";

// The API server URL
const API_BASE_URL = 'https://men4u.xyz/v2';

/**
 * Handler for POST requests to the proxy endpoint
 * 
 * @param {Request} request - The incoming HTTP request
 * @returns {Promise<Response>} - The API response
 */
export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { endpoint, method = 'GET', data, headers = {} } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint parameter' },
        { status: 400 }
      );
    }

    // Build the API URL
    const apiUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`Proxying request to ${apiUrl}`);

    // Prepare fetch options
    const fetchOptions = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    // Add request body for non-GET requests if data is provided
    if (method !== 'GET' && data) {
      fetchOptions.body = JSON.stringify(data);
    }

    // Make the API request
    const response = await fetch(apiUrl, fetchOptions);
    
    // Parse the response as JSON
    const responseData = await response.json();

    // Return the API response with appropriate status code
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'API proxy error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handler for GET requests to the proxy endpoint
 * This is useful for when query parameters are used to specify the API endpoint
 */
export async function GET(request) {
  try {
    // Get the URL from the request
    const url = new URL(request.url);
    
    // Get the endpoint from the query parameters
    const endpoint = url.searchParams.get('endpoint');
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint parameter' },
        { status: 400 }
      );
    }
    
    // Build the API URL
    const apiUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`Proxying GET request to ${apiUrl}`);
    
    // Prepare fetch options with headers from the original request
    const headers = {};
    request.headers.forEach((value, key) => {
      // Skip host and other non-relevant headers
      if (!['host', 'referer', 'origin'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });
    
    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers
    });
    
    // Parse the response as JSON
    const responseData = await response.json();
    
    // Return the API response with appropriate status code
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'API proxy error', message: error.message },
      { status: 500 }
    );
  }
} 