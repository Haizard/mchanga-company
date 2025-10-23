import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { setupTrackingHandlers } from './websocket/trackingHandler.js';
import { setupEmergencyHandlers } from './websocket/emergencyHandler.js';
import { setupSchedulingHandlers } from './websocket/schedulingHandler.js';

// Import routes
import companiesRouter from './routes/companies.js';
import vehiclesRouter from './routes/vehicles.js';
import customersRouter from './routes/customers.js';
import tripsRouter from './routes/trips.js';
import paymentsRouter from './routes/payments.js';
import servicesRouter from './routes/services.js';
import fuelRouter from './routes/fuel.js';
import emergenciesRouter from './routes/emergencies.js';
import reportsRouter from './routes/reports.js';
import billingRouter from './routes/billing.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with Retry Logic
const connectDB = async (retries = 5) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mchanga', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (retries > 0) {
      console.error(`MongoDB connection failed. Retrying in 3 seconds... (${retries} retries left)`);
      console.error(`Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return connectDB(retries - 1);
    } else {
      console.error(`MongoDB connection failed after multiple retries`);
      console.error(`Error: ${error.message}`);
      console.error(`\n⚠️  WARNING: Running in offline mode. Some features may not work.`);
      console.error(`Please check your internet connection and MongoDB Atlas status.`);
      // Don't exit - allow server to run in degraded mode
    }
  }
};

connectDB();

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date() });
});

// API Routes
app.use('/api/companies', companiesRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/customers', customersRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/fuel', fuelRouter);
app.use('/api/emergencies', emergenciesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/billing', billingRouter);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Setup WebSocket handlers
setupTrackingHandlers(io);
setupEmergencyHandlers(io);
setupSchedulingHandlers(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for real-time tracking`);
  console.log(`API Documentation:`);
  console.log(`  GET  /api/health - Health check`);
  console.log(`  GET  /api/companies - List all companies`);
  console.log(`  GET  /api/vehicles - List all vehicles`);
  console.log(`  GET  /api/customers - List all customers`);
  console.log(`  GET  /api/trips - List all trips`);
  console.log(`  GET  /api/payments - List all payments`);
  console.log(`  GET  /api/services - List all services`);
  console.log(`  GET  /api/fuel - List all fuel records`);
  console.log(`  GET  /api/emergencies - List all emergencies`);
  console.log(`\nWebSocket Events:`);
  console.log(`  subscribe-tracking - Subscribe to vehicle tracking`);
  console.log(`  start-tracking - Start tracking a vehicle`);
  console.log(`  update-location - Update vehicle location`);
  console.log(`  get-stats - Get tracking statistics`);
});

