import express from 'express';
import Emergency from '../models/Emergency.js';
import { validateEmergency } from '../middleware/validation.js';

const router = express.Router();

// GET all emergencies
router.get('/', async (req, res, next) => {
  try {
    const emergencies = await Emergency.find()
      .populate('vehicle')
      .populate('trip')
      .populate('company');
    res.json(emergencies);
  } catch (error) {
    next(error);
  }
});

// GET emergency by ID
router.get('/:id', async (req, res, next) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate('vehicle')
      .populate('trip')
      .populate('company');
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }
    res.json(emergency);
  } catch (error) {
    next(error);
  }
});

// CREATE emergency
router.post('/', validateEmergency, async (req, res, next) => {
  try {
    const emergency = new Emergency(req.body);
    await emergency.save();
    await emergency.populate(['vehicle', 'trip', 'company']);
    res.status(201).json(emergency);
  } catch (error) {
    next(error);
  }
});

// UPDATE emergency
router.put('/:id', validateEmergency, async (req, res, next) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate(['vehicle', 'trip', 'company']);
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }
    res.json(emergency);
  } catch (error) {
    next(error);
  }
});

// DELETE emergency
router.delete('/:id', async (req, res, next) => {
  try {
    const emergency = await Emergency.findByIdAndDelete(req.params.id);
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }
    res.json({ message: 'Emergency deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET emergencies by vehicle
router.get('/vehicle/:vehicleId', async (req, res, next) => {
  try {
    const emergencies = await Emergency.find({ vehicle: req.params.vehicleId })
      .populate('trip')
      .populate('company');
    res.json(emergencies);
  } catch (error) {
    next(error);
  }
});

// GET active emergencies
router.get('/status/active', async (req, res, next) => {
  try {
    const emergencies = await Emergency.find({
      status: { $in: ['reported', 'in-progress'] }
    })
      .populate('vehicle')
      .populate('trip')
      .populate('company');
    res.json(emergencies);
  } catch (error) {
    next(error);
  }
});

// GET critical emergencies
router.get('/severity/critical', async (req, res, next) => {
  try {
    const emergencies = await Emergency.find({ severity: 'critical' })
      .populate('vehicle')
      .populate('trip')
      .populate('company');
    res.json(emergencies);
  } catch (error) {
    next(error);
  }
});

export default router;

