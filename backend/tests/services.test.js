import mongoose from 'mongoose';
import trackingService from '../services/trackingService.js';
import emergencyService from '../services/emergencyService.js';
import schedulingService from '../services/schedulingService.js';
import reportService from '../services/reportService.js';
import Vehicle from '../models/Vehicle.js';
import Emergency from '../models/Emergency.js';
import Service from '../models/Service.js';
import Company from '../models/Company.js';

describe('Backend Services', () => {
  let company, vehicle, io;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mchanga-test');
    
    // Mock io object
    io = {
      emit: jest.fn(),
      to: jest.fn().mockReturnThis()
    };
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    company = await Company.create({
      name: 'Test Company',
      email: 'test@company.com',
      phone: '1234567890',
      address: '123 Main St'
    });

    vehicle = await Vehicle.create({
      make: 'Toyota',
      model: 'Hiace',
      licensePlate: 'KBZ-123A',
      company: company._id,
      status: 'active'
    });
  });

  describe('Tracking Service', () => {
    it('should start tracking a vehicle', async () => {
      const tracking = await trackingService.startTracking(vehicle._id, io);
      expect(tracking).toHaveProperty('vehicleId');
      expect(tracking.status).toBe('tracking');
    });

    it('should update vehicle location', async () => {
      await trackingService.startTracking(vehicle._id, io);
      const updated = await trackingService.updateLocation(
        vehicle._id,
        -1.2921,
        36.8219,
        io
      );
      expect(updated.currentLocation.latitude).toBe(-1.2921);
    });

    it('should stop tracking', () => {
      trackingService.startTracking(vehicle._id, io);
      const stopped = trackingService.stopTracking(vehicle._id);
      expect(stopped.status).toBe('stopped');
    });

    it('should get tracking data', async () => {
      await trackingService.startTracking(vehicle._id, io);
      const data = trackingService.getTrackingData(vehicle._id);
      expect(data).not.toBeNull();
    });

    it('should calculate distance correctly', () => {
      const point1 = { latitude: 0, longitude: 0 };
      const point2 = { latitude: 0.01, longitude: 0.01 };
      const distance = trackingService.calculateDistance(point1, point2);
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('Emergency Service', () => {
    it('should create an emergency alert', async () => {
      const emergency = await emergencyService.createAlert({
        vehicle: vehicle._id,
        emergencyType: 'breakdown',
        severity: 'high',
        description: 'Engine failure',
        location: { latitude: -1.2921, longitude: 36.8219 }
      }, io);

      expect(emergency).toHaveProperty('_id');
      expect(emergency.severity).toBe('high');
    });

    it('should get critical alerts', async () => {
      await Emergency.create({
        vehicle: vehicle._id,
        emergencyType: 'accident',
        severity: 'critical',
        description: 'Severe accident',
        status: 'reported',
        location: { latitude: -1.2921, longitude: 36.8219 }
      });

      const alerts = await emergencyService.getCriticalAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should update alert status', async () => {
      const emergency = await Emergency.create({
        vehicle: vehicle._id,
        emergencyType: 'breakdown',
        severity: 'high',
        description: 'Test',
        status: 'reported',
        location: { latitude: -1.2921, longitude: 36.8219 }
      });

      const updated = await emergencyService.updateAlertStatus(
        emergency._id,
        'in-progress',
        io
      );
      expect(updated.status).toBe('in-progress');
    });

    it('should get alert statistics', async () => {
      const stats = await emergencyService.getAlertStatistics();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('critical');
      expect(stats).toHaveProperty('active');
    });
  });

  describe('Scheduling Service', () => {
    it('should schedule a service', async () => {
      const service = await schedulingService.scheduleService({
        vehicle: vehicle._id,
        serviceType: 'maintenance',
        serviceDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        cost: 150,
        description: 'Regular maintenance'
      }, io);

      expect(service).toHaveProperty('_id');
      expect(service.serviceType).toBe('maintenance');
    });

    it('should get upcoming services', async () => {
      const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      await Service.create({
        vehicle: vehicle._id,
        company: company._id,
        serviceType: 'maintenance',
        serviceDate: futureDate,
        cost: 100,
        status: 'scheduled'
      });

      const services = await schedulingService.getUpcomingServices(7);
      expect(services.length).toBeGreaterThan(0);
    });

    it('should get overdue services', async () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      await Service.create({
        vehicle: vehicle._id,
        company: company._id,
        serviceType: 'repair',
        serviceDate: pastDate,
        cost: 200,
        status: 'scheduled'
      });

      const services = await schedulingService.getOverdueServices();
      expect(services.length).toBeGreaterThan(0);
    });

    it('should get service statistics', async () => {
      const stats = await schedulingService.getServiceStatistics();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('scheduled');
      expect(stats).toHaveProperty('completed');
    });
  });

  describe('Report Service', () => {
    it('should generate trip report', async () => {
      const report = await reportService.generateTripReport();
      expect(report.reportType).toBe('Trip Report');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('data');
    });

    it('should generate revenue report', async () => {
      const report = await reportService.generateRevenueReport();
      expect(report.reportType).toBe('Revenue Report');
      expect(report.summary).toHaveProperty('totalRevenue');
    });

    it('should generate vehicle report', async () => {
      const report = await reportService.generateVehicleReport();
      expect(report.reportType).toBe('Vehicle Performance Report');
      expect(report.summary).toHaveProperty('totalVehicles');
    });

    it('should generate customer report', async () => {
      const report = await reportService.generateCustomerReport();
      expect(report.reportType).toBe('Customer Report');
      expect(report.summary).toHaveProperty('totalCustomers');
    });

    it('should export to CSV', async () => {
      const report = await reportService.generateTripReport();
      const csv = reportService.exportToCSV(report);
      expect(csv).toContain('Trip Report');
      expect(typeof csv).toBe('string');
    });

    it('should export to JSON', async () => {
      const report = await reportService.generateTripReport();
      const json = reportService.exportToJSON(report);
      expect(json).toContain('Trip Report');
      expect(typeof json).toBe('string');
    });
  });
});

