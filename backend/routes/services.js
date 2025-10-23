import express from 'express';
import Service from '../models/Service.js';
import { validateService } from '../middleware/validation.js';

const router = express.Router();

// GET all services
router.get('/', async (req, res, next) => {
  try {
    const services = await Service.find()
      .populate('vehicle')
      .populate('company');
    res.json(services);
  } catch (error) {
    next(error);
  }
});

// GET service by ID
router.get('/:id', async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('vehicle')
      .populate('company');
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    next(error);
  }
});

// CREATE service
router.post('/', validateService, async (req, res, next) => {
  try {
    const service = new Service(req.body);
    await service.save();
    await service.populate(['vehicle', 'company']);
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
});

// UPDATE service
router.put('/:id', validateService, async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate(['vehicle', 'company']);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    next(error);
  }
});

// DELETE service
router.delete('/:id', async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET services by vehicle
router.get('/vehicle/:vehicleId', async (req, res, next) => {
  try {
    const services = await Service.find({ vehicle: req.params.vehicleId })
      .populate('company');
    res.json(services);
  } catch (error) {
    next(error);
  }
});

// GET scheduled services
router.get('/status/scheduled', async (req, res, next) => {
  try {
    const services = await Service.find({ status: 'scheduled' })
      .populate('vehicle')
      .populate('company');
    res.json(services);
  } catch (error) {
    next(error);
  }
});

export default router;

