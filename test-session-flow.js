// Simple test script to verify session flow
const axios = require('axios');

const BASE_URL = 'https://erimuga-backend.onrender.com';

async function testSessionFlow() {
  try {
    console.log('🧪 Testing session flow...\n');

    // Test 1: Create a test session
    console.log('1. Creating test session...');
    const createRes = await axios.get(`${BASE_URL}/user/auth/test-session-create`, {
      withCredentials: true
    });
    console.log('✅ Test session created:', createRes.data);

    // Test 2: Read the test session
    console.log('\n2. Reading test session...');
    const readRes = await axios.get(`${BASE_URL}/user/auth/test-session-read`, {
      withCredentials: true
    });
    console.log('✅ Test session read:', readRes.data);

    // Test 3: Check session endpoint
    console.log('\n3. Checking session endpoint...');
    const checkRes = await axios.get(`${BASE_URL}/user/auth/check-session`, {
      withCredentials: true
    });
    console.log('✅ Session check:', checkRes.data);

    console.log('\n🎉 Session flow test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testSessionFlow();
