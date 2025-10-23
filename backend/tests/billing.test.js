import billingService from '../services/billingService.js';
import Trip from '../models/Trip.js';
import Payment from '../models/Payment.js';
import Customer from '../models/Customer.js';
import Vehicle from '../models/Vehicle.js';
import mongoose from 'mongoose';

describe('Billing Service', () => {
  let customerId, vehicleId, tripIds = [];

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mchanga-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('should calculate customer billing', async () => {
    // Create test customer
    const customer = new Customer({
      firstName: 'Test',
      lastName: 'Customer',
      email: `test-${Date.now()}@test.com`,
      phone: '1234567890'
    });
    await customer.save();
    customerId = customer._id;

    // Create test vehicle
    const vehicle = new Vehicle({
      registrationNumber: `REG-${Date.now()}`,
      make: 'Test',
      model: 'Vehicle',
      year: 2024,
      licensePlate: `LP-${Date.now()}`
    });
    await vehicle.save();
    vehicleId = vehicle._id;

    // Create test trips
    for (let i = 0; i < 3; i++) {
      const trip = new Trip({
        tripNumber: `TRIP-${Date.now()}-${i}`,
        vehicle: vehicleId,
        customer: customerId,
        startTime: new Date(),
        fare: 500,
        status: 'completed',
        paymentStatus: 'pending'
      });
      await trip.save();
      tripIds.push(trip._id);
    }

    // Test billing calculation
    const billing = await billingService.calculateCustomerBilling(customerId, 1000);
    
    expect(billing.customerId).toBe(customerId.toString());
    expect(billing.tripCount).toBe(3);
    expect(billing.totalAmount).toBe(3000);
    expect(billing.trips.length).toBe(3);
  });

  test('should generate payment from trips', async () => {
    const result = await billingService.generatePaymentFromTrips(
      customerId,
      tripIds,
      'cash',
      1000
    );

    expect(result.payment).toBeDefined();
    expect(result.payment.paymentNumber).toBeDefined();
    expect(result.tripCount).toBe(3);
    expect(result.totalAmount).toBe(3000);

    // Verify trips are marked as paid
    const updatedTrips = await Trip.find({ _id: { $in: tripIds } });
    updatedTrips.forEach(trip => {
      expect(trip.paymentStatus).toBe('paid');
    });
  });

  test('should get vehicle billing info', async () => {
    const vehicleBilling = await billingService.getVehicleBillingInfo(vehicleId, 1000);

    expect(vehicleBilling.vehicleId).toBe(vehicleId.toString());
    expect(vehicleBilling.totalTrips).toBeGreaterThan(0);
    expect(vehicleBilling.totalRevenue).toBeGreaterThan(0);
  });

  test('should get billing statistics', async () => {
    const stats = await billingService.getBillingStatistics();

    expect(stats.trips).toBeDefined();
    expect(stats.payments).toBeDefined();
    expect(stats.revenue).toBeDefined();
    expect(stats.trips.total).toBeGreaterThanOrEqual(0);
  });
});

