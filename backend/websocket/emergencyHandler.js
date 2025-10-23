import emergencyService from '../services/emergencyService.js';

export const setupEmergencyHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Emergency handler connected: ${socket.id}`);

    // Subscribe to emergency alerts by severity
    socket.on('subscribe-alerts', async (severity) => {
      try {
        console.log(`Client ${socket.id} subscribed to ${severity} alerts`);
        emergencyService.subscribeToAlerts(severity, socket.id);

        // Send current active alerts
        if (severity === 'critical') {
          const criticalAlerts = await emergencyService.getCriticalAlerts();
          socket.emit('active-alerts', criticalAlerts);
        } else {
          const activeAlerts = await emergencyService.getActiveAlerts();
          socket.emit('active-alerts', activeAlerts);
        }
      } catch (error) {
        console.error('Error subscribing to alerts:', error);
        socket.emit('error', { message: 'Failed to subscribe to alerts' });
      }
    });

    // Unsubscribe from alerts
    socket.on('unsubscribe-alerts', (severity) => {
      console.log(`Client ${socket.id} unsubscribed from ${severity} alerts`);
      emergencyService.unsubscribeFromAlerts(severity, socket.id);
    });

    // Report emergency
    socket.on('report-emergency', async (emergencyData) => {
      try {
        console.log('Emergency reported:', emergencyData);
        const emergency = await emergencyService.createAlert(emergencyData, io);
        socket.emit('emergency-reported', emergency);
      } catch (error) {
        console.error('Error reporting emergency:', error);
        socket.emit('error', { message: 'Failed to report emergency' });
      }
    });

    // Update alert status
    socket.on('update-alert-status', async (data) => {
      try {
        const { emergencyId, status } = data;
        console.log(`Updating alert ${emergencyId} status to ${status}`);
        const emergency = await emergencyService.updateAlertStatus(emergencyId, status, io);
        socket.emit('alert-status-updated', emergency);
      } catch (error) {
        console.error('Error updating alert status:', error);
        socket.emit('error', { message: 'Failed to update alert status' });
      }
    });

    // Get critical alerts
    socket.on('get-critical-alerts', async () => {
      try {
        const alerts = await emergencyService.getCriticalAlerts();
        socket.emit('critical-alerts', alerts);
      } catch (error) {
        console.error('Error getting critical alerts:', error);
        socket.emit('error', { message: 'Failed to get critical alerts' });
      }
    });

    // Get active alerts
    socket.on('get-active-alerts', async () => {
      try {
        const alerts = await emergencyService.getActiveAlerts();
        socket.emit('active-alerts', alerts);
      } catch (error) {
        console.error('Error getting active alerts:', error);
        socket.emit('error', { message: 'Failed to get active alerts' });
      }
    });

    // Get alert statistics
    socket.on('get-alert-stats', async () => {
      try {
        const stats = await emergencyService.getAlertStatistics();
        socket.emit('alert-stats', stats);
      } catch (error) {
        console.error('Error getting alert statistics:', error);
        socket.emit('error', { message: 'Failed to get alert statistics' });
      }
    });

    // Close alert
    socket.on('close-alert', async (emergencyId) => {
      try {
        console.log(`Closing alert ${emergencyId}`);
        const emergency = await emergencyService.closeAlert(emergencyId, io);
        socket.emit('alert-closed', emergency);
      } catch (error) {
        console.error('Error closing alert:', error);
        socket.emit('error', { message: 'Failed to close alert' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Emergency handler disconnected: ${socket.id}`);
    });
  });
};

