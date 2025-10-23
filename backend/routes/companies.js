import express from 'express';
import Company from '../models/Company.js';
import { validateCompany } from '../middleware/validation.js';

const router = express.Router();

// GET all companies
router.get('/', async (req, res, next) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (error) {
    next(error);
  }
});

// GET company by ID
router.get('/:id', async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    next(error);
  }
});

// CREATE company
router.post('/', validateCompany, async (req, res, next) => {
  try {
    const company = new Company(req.body);
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
});

// UPDATE company
router.put('/:id', validateCompany, async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    next(error);
  }
});

// DELETE company
router.delete('/:id', async (req, res, next) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

