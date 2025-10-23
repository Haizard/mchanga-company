import express from 'express';
import billingService from '../services/billingService.js';

const router = express.Router();

/**
 * GET /api/billing/customer/:customerId/trips
 * Get all completed trips for a customer that haven't been billed
 */
router.get('/customer/:customerId/trips', async (req, res, next) => {
  try {
    const trips = await billingService.getCustomerCompletedTrips(req.params.customerId);
    res.json(trips);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/billing/customer/:customerId/calculate
 * Calculate billing amount for a customer based on completed trips
 * Query params: pricePerTrip (default: 1000)
 */
router.get('/customer/:customerId/calculate', async (req, res, next) => {
  try {
    const pricePerTrip = req.query.pricePerTrip ? parseInt(req.query.pricePerTrip) : 1000;
    const billing = await billingService.calculateCustomerBilling(
      req.params.customerId,
      pricePerTrip
    );
    res.json(billing);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/billing/customer/:customerId/generate-payment
 * Generate a payment from completed trips
 * Body: { tripIds: [tripId1, tripId2, ...], paymentMethod: 'cash|card|mobile_money|bank_transfer', pricePerTrip: 1000 }
 */
router.post('/customer/:customerId/generate-payment', async (req, res, next) => {
  try {
    const { tripIds, paymentMethod, pricePerTrip = 1000 } = req.body;

    if (!tripIds || !Array.isArray(tripIds) || tripIds.length === 0) {
      return res.status(400).json({ error: 'tripIds array is required' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: 'paymentMethod is required' });
    }

    const result = await billingService.generatePaymentFromTrips(
      req.params.customerId,
      tripIds,
      paymentMethod,
      pricePerTrip
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/billing/summary
 * Get billing summary for all customers
 * Query params: pricePerTrip (default: 1000)
 */
router.get('/summary', async (req, res, next) => {
  try {
    const pricePerTrip = req.query.pricePerTrip ? parseInt(req.query.pricePerTrip) : 1000;
    const summary = await billingService.getAllCustomersBillingSummary(pricePerTrip);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/billing/vehicle/:vehicleId
 * Get billing information for a specific vehicle
 * Query params: pricePerTrip (default: 1000)
 */
router.get('/vehicle/:vehicleId', async (req, res, next) => {
  try {
    const pricePerTrip = req.query.pricePerTrip ? parseInt(req.query.pricePerTrip) : 1000;
    const vehicleBilling = await billingService.getVehicleBillingInfo(
      req.params.vehicleId,
      pricePerTrip
    );
    res.json(vehicleBilling);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/billing/statistics
 * Get overall billing statistics
 */
router.get('/statistics', async (req, res, next) => {
  try {
    const stats = await billingService.getBillingStatistics();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;

