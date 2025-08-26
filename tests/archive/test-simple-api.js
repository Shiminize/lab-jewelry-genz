/**
 * Simple API test to debug the 500 error
 */

async function testAPI() {
  try {
    console.log('Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/products/customizable/ring-001/assets?materialId=platinum');
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response body (first 500 chars):', text.substring(0, 500));
    
    // Try to parse as JSON if possible
    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Not valid JSON');
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testAPI();