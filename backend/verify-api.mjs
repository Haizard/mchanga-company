import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testEndpoints() {
  console.log('🧪 Starting API Verification Tests...\n');

  try {
    // Test Customers
    console.log('✓ Testing Customers Endpoint...');
    const customersRes = await axios.get(`${API_URL}/customers`);
    console.log(`  Found ${customersRes.data.length} customers`);

    // Test Vehicles
    console.log('✓ Testing Vehicles Endpoint...');
    const vehiclesRes = await axios.get(`${API_URL}/vehicles`);
    console.log(`  Found ${vehiclesRes.data.length} vehicles`);

    // Test Services
    console.log('✓ Testing Services Endpoint...');
    const servicesRes = await axios.get(`${API_URL}/services`);
    console.log(`  Found ${servicesRes.data.length} services`);

    // Test Payments
    console.log('✓ Testing Payments Endpoint...');
    const paymentsRes = await axios.get(`${API_URL}/payments`);
    console.log(`  Found ${paymentsRes.data.length} payments`);

    // Test Trips
    console.log('✓ Testing Trips Endpoint...');
    const tripsRes = await axios.get(`${API_URL}/trips`);
    console.log(`  Found ${tripsRes.data.length} trips`);

    // Test Emergencies
    console.log('✓ Testing Emergencies Endpoint...');
    const emergenciesRes = await axios.get(`${API_URL}/emergencies`);
    console.log(`  Found ${emergenciesRes.data.length} emergencies`);

    console.log('\n✅ All API endpoints are working correctly!\n');
  } catch (error) {
    console.error('\n❌ API Verification Failed:');
    console.error('Error:', error.message);
  }
}

testEndpoints();

