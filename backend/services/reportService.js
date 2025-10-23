import Trip from '../models/Trip.js';
import Payment from '../models/Payment.js';
import Vehicle from '../models/Vehicle.js';
import Customer from '../models/Customer.js';
import Service from '../models/Service.js';

class ReportService {
  // Generate trip report
  async generateTripReport(filters = {}) {
    try {
      const query = {};
      
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
      }

      if (filters.status) query.status = filters.status;
      if (filters.vehicleId) query.vehicle = filters.vehicleId;
      if (filters.customerId) query.customer = filters.customerId;

      const trips = await Trip.find(query)
        .populate('vehicle')
        .populate('customer')
        .populate('company');

      const totalTrips = trips.length;
      const completedTrips = trips.filter(t => t.status === 'completed').length;
      const totalRevenue = trips.reduce((sum, t) => sum + t.fare, 0);
      const avgFare = totalTrips > 0 ? totalRevenue / totalTrips : 0;

      return {
        reportType: 'Trip Report',
        generatedAt: new Date(),
        filters,
        summary: {
          totalTrips,
          completedTrips,
          totalRevenue,
          averageFare: avgFare,
          completionRate: totalTrips > 0 ? ((completedTrips / totalTrips) * 100).toFixed(2) : 0
        },
        data: trips
      };
    } catch (error) {
      console.error('Error generating trip report:', error);
      throw error;
    }
  }

  // Generate revenue report
  async generateRevenueReport(filters = {}) {
    try {
      const query = {};

      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
      }

      const payments = await Payment.find(query)
        .populate('customer')
        .populate('trip');

      // Calculate revenue from all payments (not just completed)
      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
      const avgPayment = payments.length > 0 ? totalRevenue / payments.length : 0;

      // Count payments by status
      const byStatus = {};
      payments.forEach(p => {
        byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      });

      // Group by payment method
      const byMethod = {};
      payments.forEach(p => {
        byMethod[p.paymentMethod] = (byMethod[p.paymentMethod] || 0) + p.amount;
      });

      return {
        reportType: 'Revenue Report',
        generatedAt: new Date(),
        filters,
        summary: {
          totalRevenue,
          totalPayments: payments.length,
          averagePayment: avgPayment,
          byPaymentMethod: byMethod,
          byPaymentStatus: byStatus
        },
        data: payments
      };
    } catch (error) {
      console.error('Error generating revenue report:', error);
      throw error;
    }
  }

  // Generate vehicle performance report
  async generateVehicleReport(filters = {}) {
    try {
      const vehicles = await Vehicle.find().populate('company');

      const vehicleStats = await Promise.all(
        vehicles.map(async (vehicle) => {
          const trips = await Trip.find({ vehicle: vehicle._id });
          const completedTrips = trips.filter(t => t.status === 'completed');
          const totalRevenue = completedTrips.reduce((sum, t) => sum + t.fare, 0);
          const services = await Service.find({ vehicle: vehicle._id });

          return {
            vehicleId: vehicle._id,
            make: vehicle.make,
            model: vehicle.model,
            licensePlate: vehicle.licensePlate,
            totalTrips: trips.length,
            completedTrips: completedTrips.length,
            totalRevenue,
            totalServices: services.length,
            status: vehicle.status
          };
        })
      );

      return {
        reportType: 'Vehicle Performance Report',
        generatedAt: new Date(),
        filters,
        summary: {
          totalVehicles: vehicles.length,
          totalTrips: vehicleStats.reduce((sum, v) => sum + v.totalTrips, 0),
          totalRevenue: vehicleStats.reduce((sum, v) => sum + v.totalRevenue, 0)
        },
        data: vehicleStats
      };
    } catch (error) {
      console.error('Error generating vehicle report:', error);
      throw error;
    }
  }

  // Generate customer report
  async generateCustomerReport(filters = {}) {
    try {
      const customers = await Customer.find();

      const customerStats = await Promise.all(
        customers.map(async (customer) => {
          const trips = await Trip.find({ customer: customer._id });
          const payments = await Payment.find({ customer: customer._id });
          const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

          return {
            customerId: customer._id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            totalTrips: trips.length,
            totalSpent,
            accountBalance: customer.accountBalance,
            status: customer.status
          };
        })
      );

      return {
        reportType: 'Customer Report',
        generatedAt: new Date(),
        filters,
        summary: {
          totalCustomers: customers.length,
          totalTrips: customerStats.reduce((sum, c) => sum + c.totalTrips, 0),
          totalRevenue: customerStats.reduce((sum, c) => sum + c.totalSpent, 0)
        },
        data: customerStats
      };
    } catch (error) {
      console.error('Error generating customer report:', error);
      throw error;
    }
  }

  // Generate service report
  async generateServiceReport(filters = {}) {
    try {
      const query = {};

      if (filters.startDate || filters.endDate) {
        query.serviceDate = {};
        if (filters.startDate) query.serviceDate.$gte = new Date(filters.startDate);
        if (filters.endDate) query.serviceDate.$lte = new Date(filters.endDate);
      }

      if (filters.status) query.status = filters.status;

      const services = await Service.find(query)
        .populate('vehicle')
        .populate('company');

      const totalCost = services.reduce((sum, s) => sum + s.cost, 0);
      const completedServices = services.filter(s => s.status === 'completed').length;

      // Group by service type
      const byType = {};
      services.forEach(s => {
        byType[s.serviceType] = (byType[s.serviceType] || 0) + s.cost;
      });

      return {
        reportType: 'Service Report',
        generatedAt: new Date(),
        filters,
        summary: {
          totalServices: services.length,
          completedServices,
          totalCost,
          byServiceType: byType
        },
        data: services
      };
    } catch (error) {
      console.error('Error generating service report:', error);
      throw error;
    }
  }

  // Export report to CSV format
  exportToCSV(report) {
    try {
      let csv = `${report.reportType}\n`;
      csv += `Generated: ${report.generatedAt}\n\n`;
      csv += `Summary:\n`;
      
      Object.entries(report.summary).forEach(([key, value]) => {
        csv += `${key},${JSON.stringify(value)}\n`;
      });

      csv += `\nData:\n`;
      if (report.data.length > 0) {
        const headers = Object.keys(report.data[0]);
        csv += headers.join(',') + '\n';
        
        report.data.forEach(row => {
          csv += headers.map(h => {
            const val = row[h];
            return typeof val === 'object' ? JSON.stringify(val) : val;
          }).join(',') + '\n';
        });
      }

      return csv;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }

  // Export report to JSON format
  exportToJSON(report) {
    try {
      return JSON.stringify(report, null, 2);
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw error;
    }
  }
}

export default new ReportService();

