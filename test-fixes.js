/**
 * Test script to verify authentication and clickstream fixes
 */

const API_BASE = 'http://localhost:5000/api';

async function testRegistration() {
  console.log('🧪 Testing Registration...');
  
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'password123'
  };
  
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const result = await response.json();
    
    console.log('✅ Registration Response:', {
      success: result.success,
      hasUser: !!result.user,
      hasToken: !!result.token,
      username: result.user?.username
    });
    
    return result;
  } catch (error) {
    console.error('❌ Registration Error:', error.message);
    return null;
  }
}

async function testClickstreamEndpoint(username) {
  console.log('🧪 Testing Clickstream Endpoint...');
  
  try {
    const response = await fetch(`${API_BASE}/clickstream/user/${username}`);
    const result = await response.json();
    
    console.log('✅ Clickstream Response:', {
      success: result.success,
      userId: result.userId,
      totalActions: result.totalActions,
      hasData: !!result.data
    });
    
    return result;
  } catch (error) {
    console.error('❌ Clickstream Error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Authentication & Clickstream Tests\n');
  
  // Test 1: Registration with token
  const registrationResult = await testRegistration();
  
  if (registrationResult && registrationResult.success) {
    console.log('\n✅ Registration Test: PASSED');
    
    // Test 2: Clickstream endpoint
    const clickstreamResult = await testClickstreamEndpoint(registrationResult.user.username);
    
    if (clickstreamResult && clickstreamResult.success) {
      console.log('✅ Clickstream Test: PASSED');
    } else {
      console.log('❌ Clickstream Test: FAILED');
    }
  } else {
    console.log('\n❌ Registration Test: FAILED');
  }
  
  console.log('\n🏁 Tests Complete');
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  runTests();
}
