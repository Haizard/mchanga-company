import express from 'express';
import Trip from '../models/Trip.js';
import { validateTrip } from '../middleware/validation.js';

const router = express.Router();

// GET all trips
router.get('/', async (req, res, next) => {
  try {
    const trips = await Trip.find()
      .populate('vehicle')
      .populate('customer')
      .populate('company');
    res.json(trips);
  } catch (error) {
    next(error);
  }
});

// GET trip by ID
router.get('/:id', async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicle')
      .populate('customer')
      .populate('company');
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    next(error);
  }
});

// CREATE trip
router.post('/', validateTrip, async (req, res, next) => {
  try {
    const trip = new Trip(req.body);
    await trip.save();
    await trip.populate(['vehicle', 'customer', 'company']);
    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
});

// UPDATE trip
router.put('/:id', validateTrip, async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate(['vehicle', 'customer', 'company']);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    next(error);
  }
});

// DELETE trip
router.delete('/:id', async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET trips by customer
router.get('/customer/:customerId', async (req, res, next) => {
  try {
    const trips = await Trip.find({ customer: req.params.customerId })
      .populate('vehicle')
      .populate('company');
    res.json(trips);
  } catch (error) {
    next(error);
  }
});

// GET trips by vehicle
router.get('/vehicle/:vehicleId', async (req, res, next) => {
  try {
    const trips = await Trip.find({ vehicle: req.params.vehicleId })
      .populate('customer')
      .populate('company');
    res.json(trips);
  } catch (error) {
    next(error);
  }
});

export default router;

