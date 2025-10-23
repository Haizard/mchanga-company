import trackingService from '../services/trackingService.js';

export const setupTrackingHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Subscribe to vehicle tracking
    socket.on('subscribe-tracking', async (vehicleId) => {
      try {
        console.log(`Client ${socket.id} subscribed to vehicle ${vehicleId}`);
        trackingService.subscribe(vehicleId, socket.id);
        
        // Send current tracking data if available
        const tracking = trackingService.getTrackingData(vehicleId);
        if (tracking) {
          socket.emit('tracking-data', tracking);
        }
      } catch (error) {
        console.error('Error subscribing to tracking:', error);
        socket.emit('error', { message: 'Failed to subscribe to tracking' });
      }
    });

    // Unsubscribe from vehicle tracking
    socket.on('unsubscribe-tracking', (vehicleId) => {
      console.log(`Client ${socket.id} unsubscribed from vehicle ${vehicleId}`);
      trackingService.unsubscribe(vehicleId, socket.id);
    });

    // Start tracking a vehicle
    socket.on('start-tracking', async (vehicleId) => {
      try {
        console.log(`Starting tracking for vehicle ${vehicleId}`);
        const tracking = await trackingService.startTracking(vehicleId, io);
        socket.emit('tracking-started', tracking);
      } catch (error) {
        console.error('Error starting tracking:', error);
        socket.emit('error', { message: 'Failed to start tracking' });
      }
    });

    // Stop tracking a vehicle
    socket.on('stop-tracking', (vehicleId) => {
      try {
        console.log(`Stopping tracking for vehicle ${vehicleId}`);
        const tracking = trackingService.stopTracking(vehicleId);
        io.emit('tracking-stopped', { vehicleId, tracking });
      } catch (error) {
        console.error('Error stopping tracking:', error);
        socket.emit('error', { message: 'Failed to stop tracking' });
      }
    });

    // Update vehicle location
    socket.on('update-location', async (data) => {
      try {
        const { vehicleId, latitude, longitude } = data;
        console.log(`Updating location for vehicle ${vehicleId}: ${latitude}, ${longitude}`);
        
        const vehicle = await trackingService.updateLocation(vehicleId, latitude, longitude, io);
        socket.emit('location-updated', { vehicleId, vehicle });
      } catch (error) {
        console.error('Error updating location:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Get tracking statistics
    socket.on('get-stats', (vehicleId) => {
      try {
        const stats = trackingService.getStatistics(vehicleId);
        socket.emit('tracking-stats', stats);
      } catch (error) {
        console.error('Error getting stats:', error);
        socket.emit('error', { message: 'Failed to get statistics' });
      }
    });

    // Get all active tracking
    socket.on('get-all-tracking', () => {
      try {
        const allTracking = trackingService.getAllTracking();
        socket.emit('all-tracking', allTracking);
      } catch (error) {
        console.error('Error getting all tracking:', error);
        socket.emit('error', { message: 'Failed to get tracking data' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });
};

