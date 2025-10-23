import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import companiesRouter from '../routes/companies.js';
import vehiclesRouter from '../routes/vehicles.js';
import tripsRouter from '../routes/trips.js';
import paymentsRouter from '../routes/payments.js';
import Company from '../models/Company.js';
import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import Payment from '../models/Payment.js';
import Customer from '../models/Customer.js';

const app = express();
app.use(express.json());
app.use('/api/companies', companiesRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/payments', paymentsRouter);

describe('Integration Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mchanga-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Complete Workflow', () => {
    let company, vehicle, customer, trip, payment;

    it('should create company', async () => {
      const res = await request(app)
        .post('/api/companies')
        .send({
          name: 'Integration Test Company',
          email: 'integration@test.com',
          phone: '1234567890',
          address: '123 Test St'
        });

      expect(res.statusCode).toBe(201);
      company = res.body;
    });

    it('should create vehicle for company', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .send({
          make: 'Toyota',
          model: 'Hiace',
          licensePlate: 'KBZ-999Z',
          company: company._id,
          status: 'active'
        });

      expect(res.statusCode).toBe(201);
      vehicle = res.body;
    });

    it('should create customer', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send({
          firstName: 'Integration',
          lastName: 'Customer',
          email: 'customer@test.com',
          phone: '0712345678',
          status: 'active'
        });

      expect(res.statusCode).toBe(201);
      customer = res.body;
    });

    it('should create trip', async () => {
      const res = await request(app)
        .post('/api/trips')
        .send({
          tripNumber: 'TRIP-001',
          vehicle: vehicle._id,
          customer: customer._id,
          company: company._id,
          fare: 500,
          status: 'completed',
          startLocation: { latitude: -1.2921, longitude: 36.8219 },
          endLocation: { latitude: -1.3000, longitude: 36.8300 }
        });

      expect(res.statusCode).toBe(201);
      trip = res.body;
    });

    it('should create payment for trip', async () => {
      const res = await request(app)
        .post('/api/payments')
        .send({
          trip: trip._id,
          customer: customer._id,
          amount: 500,
          paymentMethod: 'cash',
          status: 'completed'
        });

      expect(res.statusCode).toBe(201);
      payment = res.body;
    });

    it('should retrieve complete trip data', async () => {
      const res = await request(app).get(`/api/trips/${trip._id}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.vehicle._id).toBe(vehicle._id.toString());
      expect(res.body.customer._id).toBe(customer._id.toString());
      expect(res.body.fare).toBe(500);
    });

    it('should get customer statistics', async () => {
      const res = await request(app).get(`/api/customers/${customer._id}/stats`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.totalTrips).toBeGreaterThan(0);
      expect(res.body.totalSpent).toBeGreaterThan(0);
    });

    it('should get vehicle statistics', async () => {
      const res = await request(app).get(`/api/vehicles/${vehicle._id}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.make).toBe('Toyota');
    });

    it('should update vehicle location', async () => {
      const res = await request(app)
        .patch(`/api/vehicles/${vehicle._id}/location`)
        .send({
          latitude: -1.3000,
          longitude: 36.8300
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.currentLocation.latitude).toBe(-1.3000);
    });

    it('should get payment statistics', async () => {
      const res = await request(app).get('/api/payments');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should delete trip', async () => {
      const res = await request(app).delete(`/api/trips/${trip._id}`);
      
      expect(res.statusCode).toBe(200);
    });

    it('should verify trip is deleted', async () => {
      const res = await request(app).get(`/api/trips/${trip._id}`);
      
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent company', async () => {
      const res = await request(app).get('/api/companies/invalid-id');
      expect(res.statusCode).toBe(404);
    });

    it('should return 400 for invalid company data', async () => {
      const res = await request(app)
        .post('/api/companies')
        .send({
          name: 'Test'
          // Missing required fields
        });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'invalid-email',
          phone: '1234567890'
        });

      expect(res.statusCode).toBe(400);
    });
  });
});

