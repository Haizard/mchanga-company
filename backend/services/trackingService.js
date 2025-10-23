import Vehicle from '../models/Vehicle.js';

class TrackingService {
  constructor() {
    this.activeTracking = new Map(); // vehicleId -> tracking data
    this.subscribers = new Map(); // vehicleId -> [socket ids]
  }

  // Start tracking a vehicle
  async startTracking(vehicleId, io) {
    try {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      this.activeTracking.set(vehicleId, {
        vehicleId,
        status: 'tracking',
        startTime: new Date(),
        lastUpdate: new Date(),
        currentLocation: vehicle.currentLocation || { latitude: 0, longitude: 0 },
        distance: 0,
        speed: 0
      });

      // Notify all subscribers
      this.broadcastUpdate(vehicleId, io);
      return this.activeTracking.get(vehicleId);
    } catch (error) {
      console.error('Error starting tracking:', error);
      throw error;
    }
  }

  // Stop tracking a vehicle
  stopTracking(vehicleId) {
    if (this.activeTracking.has(vehicleId)) {
      const trackingData = this.activeTracking.get(vehicleId);
      trackingData.status = 'stopped';
      trackingData.endTime = new Date();
      return trackingData;
    }
    return null;
  }

  // Update vehicle location
  async updateLocation(vehicleId, latitude, longitude, io) {
    try {
      const vehicle = await Vehicle.findByIdAndUpdate(
        vehicleId,
        {
          currentLocation: {
            latitude,
            longitude,
            lastUpdated: new Date()
          }
        },
        { new: true }
      );

      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      // Update tracking data
      if (this.activeTracking.has(vehicleId)) {
        const tracking = this.activeTracking.get(vehicleId);
        tracking.currentLocation = { latitude, longitude };
        tracking.lastUpdate = new Date();
        
        // Calculate distance (simplified - in production use Haversine formula)
        tracking.distance += this.calculateDistance(
          tracking.currentLocation,
          { latitude, longitude }
        );
      }

      // Broadcast update to all subscribers
      this.broadcastUpdate(vehicleId, io);
      return vehicle;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  // Subscribe to vehicle tracking
  subscribe(vehicleId, socketId) {
    if (!this.subscribers.has(vehicleId)) {
      this.subscribers.set(vehicleId, []);
    }
    const subs = this.subscribers.get(vehicleId);
    if (!subs.includes(socketId)) {
      subs.push(socketId);
    }
  }

  // Unsubscribe from vehicle tracking
  unsubscribe(vehicleId, socketId) {
    if (this.subscribers.has(vehicleId)) {
      const subs = this.subscribers.get(vehicleId);
      const index = subs.indexOf(socketId);
      if (index > -1) {
        subs.splice(index, 1);
      }
    }
  }

  // Broadcast update to all subscribers
  broadcastUpdate(vehicleId, io) {
    if (this.subscribers.has(vehicleId)) {
      const tracking = this.activeTracking.get(vehicleId);
      const subscribers = this.subscribers.get(vehicleId);
      
      subscribers.forEach(socketId => {
        io.to(socketId).emit('location-update', {
          vehicleId,
          ...tracking
        });
      });
    }
  }

  // Get tracking data for a vehicle
  getTrackingData(vehicleId) {
    return this.activeTracking.get(vehicleId) || null;
  }

  // Get all active tracking
  getAllTracking() {
    return Array.from(this.activeTracking.values());
  }

  // Calculate distance between two points (simplified)
  calculateDistance(point1, point2) {
    const lat1 = point1.latitude;
    const lon1 = point1.longitude;
    const lat2 = point2.latitude;
    const lon2 = point2.longitude;

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Get tracking statistics
  getStatistics(vehicleId) {
    const tracking = this.activeTracking.get(vehicleId);
    if (!tracking) return null;

    const duration = new Date() - tracking.startTime;
    const hours = duration / (1000 * 60 * 60);
    const avgSpeed = hours > 0 ? tracking.distance / hours : 0;

    return {
      vehicleId,
      distance: tracking.distance.toFixed(2),
      duration: Math.floor(duration / 1000), // seconds
      averageSpeed: avgSpeed.toFixed(2),
      currentSpeed: tracking.speed,
      status: tracking.status
    };
  }
}

export default new TrackingService();

