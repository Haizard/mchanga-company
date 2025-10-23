import schedulingService from '../services/schedulingService.js';

export const setupSchedulingHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Scheduling handler connected: ${socket.id}`);

    // Schedule a service
    socket.on('schedule-service', async (serviceData) => {
      try {
        console.log('Scheduling service:', serviceData);
        const service = await schedulingService.scheduleService(serviceData, io);
        socket.emit('service-scheduled', service);
        io.emit('service-scheduled-broadcast', service);
      } catch (error) {
        console.error('Error scheduling service:', error);
        socket.emit('error', { message: 'Failed to schedule service' });
      }
    });

    // Get upcoming services
    socket.on('get-upcoming-services', async (days = 7) => {
      try {
        const services = await schedulingService.getUpcomingServices(days);
        socket.emit('upcoming-services', services);
      } catch (error) {
        console.error('Error getting upcoming services:', error);
        socket.emit('error', { message: 'Failed to get upcoming services' });
      }
    });

    // Get overdue services
    socket.on('get-overdue-services', async () => {
      try {
        const services = await schedulingService.getOverdueServices();
        socket.emit('overdue-services', services);
      } catch (error) {
        console.error('Error getting overdue services:', error);
        socket.emit('error', { message: 'Failed to get overdue services' });
      }
    });

    // Complete service
    socket.on('complete-service', async (serviceId) => {
      try {
        console.log(`Completing service ${serviceId}`);
        const service = await schedulingService.completeService(serviceId, io);
        socket.emit('service-completed', service);
        io.emit('service-completed-broadcast', service);
      } catch (error) {
        console.error('Error completing service:', error);
        socket.emit('error', { message: 'Failed to complete service' });
      }
    });

    // Get service statistics
    socket.on('get-service-stats', async () => {
      try {
        const stats = await schedulingService.getServiceStatistics();
        socket.emit('service-stats', stats);
      } catch (error) {
        console.error('Error getting service statistics:', error);
        socket.emit('error', { message: 'Failed to get service statistics' });
      }
    });

    // Get services by vehicle
    socket.on('get-vehicle-services', async (vehicleId) => {
      try {
        const services = await schedulingService.getServicesByVehicle(vehicleId);
        socket.emit('vehicle-services', services);
      } catch (error) {
        console.error('Error getting vehicle services:', error);
        socket.emit('error', { message: 'Failed to get vehicle services' });
      }
    });

    // Reschedule service
    socket.on('reschedule-service', async (data) => {
      try {
        const { serviceId, newDate } = data;
        console.log(`Rescheduling service ${serviceId} to ${newDate}`);
        const service = await schedulingService.rescheduleService(serviceId, newDate, io);
        socket.emit('service-rescheduled', service);
        io.emit('service-rescheduled-broadcast', service);
      } catch (error) {
        console.error('Error rescheduling service:', error);
        socket.emit('error', { message: 'Failed to reschedule service' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Scheduling handler disconnected: ${socket.id}`);
    });
  });
};

