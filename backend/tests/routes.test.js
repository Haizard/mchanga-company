import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import companiesRouter from '../routes/companies.js';
import vehiclesRouter from '../routes/vehicles.js';
import customersRouter from '../routes/customers.js';
import Company from '../models/Company.js';
import Vehicle from '../models/Vehicle.js';
import Customer from '../models/Customer.js';

const app = express();
app.use(express.json());
app.use('/api/companies', companiesRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/customers', customersRouter);

describe('API Routes', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mchanga-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Companies Routes', () => {
    it('should create a new company', async () => {
      const res = await request(app)
        .post('/api/companies')
        .send({
          name: 'Test Company',
          email: 'test@company.com',
          phone: '1234567890',
          address: '123 Main St'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('Test Company');
    });

    it('should get all companies', async () => {
      const res = await request(app).get('/api/companies');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get a company by ID', async () => {
      const company = await Company.create({
        name: 'Get Test Company',
        email: 'get@test.com',
        phone: '9876543210',
        address: '456 Oak Ave'
      });

      const res = await request(app).get(`/api/companies/${company._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body._id.toString()).toBe(company._id.toString());
    });

    it('should update a company', async () => {
      const company = await Company.create({
        name: 'Update Test Company',
        email: 'update@test.com',
        phone: '5555555555',
        address: '789 Pine Rd'
      });

      const res = await request(app)
        .put(`/api/companies/${company._id}`)
        .send({ name: 'Updated Company Name' });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated Company Name');
    });

    it('should delete a company', async () => {
      const company = await Company.create({
        name: 'Delete Test Company',
        email: 'delete@test.com',
        phone: '4444444444',
        address: '321 Elm St'
      });

      const res = await request(app).delete(`/api/companies/${company._id}`);
      expect(res.statusCode).toBe(200);

      const deleted = await Company.findById(company._id);
      expect(deleted).toBeNull();
    });
  });

  describe('Vehicles Routes', () => {
    let company;

    beforeEach(async () => {
      company = await Company.create({
        name: 'Vehicle Test Company',
        email: 'vehicle@test.com',
        phone: '1111111111',
        address: '111 Test St'
      });
    });

    it('should create a new vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .send({
          make: 'Toyota',
          model: 'Hiace',
          licensePlate: 'KBZ-123A',
          company: company._id,
          status: 'active'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.make).toBe('Toyota');
    });

    it('should get all vehicles', async () => {
      const res = await request(app).get('/api/vehicles');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should update vehicle location', async () => {
      const vehicle = await Vehicle.create({
        make: 'Nissan',
        model: 'Caravan',
        licensePlate: 'KBZ-456B',
        company: company._id,
        status: 'active'
      });

      const res = await request(app)
        .patch(`/api/vehicles/${vehicle._id}/location`)
        .send({
          latitude: -1.2921,
          longitude: 36.8219
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.currentLocation.latitude).toBe(-1.2921);
    });
  });

  describe('Customers Routes', () => {
    it('should create a new customer', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '0712345678',
          status: 'active'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.firstName).toBe('John');
    });

    it('should get customer statistics', async () => {
      const customer = await Customer.create({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '0787654321',
        status: 'active'
      });

      const res = await request(app).get(`/api/customers/${customer._id}/stats`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalTrips');
      expect(res.body).toHaveProperty('totalSpent');
    });
  });
});

