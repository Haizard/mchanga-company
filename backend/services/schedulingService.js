import Service from '../models/Service.js';
import Vehicle from '../models/Vehicle.js';

class SchedulingService {
  constructor() {
    this.scheduledServices = new Map(); // serviceId -> schedule data
    this.reminders = new Map(); // vehicleId -> [reminders]
  }

  // Schedule a service
  async scheduleService(serviceData, io) {
    try {
      const service = new Service(serviceData);
      await service.save();
      await service.populate(['vehicle', 'company']);

      const scheduleData = {
        _id: service._id,
        vehicleId: service.vehicle._id,
        serviceType: service.serviceType,
        scheduledDate: service.serviceDate,
        cost: service.cost,
        status: service.status,
        description: service.description
      };

      this.scheduledServices.set(service._id.toString(), scheduleData);

      // Set reminder
      this.setReminder(service.vehicle._id.toString(), scheduleData, io);

      return service;
    } catch (error) {
      console.error('Error scheduling service:', error);
      throw error;
    }
  }

  // Set reminder for upcoming service
  setReminder(vehicleId, serviceData, io) {
    const scheduledDate = new Date(serviceData.scheduledDate);
    const now = new Date();
    const timeUntilService = scheduledDate - now;

    // Set reminder 24 hours before
    const reminderTime = timeUntilService - (24 * 60 * 60 * 1000);

    if (reminderTime > 0) {
      const reminderId = setTimeout(() => {
        io.emit('service-reminder', {
          vehicleId,
          serviceType: serviceData.serviceType,
          scheduledDate: serviceData.scheduledDate,
          message: `Service reminder: ${serviceData.serviceType} scheduled for ${scheduledDate.toLocaleDateString()}`
        });
      }, reminderTime);

      if (!this.reminders.has(vehicleId)) {
        this.reminders.set(vehicleId, []);
      }
      this.reminders.get(vehicleId).push({
        serviceId: serviceData._id,
        reminderId
      });
    }
  }

  // Get upcoming services
  async getUpcomingServices(days = 7) {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const services = await Service.find({
        serviceDate: { $gte: startDate, $lte: endDate },
        status: 'scheduled'
      }).populate(['vehicle', 'company']);

      return services;
    } catch (error) {
      console.error('Error getting upcoming services:', error);
      throw error;
    }
  }

  // Get overdue services
  async getOverdueServices() {
    try {
      const now = new Date();
      const services = await Service.find({
        serviceDate: { $lt: now },
        status: 'scheduled'
      }).populate(['vehicle', 'company']);

      return services;
    } catch (error) {
      console.error('Error getting overdue services:', error);
      throw error;
    }
  }

  // Complete service
  async completeService(serviceId, io) {
    try {
      const service = await Service.findByIdAndUpdate(
        serviceId,
        { status: 'completed', completedAt: new Date() },
        { new: true }
      ).populate(['vehicle', 'company']);

      if (!service) {
        throw new Error('Service not found');
      }

      // Clear reminder
      this.clearReminder(service.vehicle._id.toString(), serviceId);

      io.emit('service-completed', {
        serviceId,
        vehicleId: service.vehicle._id,
        serviceType: service.serviceType
      });

      return service;
    } catch (error) {
      console.error('Error completing service:', error);
      throw error;
    }
  }

  // Clear reminder
  clearReminder(vehicleId, serviceId) {
    if (this.reminders.has(vehicleId)) {
      const reminders = this.reminders.get(vehicleId);
      const index = reminders.findIndex(r => r.serviceId.toString() === serviceId.toString());
      if (index > -1) {
        clearTimeout(reminders[index].reminderId);
        reminders.splice(index, 1);
      }
    }
  }

  // Get service statistics
  async getServiceStatistics() {
    try {
      const total = await Service.countDocuments();
      const scheduled = await Service.countDocuments({ status: 'scheduled' });
      const completed = await Service.countDocuments({ status: 'completed' });
      const inProgress = await Service.countDocuments({ status: 'in-progress' });

      const totalCost = await Service.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$cost' } } }
      ]);

      return {
        total,
        scheduled,
        completed,
        inProgress,
        totalCost: totalCost[0]?.total || 0,
        completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error getting service statistics:', error);
      throw error;
    }
  }

  // Get services by vehicle
  async getServicesByVehicle(vehicleId) {
    try {
      const services = await Service.find({ vehicle: vehicleId })
        .populate('company')
        .sort({ serviceDate: -1 });

      return services;
    } catch (error) {
      console.error('Error getting services by vehicle:', error);
      throw error;
    }
  }

  // Reschedule service
  async rescheduleService(serviceId, newDate, io) {
    try {
      const service = await Service.findByIdAndUpdate(
        serviceId,
        { serviceDate: newDate },
        { new: true }
      ).populate(['vehicle', 'company']);

      if (!service) {
        throw new Error('Service not found');
      }

      // Update reminder
      this.clearReminder(service.vehicle._id.toString(), serviceId);
      this.setReminder(service.vehicle._id.toString(), {
        _id: service._id,
        serviceType: service.serviceType,
        scheduledDate: newDate
      }, io);

      io.emit('service-rescheduled', {
        serviceId,
        newDate,
        vehicleId: service.vehicle._id
      });

      return service;
    } catch (error) {
      console.error('Error rescheduling service:', error);
      throw error;
    }
  }
}

export default new SchedulingService();

