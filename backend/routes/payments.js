import express from 'express';
import Payment from '../models/Payment.js';
import { validatePayment } from '../middleware/validation.js';

const router = express.Router();

// GET all payments
router.get('/', async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('trip')
      .populate('customer')
      .populate('company');
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

// GET payment by ID
router.get('/:id', async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('trip')
      .populate('customer')
      .populate('company');
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    next(error);
  }
});

// CREATE payment
router.post('/', validatePayment, async (req, res, next) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    await payment.populate(['trip', 'customer', 'company']);
    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
});

// UPDATE payment
router.put('/:id', validatePayment, async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate(['trip', 'customer', 'company']);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    next(error);
  }
});

// DELETE payment
router.delete('/:id', async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET payments by customer
router.get('/customer/:customerId', async (req, res, next) => {
  try {
    const payments = await Payment.find({ customer: req.params.customerId })
      .populate('trip')
      .populate('company');
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

// GET payment statistics
router.get('/stats/summary', async (req, res, next) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    const totalAmount = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    res.json({
      totalPayments,
      completedPayments,
      totalAmount: totalAmount[0]?.total || 0
    });
  } catch (error) {
    next(error);
  }
});

export default router;

