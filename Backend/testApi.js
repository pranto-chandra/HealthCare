import axios from 'axios';

const API_BASE = 'http://localhost:5000';

async function testApi() {
  try {
    console.log('\n🧪 ===================  API ENDPOINT TEST ==================\n');

    // 1. Login as Pathologist
    console.log('1️⃣  Logging in as pathologist...');
    let response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'pathologist@healthcare.com',
      password: 'pathologist123',
    });
    const token = response.data.data.token;
    console.log(`    ✅ Token obtained: ${token.substring(0, 20)}...`);

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Get pathologist profile
    console.log('\n2️⃣  Getting pathologist profile...');
    response = await axios.get(`${API_BASE}/pathologists/profile`, { headers });
    console.log(`    ✅ Profile:`, JSON.stringify(response.data.data, null, 2));

    // 3. Get recommended tests
    console.log('\n3️⃣  Getting RECOMMENDED tests (GET /pathologists/tests/recommended)...');
    response = await axios.get(`${API_BASE}/pathologists/tests/recommended`, { headers });
    console.log(`    Found ${response.data.data.length} test(s)`);
    response.data.data.forEach((test, i) => {
      console.log(`    [${i + 1}] ${test.testName}`);
      console.log(`        Status: ${test.status}`);
      console.log(`        Patient: ${test.patient?.name}`);
      console.log(`        Doctor: ${test.doctor?.name}`);
    });

    // 4. Get my tests
    console.log('\n4️⃣  Getting MY TESTS (GET /pathologists/tests/my)...');
    response = await axios.get(`${API_BASE}/pathologists/tests/my`, { headers });
    console.log(`    Found ${response.data.data.length} test(s)`);
    response.data.data.forEach((test, i) => {
      console.log(`    [${i + 1}] ${test.testName}`);
      console.log(`        Status: ${test.status}`);
    });

    console.log('\n✅ API testing complete\n');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testApi();
