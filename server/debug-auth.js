// Debug script to test authentication flow
import axios from 'axios';

const BASE_URL = 'https://erimuga-backend.onrender.com';

async function debugAuth() {
  try {
    console.log('🧪 Debugging authentication flow...\n');

    // Test 1: Check server health
    console.log('1. Testing server health...');
    try {
      const health = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Server health:', health.data);
    } catch (error) {
      console.log('❌ Server health failed:', error.message);
      return;
    }

    // Test 2: Test session endpoint
    console.log('\n2. Testing session endpoint...');
    try {
      const session = await axios.get(`${BASE_URL}/user/auth/test-session`, {
        withCredentials: true
      });
      console.log('✅ Session test:', session.data);
    } catch (error) {
      console.log('❌ Session test failed:', error.response?.data || error.message);
    }

    // Test 3: Test registration
    console.log('\n3. Testing user registration...');
    const testUser = {
      name: 'Debug User',
      email: `debug${Date.now()}@test.com`,
      password: 'debugpass123',
      userType: 'user'
    };

    try {
      const register = await axios.post(`${BASE_URL}/user/auth/register`, testUser);
      console.log('✅ Registration successful:', register.data);
    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data || error.message);
      return;
    }

    // Test 4: Test login
    console.log('\n4. Testing user login...');
    try {
      const login = await axios.post(`${BASE_URL}/user/auth/login`, {
        email: testUser.email,
        password: testUser.password
      }, { withCredentials: true });
      console.log('✅ Login successful:', login.data);
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data || error.message);
      return;
    }

    // Test 5: Test session validation after login
    console.log('\n5. Testing session validation after login...');
    try {
      const sessionCheck = await axios.get(`${BASE_URL}/user/auth/validate-session`, {
        withCredentials: true
      });
      console.log('✅ Session validation successful:', sessionCheck.data);
    } catch (error) {
      console.log('❌ Session validation failed:', error.response?.data || error.message);
    }

    // Test 6: Test orders endpoint
    console.log('\n6. Testing orders endpoint...');
    try {
      const orders = await axios.get(`${BASE_URL}/orders/user/${testUser.email}`, {
        withCredentials: true
      });
      console.log('✅ Orders endpoint successful:', orders.data);
    } catch (error) {
      console.log('❌ Orders endpoint failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 Debug completed!');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run debug if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  debugAuth();
}

export default debugAuth;
