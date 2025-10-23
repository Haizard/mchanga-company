import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import './ServiceScheduling.css';

interface Service {
  _id: string;
  vehicle: { make: string; model: string; licensePlate: string };
  serviceType: string;
  serviceDate: string;
  cost: number;
  status: 'scheduled' | 'in-progress' | 'completed';
  description: string;
}

interface ServiceStats {
  total: number;
  scheduled: number;
  completed: number;
  inProgress: number;
  totalCost: number;
  completionRate: string;
}

const ServiceScheduling: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [newService, setNewService] = useState({
    vehicleId: '',
    serviceType: 'maintenance',
    serviceDate: '',
    cost: 0,
    description: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io('http://localhost:5000');

    newSocket.on('connect', () => {
      console.log('Connected to scheduling service');
    });

    newSocket.on('service-scheduled-broadcast', (service: Service) => {
      setServices(prev => [service, ...prev]);
    });

    newSocket.on('service-completed-broadcast', (service: Service) => {
      setServices(prev => prev.map(s => s._id === service._id ? service : s));
    });

    newSocket.on('service-rescheduled-broadcast', (service: Service) => {
      setServices(prev => prev.map(s => s._id === service._id ? service : s));
    });

    newSocket.on('service-reminder', (reminder: any) => {
      console.log('Service reminder:', reminder);
      alert(`Service Reminder: ${reminder.message}`);
    });

    newSocket.on('service-stats', (stats: ServiceStats) => {
      setStats(stats);
    });

    setSocket(newSocket);

    // Fetch initial data
    fetchServices();
    fetchStats();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/services`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (socket) {
        socket.emit('get-service-stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleScheduleService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (socket) {
        socket.emit('schedule-service', newService);
        setNewService({
          vehicleId: '',
          serviceType: 'maintenance',
          serviceDate: '',
          cost: 0,
          description: ''
        });
      }
    } catch (error) {
      console.error('Error scheduling service:', error);
    }
  };

  const handleCompleteService = async (serviceId: string) => {
    try {
      if (socket) {
        socket.emit('complete-service', serviceId);
      }
    } catch (error) {
      console.error('Error completing service:', error);
    }
  };

  const handleReschedule = async (serviceId: string, newDate: string) => {
    try {
      if (socket) {
        socket.emit('reschedule-service', { serviceId, newDate });
      }
    } catch (error) {
      console.error('Error rescheduling service:', error);
    }
  };

  const filteredServices = filter === 'all' 
    ? services 
    : services.filter(s => s.status === filter);

  const upcomingServices = services.filter(s => {
    const serviceDate = new Date(s.serviceDate);
    const today = new Date();
    return serviceDate > today && s.status === 'scheduled';
  });

  const overdueServices = services.filter(s => {
    const serviceDate = new Date(s.serviceDate);
    const today = new Date();
    return serviceDate < today && s.status === 'scheduled';
  });

  if (loading) return <div className="loading">Loading services...</div>;

  return (
    <div className="service-scheduling">
      <div className="page-header">
        <h1>🔧 Service Scheduling System</h1>
      </div>

      {stats && (
        <div className="service-stats">
          <div className="stat-card">
            <h3>Total Services</h3>
            <p className="value">{stats.total}</p>
          </div>
          <div className="stat-card">
            <h3>Scheduled</h3>
            <p className="value">{stats.scheduled}</p>
          </div>
          <div className="stat-card">
            <h3>In Progress</h3>
            <p className="value">{stats.inProgress}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p className="value">{stats.completed}</p>
          </div>
          <div className="stat-card">
            <h3>Total Cost</h3>
            <p className="value">${stats.totalCost.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Completion Rate</h3>
            <p className="value">{stats.completionRate}%</p>
          </div>
        </div>
      )}

      <div className="scheduling-container">
        <div className="schedule-form-section">
          <h2>Schedule New Service</h2>
          <form onSubmit={handleScheduleService} className="service-form">
            <div className="form-group">
              <label>Vehicle ID</label>
              <input
                type="text"
                value={newService.vehicleId}
                onChange={(e) => setNewService({ ...newService, vehicleId: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Service Type</label>
              <select
                value={newService.serviceType}
                onChange={(e) => setNewService({ ...newService, serviceType: e.target.value })}
              >
                <option value="maintenance">Maintenance</option>
                <option value="repair">Repair</option>
                <option value="inspection">Inspection</option>
                <option value="oil-change">Oil Change</option>
                <option value="tire-rotation">Tire Rotation</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Service Date</label>
              <input
                type="datetime-local"
                value={newService.serviceDate}
                onChange={(e) => setNewService({ ...newService, serviceDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Cost ($)</label>
              <input
                type="number"
                value={newService.cost}
                onChange={(e) => setNewService({ ...newService, cost: parseFloat(e.target.value) })}
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-submit">Schedule Service</button>
          </form>
        </div>

        <div className="services-list-section">
          <div className="alerts-section">
            {overdueServices.length > 0 && (
              <div className="alert-box overdue">
                <h3>⚠️ Overdue Services ({overdueServices.length})</h3>
                <ul>
                  {overdueServices.map(s => (
                    <li key={s._id}>
                      {s.vehicle.make} {s.vehicle.model} - {s.serviceType}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {upcomingServices.length > 0 && (
              <div className="alert-box upcoming">
                <h3>📅 Upcoming Services ({upcomingServices.length})</h3>
                <ul>
                  {upcomingServices.slice(0, 5).map(s => (
                    <li key={s._id}>
                      {s.vehicle.make} {s.vehicle.model} - {new Date(s.serviceDate).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="filter-bar">
            <h2>All Services</h2>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="services-list">
            {filteredServices.length === 0 ? (
              <p className="no-services">No services found</p>
            ) : (
              filteredServices.map(service => (
                <div key={service._id} className={`service-item status-${service.status}`}>
                  <div className="service-header">
                    <div className="service-info">
                      <h3>{service.vehicle.make} {service.vehicle.model}</h3>
                      <p className="license">{service.vehicle.licensePlate}</p>
                    </div>
                    <span className={`status-badge ${service.status}`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="service-details">
                    <p><strong>Type:</strong> {service.serviceType}</p>
                    <p><strong>Date:</strong> {new Date(service.serviceDate).toLocaleString()}</p>
                    <p><strong>Cost:</strong> ${service.cost.toLocaleString()}</p>
                    <p><strong>Description:</strong> {service.description}</p>
                  </div>
                  <div className="service-actions">
                    {service.status === 'scheduled' && (
                      <>
                        <button 
                          className="btn-action btn-complete"
                          onClick={() => handleCompleteService(service._id)}
                        >
                          Mark Complete
                        </button>
                        <button 
                          className="btn-action btn-reschedule"
                          onClick={() => {
                            const newDate = prompt('Enter new date (YYYY-MM-DD HH:mm):');
                            if (newDate) handleReschedule(service._id, newDate);
                          }}
                        >
                          Reschedule
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceScheduling;

