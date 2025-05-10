export async function POST(request) {
  try {
    // Get JSON data or form data depending on content type
    const contentType = request.headers.get('content-type') || '';
    
    // Handle both JSON and FormData
    if (contentType.includes('multipart/form-data')) {
      // Handle direct form data uploads
      const formData = await request.formData();
      const endpoint = formData.get('endpoint');
      const method = formData.get('method') || 'POST';
      
      if (!endpoint) {
        return Response.json(
          { error: 'Endpoint parameter is required' },
          { status: 400 }
        );
      }
      
      // Set the target API URL
      const apiUrl = `https://men4u.xyz/v2${endpoint}`;
      console.log(`Proxying ${method} form data request to: ${apiUrl}`);
      
      // Get authorization token from headers
      const authToken = request.headers.get('authorization');
      
      // Create a headers object for the request
      const headers = {};
      if (authToken) {
        headers['Authorization'] = authToken;
      }
      
      // Forward the FormData directly to the API
      const response = await fetch(apiUrl, {
        method: method,
        headers,
        body: formData, // Send the FormData as is
      });
      
      // Get the response as JSON
      const result = await response.json();
      console.log('API response:', result);
      
      // Return the response
      return Response.json(result);
    }
    else {
      // Handle JSON requests (existing functionality)
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
      const authToken = request.headers.get('authorization');
      if (authToken) {
        options.headers['Authorization'] = authToken;
      }
      
      // Forward the request to the actual API
      const response = await fetch(apiUrl, options);
      
      // Get the response as JSON
      const result = await response.json();
      console.log('API response:', result);
      
      // Return the response
      return Response.json(result);
    }
  } catch (error) {
    console.error('API proxy error:', error);
    return Response.json(
      { error: 'Failed to fetch data from API', details: error.message },
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
    return Response.json(result);
  } catch (error) {
    console.error('API proxy error:', error);
    return Response.json(
      { error: 'Failed to fetch data from API' },
      { status: 500 }
    );
  }
} 