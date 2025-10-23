import express from 'express';
import Fuel from '../models/Fuel.js';
import { validateFuel } from '../middleware/validation.js';

const router = express.Router();

// GET all fuel records
router.get('/', async (req, res, next) => {
  try {
    const fuel = await Fuel.find()
      .populate('vehicle')
      .populate('company');
    res.json(fuel);
  } catch (error) {
    next(error);
  }
});

// GET fuel record by ID
router.get('/:id', async (req, res, next) => {
  try {
    const fuel = await Fuel.findById(req.params.id)
      .populate('vehicle')
      .populate('company');
    if (!fuel) {
      return res.status(404).json({ error: 'Fuel record not found' });
    }
    res.json(fuel);
  } catch (error) {
    next(error);
  }
});

// CREATE fuel record
router.post('/', validateFuel, async (req, res, next) => {
  try {
    const fuel = new Fuel(req.body);
    await fuel.save();
    await fuel.populate(['vehicle', 'company']);
    res.status(201).json(fuel);
  } catch (error) {
    next(error);
  }
});

// UPDATE fuel record
router.put('/:id', validateFuel, async (req, res, next) => {
  try {
    const fuel = await Fuel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate(['vehicle', 'company']);
    if (!fuel) {
      return res.status(404).json({ error: 'Fuel record not found' });
    }
    res.json(fuel);
  } catch (error) {
    next(error);
  }
});

// DELETE fuel record
router.delete('/:id', async (req, res, next) => {
  try {
    const fuel = await Fuel.findByIdAndDelete(req.params.id);
    if (!fuel) {
      return res.status(404).json({ error: 'Fuel record not found' });
    }
    res.json({ message: 'Fuel record deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET fuel records by vehicle
router.get('/vehicle/:vehicleId', async (req, res, next) => {
  try {
    const fuel = await Fuel.find({ vehicle: req.params.vehicleId })
      .populate('company');
    res.json(fuel);
  } catch (error) {
    next(error);
  }
});

// GET fuel consumption statistics
router.get('/stats/consumption', async (req, res, next) => {
  try {
    const stats = await Fuel.aggregate([
      {
        $group: {
          _id: '$vehicle',
          totalQuantity: { $sum: '$quantityAdded' },
          totalCost: { $sum: '$cost' },
          averageCost: { $avg: '$cost' }
        }
      }
    ]);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;

