// Simple test script to verify authentication endpoints
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Test authentication endpoints
async function testAuth() {
  try {
    console.log('🧪 Testing authentication endpoints...\n');

    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running:', health.data);

    // Test 2: Test session validation (should fail without session)
    console.log('\n2. Testing session validation (no session)...');
    try {
      const sessionCheck = await axios.get(`${BASE_URL}/user/auth/validate-session`, {
        withCredentials: true
      });
      console.log('Session check result:', sessionCheck.data);
    } catch (error) {
      console.log('❌ Expected error (no session):', error.response?.data || error.message);
    }

    // Test 3: Test registration
    console.log('\n3. Testing user registration...');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123',
      userType: 'user'
    };

    try {
      const register = await axios.post(`${BASE_URL}/user/auth/register`, testUser);
      console.log('✅ Registration successful:', register.data);
    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data || error.message);
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
    }

    // Test 5: Test session validation (should succeed after login)
    console.log('\n5. Testing session validation (after login)...');
    try {
      const sessionCheck = await axios.get(`${BASE_URL}/user/auth/validate-session`, {
        withCredentials: true
      });
      console.log('✅ Session validation successful:', sessionCheck.data);
    } catch (error) {
      console.log('❌ Session validation failed:', error.response?.data || error.message);
    }

    // Test 6: Test logout
    console.log('\n6. Testing user logout...');
    try {
      const logout = await axios.post(`${BASE_URL}/user/auth/logout`, {}, {
        withCredentials: true
      });
      console.log('✅ Logout successful:', logout.data);
    } catch (error) {
      console.log('❌ Logout failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 Authentication tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAuth();
}

export default testAuth;
