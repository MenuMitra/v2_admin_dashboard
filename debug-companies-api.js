// Debug script to test the companies API
const axios = require('axios');

async function testCompaniesAPI() {
  try {
    const response = await axios.post('https://menusmitra.xyz/v2.3/admin/list_companies', {
      user_id: userId
    }, {
      headers: {
        'Content-Type': 'application/json',
        // Note: You'll need to add a valid token here
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    console.log('Full Response:', JSON.stringify(response.data, null, 2));
    console.log('Response Keys:', Object.keys(response.data));
    
    if (response.data.data) {
      console.log('Data Array:', response.data.data);
      console.log('Data Length:', response.data.data.length);
    }
    
    if (response.data.companies) {
      console.log('Companies Array:', response.data.companies);
      console.log('Companies Length:', response.data.companies.length);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Uncomment to run: testCompaniesAPI();