// Add these exports for static export compatibility
export const dynamic = 'force-dynamic';

// Configure CORS headers
function setCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  return response;
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  return setCorsHeaders(response);
}

export async function POST(request) {
  try {
    // Get JSON data or form data depending on content type
    const contentType = request.headers.get('content-type') || '';
    
    // Get authorization token from headers
    const authToken = request.headers.get('authorization');
    console.log('Received auth token (first 20 chars):', authToken ? authToken.substring(0, 20) + '...' : 'none');
    
    // Handle both JSON and FormData
    if (contentType.includes('multipart/form-data')) {
      // Handle direct form data uploads
      const formData = await request.formData();
      const endpoint = formData.get('endpoint');
      const method = formData.get('method') || 'POST';
      
      if (!endpoint) {
        return setCorsHeaders(Response.json(
          { error: 'Endpoint parameter is required' },
          { status: 400 }
        ));
      }
      
      // Set the target API URL
      const apiUrl = `https://men4u.xyz/v2${endpoint}`;
      console.log(`Proxying ${method} form data request to: ${apiUrl}`);
      
      // Create a headers object for the request
      const headers = {};
      if (authToken) {
        console.log('Adding auth token to request headers for FormData request');
        headers['Authorization'] = authToken;
      }
      
      // Forward the FormData directly to the API
      const response = await fetch(apiUrl, {
        method: method,
        headers,
        body: formData, // Send the FormData as is
      });
      
      // Get the response as JSON
      try {
        const contentType = response.headers.get('content-type');
        
        // Check if the response is JSON
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          console.log('API response:', result);
          
          // Return the response
          return setCorsHeaders(Response.json(result, { status: response.status }));
        } else {
          // Handle HTML or other non-JSON responses
          const text = await response.text();
          console.error('Non-JSON response received:', text.substring(0, 200) + '...');
          
          return setCorsHeaders(Response.json({ 
            error: 'Unexpected response format received from server',
            detail: 'Server did not return valid JSON. Please check server logs.'
          }, { status: 500 }));
        }
      } catch (error) {
        console.error('Error parsing response:', error);
        return setCorsHeaders(Response.json({ 
          error: 'Failed to parse server response',
          detail: error.message
        }, { status: 500 }));
      }
    }
    else {
      // Handle JSON requests
      const { endpoint, data, method = 'POST' } = await request.json();
      
      // Set the target API URL
      const apiUrl = `https://men4u.xyz/v2${endpoint}`;
      
      console.log(`Proxying ${method} request to: ${apiUrl}`);
      console.log('Request data:', data);
      
      // Configure request options
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };
      
      // Add authorization if available
      if (authToken) {
        console.log('Adding auth token to request headers:', authToken.substring(0, 20) + '...');
        options.headers['Authorization'] = authToken;
      }
      
      // Forward the request to the actual API
      const response = await fetch(apiUrl, options);
      console.log('Response status from API:', response.status);
      
      // Get the response as JSON
      try {
        const contentType = response.headers.get('content-type');
        
        // Check if the response is JSON
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          console.log('API response:', result);
          
          // Return the response with appropriate status code
          return setCorsHeaders(Response.json(result, {
            status: response.status
          }));
        } else {
          // Handle HTML or other non-JSON responses
          const text = await response.text();
          console.error('Non-JSON response received:', text.substring(0, 200) + '...');
          
          return setCorsHeaders(Response.json({ 
            error: 'Unexpected response format received from server',
            detail: 'Server did not return valid JSON. Please check server logs.'
          }, { status: 500 }));
        }
      } catch (error) {
        console.error('Error parsing response:', error);
        return setCorsHeaders(Response.json({ 
          error: 'Failed to parse server response',
          detail: error.message
        }, { status: 500 }));
      }
    }
  } catch (error) {
    console.error('API proxy error:', error);
    return setCorsHeaders(Response.json(
      { error: 'Failed to fetch data from API', details: error.message },
      { status: 500 }
    ));
  }
}

// Handle GET requests
export async function GET(request) {
  const url = new URL(request.url);
  const endpoint = url.searchParams.get('endpoint');
  
  if (!endpoint) {
    return setCorsHeaders(Response.json(
      { error: 'Endpoint parameter is required' }, 
      { status: 400 }
    ));
  }
  
  try {
    // Set the target API URL
    const apiUrl = `https://men4u.xyz/v2${endpoint}`;
    
    console.log(`Proxying GET request to: ${apiUrl}`);
    
    // Get auth token from headers
    const authToken = request.headers.get('authorization');
    
    // Prepare headers for the API request
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization token if available
    if (authToken) {
      headers['Authorization'] = authToken;
    }
    
    // Forward the request to the actual API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers,
    });
    
    // Get the response as JSON
    const result = await response.json();
    console.log('API response:', result);
    
    // Return the response
    return setCorsHeaders(Response.json(result));
  } catch (error) {
    console.error('API proxy error:', error);
    return setCorsHeaders(Response.json(
      { error: 'Failed to fetch data from API' },
      { status: 500 }
    ));
  }
} 