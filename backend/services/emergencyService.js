import Emergency from '../models/Emergency.js';
import Vehicle from '../models/Vehicle.js';

class EmergencyService {
  constructor() {
    this.activeAlerts = new Map(); // emergencyId -> alert data
    this.alertSubscribers = new Map(); // severity -> [socket ids]
  }

  // Create emergency alert
  async createAlert(emergencyData, io) {
    try {
      const emergency = new Emergency(emergencyData);
      await emergency.save();
      await emergency.populate(['vehicle', 'trip', 'company']);

      const alertData = {
        _id: emergency._id,
        vehicleId: emergency.vehicle._id,
        emergencyType: emergency.emergencyType,
        severity: emergency.severity,
        description: emergency.description,
        status: emergency.status,
        createdAt: emergency.createdAt,
        location: emergency.location
      };

      this.activeAlerts.set(emergency._id.toString(), alertData);

      // Broadcast alert based on severity
      this.broadcastAlert(alertData, io);

      return emergency;
    } catch (error) {
      console.error('Error creating emergency alert:', error);
      throw error;
    }
  }

  // Update alert status
  async updateAlertStatus(emergencyId, status, io) {
    try {
      const emergency = await Emergency.findByIdAndUpdate(
        emergencyId,
        { status },
        { new: true }
      ).populate(['vehicle', 'trip', 'company']);

      if (!emergency) {
        throw new Error('Emergency not found');
      }

      const alertData = this.activeAlerts.get(emergencyId.toString());
      if (alertData) {
        alertData.status = status;
        this.broadcastAlert(alertData, io);
      }

      return emergency;
    } catch (error) {
      console.error('Error updating alert status:', error);
      throw error;
    }
  }

  // Get critical alerts
  async getCriticalAlerts() {
    try {
      const alerts = await Emergency.find({
        severity: 'critical',
        status: { $in: ['reported', 'in-progress'] }
      }).populate(['vehicle', 'trip', 'company']);

      return alerts;
    } catch (error) {
      console.error('Error getting critical alerts:', error);
      throw error;
    }
  }

  // Get active alerts
  async getActiveAlerts() {
    try {
      const alerts = await Emergency.find({
        status: { $in: ['reported', 'in-progress'] }
      }).populate(['vehicle', 'trip', 'company']);

      return alerts;
    } catch (error) {
      console.error('Error getting active alerts:', error);
      throw error;
    }
  }

  // Subscribe to alerts by severity
  subscribeToAlerts(severity, socketId) {
    if (!this.alertSubscribers.has(severity)) {
      this.alertSubscribers.set(severity, []);
    }
    const subs = this.alertSubscribers.get(severity);
    if (!subs.includes(socketId)) {
      subs.push(socketId);
    }
  }

  // Unsubscribe from alerts
  unsubscribeFromAlerts(severity, socketId) {
    if (this.alertSubscribers.has(severity)) {
      const subs = this.alertSubscribers.get(severity);
      const index = subs.indexOf(socketId);
      if (index > -1) {
        subs.splice(index, 1);
      }
    }
  }

  // Broadcast alert to subscribers
  broadcastAlert(alertData, io) {
    const severity = alertData.severity;

    // Send to subscribers of this severity level
    if (this.alertSubscribers.has(severity)) {
      const subscribers = this.alertSubscribers.get(severity);
      subscribers.forEach(socketId => {
        io.to(socketId).emit('emergency-alert', alertData);
      });
    }

    // Always send critical alerts to all
    if (severity === 'critical') {
      io.emit('critical-alert', alertData);
    }

    // Send to all subscribers
    this.alertSubscribers.forEach((subscribers, sev) => {
      if (sev !== severity) {
        subscribers.forEach(socketId => {
          io.to(socketId).emit('emergency-alert', alertData);
        });
      }
    });
  }

  // Get alert statistics
  async getAlertStatistics() {
    try {
      const total = await Emergency.countDocuments();
      const critical = await Emergency.countDocuments({ severity: 'critical' });
      const active = await Emergency.countDocuments({
        status: { $in: ['reported', 'in-progress'] }
      });
      const resolved = await Emergency.countDocuments({ status: 'resolved' });

      return {
        total,
        critical,
        active,
        resolved,
        resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error getting alert statistics:', error);
      throw error;
    }
  }

  // Close alert
  async closeAlert(emergencyId, io) {
    try {
      const emergency = await Emergency.findByIdAndUpdate(
        emergencyId,
        { status: 'closed', resolvedAt: new Date() },
        { new: true }
      ).populate(['vehicle', 'trip', 'company']);

      if (!emergency) {
        throw new Error('Emergency not found');
      }

      this.activeAlerts.delete(emergencyId.toString());

      io.emit('alert-closed', {
        emergencyId,
        status: 'closed'
      });

      return emergency;
    } catch (error) {
      console.error('Error closing alert:', error);
      throw error;
    }
  }
}

export default new EmergencyService();

