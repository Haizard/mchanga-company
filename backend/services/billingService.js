import Trip from '../models/Trip.js';
import Payment from '../models/Payment.js';
import Customer from '../models/Customer.js';
import Vehicle from '../models/Vehicle.js';

class BillingService {
  /**
   * Get all billable trips for a customer (completed, in-progress, or scheduled)
   */
  async getCustomerCompletedTrips(customerId) {
    try {
      const trips = await Trip.find({
        customer: customerId,
        status: { $in: ['completed', 'in-progress', 'scheduled'] },  // Accept all statuses except cancelled
        paymentStatus: 'pending'
      })
        .populate('vehicle')
        .populate('customer')
        .sort({ createdAt: -1 });

      return trips;
    } catch (error) {
      console.error('Error fetching customer billable trips:', error);
      throw error;
    }
  }

  /**
   * Calculate billing amount based on completed trips
   * @param {string} customerId - Customer ID
   * @param {number} pricePerTrip - Price per trip (default: 1000)
   * @returns {object} Billing summary
   */
  async calculateCustomerBilling(customerId, pricePerTrip = 1000) {
    try {
      const trips = await this.getCustomerCompletedTrips(customerId);
      const customer = await Customer.findById(customerId);

      if (!customer) {
        throw new Error('Customer not found');
      }

      const tripCount = trips.length;
      const totalAmount = tripCount * pricePerTrip;

      return {
        customerId,
        customerName: `${customer.firstName} ${customer.lastName}`,
        tripCount,
        pricePerTrip,
        totalAmount,
        trips: trips.map(trip => ({
          _id: trip._id,
          tripNumber: trip.tripNumber,
          vehicle: trip.vehicle.make + ' ' + trip.vehicle.model,
          fare: trip.fare,
          completedAt: trip.updatedAt
        }))
      };
    } catch (error) {
      console.error('Error calculating customer billing:', error);
      throw error;
    }
  }

  /**
   * Generate payment/invoice from completed trips
   */
  async generatePaymentFromTrips(customerId, tripIds, paymentMethod, pricePerTrip = 1000) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Verify all trips belong to customer and are billable (not cancelled)
      const trips = await Trip.find({
        _id: { $in: tripIds },
        customer: customerId,
        status: { $in: ['completed', 'in-progress', 'scheduled'] }
      });

      if (trips.length !== tripIds.length) {
        throw new Error('Some trips not found or do not belong to this customer');
      }

      const totalAmount = trips.length * pricePerTrip;

      // Generate unique payment number
      const paymentNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create payment record
      const payment = new Payment({
        paymentNumber,
        customer: customerId,
        amount: totalAmount,
        paymentMethod,
        status: 'pending',
        notes: `Payment for ${trips.length} completed trips`
      });

      await payment.save();

      // Update trip payment status
      await Trip.updateMany(
        { _id: { $in: tripIds } },
        { paymentStatus: 'paid' }
      );

      // Update customer totals
      customer.totalSpent += totalAmount;
      customer.totalTrips += trips.length;
      await customer.save();

      await payment.populate('customer');

      return {
        payment,
        tripCount: trips.length,
        totalAmount,
        message: `Payment created for ${trips.length} trips`
      };
    } catch (error) {
      console.error('Error generating payment from trips:', error);
      throw error;
    }
  }

  /**
   * Get billing summary for all customers
   */
  async getAllCustomersBillingSummary(pricePerTrip = 1000) {
    try {
      const customers = await Customer.find({ status: 'active' });
      const billingSummary = [];

      for (const customer of customers) {
        const billing = await this.calculateCustomerBilling(customer._id, pricePerTrip);
        if (billing.tripCount > 0) {
          billingSummary.push(billing);
        }
      }

      return billingSummary.sort((a, b) => b.totalAmount - a.totalAmount);
    } catch (error) {
      console.error('Error getting all customers billing summary:', error);
      throw error;
    }
  }

  /**
   * Get vehicle billing summary
   */
  async getVehicleBillingInfo(vehicleId, pricePerTrip = 1000) {
    try {
      const vehicle = await Vehicle.findById(vehicleId).populate('company');
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      const completedTrips = await Trip.find({
        vehicle: vehicleId,
        status: 'completed'
      }).populate('customer');

      const totalTrips = completedTrips.length;
      const totalRevenue = totalTrips * pricePerTrip;

      // Group by customer
      const customerBreakdown = {};
      completedTrips.forEach(trip => {
        const customerId = trip.customer._id.toString();
        if (!customerBreakdown[customerId]) {
          customerBreakdown[customerId] = {
            customerName: `${trip.customer.firstName} ${trip.customer.lastName}`,
            tripCount: 0,
            amount: 0
          };
        }
        customerBreakdown[customerId].tripCount += 1;
        customerBreakdown[customerId].amount += pricePerTrip;
      });

      return {
        vehicleId,
        vehicleName: `${vehicle.make} ${vehicle.model}`,
        licensePlate: vehicle.licensePlate,
        totalTrips,
        pricePerTrip,
        totalRevenue,
        customerBreakdown: Object.values(customerBreakdown)
      };
    } catch (error) {
      console.error('Error getting vehicle billing info:', error);
      throw error;
    }
  }

  /**
   * Get billing statistics
   */
  async getBillingStatistics() {
    try {
      const totalTrips = await Trip.countDocuments({ status: 'completed' });
      const pendingPaymentTrips = await Trip.countDocuments({
        status: 'completed',
        paymentStatus: 'pending'
      });
      const paidTrips = await Trip.countDocuments({
        status: 'completed',
        paymentStatus: 'paid'
      });

      const totalPayments = await Payment.countDocuments();
      const completedPayments = await Payment.countDocuments({ status: 'completed' });

      const totalRevenue = await Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      return {
        trips: {
          total: totalTrips,
          pending: pendingPaymentTrips,
          paid: paidTrips
        },
        payments: {
          total: totalPayments,
          completed: completedPayments
        },
        revenue: totalRevenue[0]?.total || 0
      };
    } catch (error) {
      console.error('Error getting billing statistics:', error);
      throw error;
    }
  }
}

export default new BillingService();

