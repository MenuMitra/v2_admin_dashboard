export async function POST(request) {
  try {
    // Get request body and endpoint from the request
    const { endpoint, data, method = 'POST', isFormData = false } = await request.json();
    
    // Set the target API URL
    const apiUrl = `https://men4u.xyz/v2${endpoint}`;
    
    console.log(`Proxying ${method} request to: ${apiUrl}`);
    console.log('Request data:', data);
    
    // Configure request options
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    // Handle form data differently than JSON
    if (isFormData) {
      // For FormData, don't set Content-Type header
      options.headers = {};
      options.body = data;
    } else if (data) {
      options.body = JSON.stringify(data);
    }
    
    // Add authorization if available
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      options.headers['Authorization'] = authHeader;
      console.log('Adding auth header:', authHeader);
    }
    
    // Forward the request to the actual API
    const response = await fetch(apiUrl, options);
    const result = await response.json();
    
    // Log response for debugging
    console.log('API response:', result);
    
    // Handle authentication errors
    if (result.detail?.includes('Error with token') || result.detail?.includes('Not authenticated')) {
      console.log('Auth error detected:', result.detail);
      return Response.json(result, { status: 401 });
    }
    
    // Return the response
    return Response.json(result);
  } catch (error) {
    console.error('API proxy error:', error);
    return Response.json(
      { error: 'Failed to fetch data from API', detail: error.message },
      { status: 500 }
    );
  }
}

// Handle GET requests
export async function GET(request) {
  const url = new URL(request.url);
  const endpoint = url.searchParams.get('endpoint');
  
  if (!endpoint) {
    return Response.json(
      { error: 'Endpoint parameter is required' }, 
      { status: 400 }
    );
  }
  
  try {
    // Set the target API URL
    const apiUrl = `https://men4u.xyz/v2${endpoint}`;
    console.log(`Proxying GET request to: ${apiUrl}`);
    
    // Configure request options with auth
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    // Add authorization if available
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      options.headers['Authorization'] = authHeader;
      console.log('Adding auth header:', authHeader);
    }
    
    // Forward the request to the actual API
    const response = await fetch(apiUrl, options);
    const result = await response.json();
    
    // Log response for debugging
    console.log('API response:', result);
    
    // Handle authentication errors
    if (result.detail?.includes('Error with token') || result.detail?.includes('Not authenticated')) {
      console.log('Auth error detected:', result.detail);
      return Response.json(result, { status: 401 });
    }
    
    // Return the response
    return Response.json(result);
  } catch (error) {
    console.error('API proxy error:', error);
    return Response.json(
      { error: 'Failed to fetch data from API', detail: error.message },
      { status: 500 }
    );
  }
} 