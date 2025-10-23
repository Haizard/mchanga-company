import express from 'express';
import Customer from '../models/Customer.js';
import { validateCustomer } from '../middleware/validation.js';

const router = express.Router();

// GET all customers
router.get('/', async (req, res, next) => {
  try {
    const customers = await Customer.find().populate('company');
    res.json(customers);
  } catch (error) {
    next(error);
  }
});

// GET customer by ID
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('company');
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// CREATE customer
router.post('/', validateCustomer, async (req, res, next) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    await customer.populate('company');
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
});

// UPDATE customer
router.put('/:id', validateCustomer, async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('company');
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// DELETE customer
router.delete('/:id', async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET customer statistics
router.get('/:id/stats', async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({
      totalTrips: customer.totalTrips,
      totalSpent: customer.totalSpent,
      accountBalance: customer.accountBalance,
      status: customer.status
    });
  } catch (error) {
    next(error);
  }
});

export default router;

