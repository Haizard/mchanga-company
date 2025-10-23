import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const testEndpoints = async () => {
  console.log('🧪 Starting API Verification Tests...\n');

  try {
    // Test Health Check
    console.log('✓ Testing Health Check...');
    const healthRes = await axios.get('http://localhost:5000/api/health');
    console.log('  Status:', healthRes.data.status);

    // Test Customers
    console.log('\n✓ Testing Customers Endpoint...');
    const customersRes = await axios.get(`${API_URL}/customers`);
    console.log(`  Found ${customersRes.data.length} customers`);

    // Test Vehicles
    console.log('\n✓ Testing Vehicles Endpoint...');
    const vehiclesRes = await axios.get(`${API_URL}/vehicles`);
    console.log(`  Found ${vehiclesRes.data.length} vehicles`);

    // Test Services
    console.log('\n✓ Testing Services Endpoint...');
    const servicesRes = await axios.get(`${API_URL}/services`);
    console.log(`  Found ${servicesRes.data.length} services`);

    // Test Payments
    console.log('\n✓ Testing Payments Endpoint...');
    const paymentsRes = await axios.get(`${API_URL}/payments`);
    console.log(`  Found ${paymentsRes.data.length} payments`);

    // Test Trips
    console.log('\n✓ Testing Trips Endpoint...');
    const tripsRes = await axios.get(`${API_URL}/trips`);
    console.log(`  Found ${tripsRes.data.length} trips`);

    // Test Emergencies
    console.log('\n✓ Testing Emergencies Endpoint...');
    const emergenciesRes = await axios.get(`${API_URL}/emergencies`);
    console.log(`  Found ${emergenciesRes.data.length} emergencies`);

    // Test Companies
    console.log('\n✓ Testing Companies Endpoint...');
    const companiesRes = await axios.get(`${API_URL}/companies`);
    console.log(`  Found ${companiesRes.data.length} companies`);

    console.log('\n✅ All API endpoints are working correctly!\n');
    return true;
  } catch (error) {
    console.error('\n❌ API Verification Failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
};

testEndpoints();

