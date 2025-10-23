import express from 'express';
import reportService from '../services/reportService.js';

const router = express.Router();

// Generate trip report
router.post('/trip', async (req, res, next) => {
  try {
    const report = await reportService.generateTripReport(req.body);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

// Generate revenue report
router.post('/revenue', async (req, res, next) => {
  try {
    const report = await reportService.generateRevenueReport(req.body);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

// Generate vehicle performance report
router.post('/vehicle-performance', async (req, res, next) => {
  try {
    const report = await reportService.generateVehicleReport(req.body);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

// Generate customer report
router.post('/customer', async (req, res, next) => {
  try {
    const report = await reportService.generateCustomerReport(req.body);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

// Generate service report
router.post('/service', async (req, res, next) => {
  try {
    const report = await reportService.generateServiceReport(req.body);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

// Export report to CSV
router.post('/export/csv', async (req, res, next) => {
  try {
    const { reportType, filters } = req.body;
    
    let report;
    switch (reportType) {
      case 'trip':
        report = await reportService.generateTripReport(filters);
        break;
      case 'revenue':
        report = await reportService.generateRevenueReport(filters);
        break;
      case 'vehicle':
        report = await reportService.generateVehicleReport(filters);
        break;
      case 'customer':
        report = await reportService.generateCustomerReport(filters);
        break;
      case 'service':
        report = await reportService.generateServiceReport(filters);
        break;
      default:
        throw new Error('Invalid report type');
    }

    const csv = reportService.exportToCSV(report);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

// Export report to JSON
router.post('/export/json', async (req, res, next) => {
  try {
    const { reportType, filters } = req.body;
    
    let report;
    switch (reportType) {
      case 'trip':
        report = await reportService.generateTripReport(filters);
        break;
      case 'revenue':
        report = await reportService.generateRevenueReport(filters);
        break;
      case 'vehicle':
        report = await reportService.generateVehicleReport(filters);
        break;
      case 'customer':
        report = await reportService.generateCustomerReport(filters);
        break;
      case 'service':
        report = await reportService.generateServiceReport(filters);
        break;
      default:
        throw new Error('Invalid report type');
    }

    const json = reportService.exportToJSON(report);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.json"`);
    res.send(json);
  } catch (error) {
    next(error);
  }
});

export default router;

