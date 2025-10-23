import express from 'express';
import Vehicle from '../models/Vehicle.js';
import { validateVehicle } from '../middleware/validation.js';

const router = express.Router();

// GET all vehicles
router.get('/', async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find().populate('company');
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
});

// GET vehicle by ID
router.get('/:id', async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('company');
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
});

// CREATE vehicle
router.post('/', validateVehicle, async (req, res, next) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    await vehicle.populate('company');
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
});

// UPDATE vehicle
router.put('/:id', validateVehicle, async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('company');
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
});

// DELETE vehicle
router.delete('/:id', async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// UPDATE vehicle location
router.patch('/:id/location', async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }
    
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        currentLocation: {
          latitude,
          longitude,
          lastUpdated: new Date()
        }
      },
      { new: true }
    );
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
});

export default router;

