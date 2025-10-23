import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import './EmergencyAlerts.css';

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  licensePlate: string;
  registrationNumber: string;
}

interface Emergency {
  _id: string;
  vehicle: { _id: string; make: string; model: string; licensePlate: string };
  emergencyType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'reported' | 'in-progress' | 'resolved' | 'closed';
  location: { latitude: number; longitude: number };
  createdAt: string;
}

interface AlertStats {
  total: number;
  critical: number;
  active: number;
  resolved: number;
  resolutionRate: string;
}

const EmergencyAlerts: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [message, setMessage] = useState('');
  const [newAlert, setNewAlert] = useState({
    vehicle: '',
    emergencyType: 'breakdown',
    severity: 'high',
    description: '',
    location: { latitude: 0, longitude: 0 }
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io('http://localhost:5000');

    newSocket.on('connect', () => {
      console.log('Connected to emergency alerts');
      newSocket.emit('subscribe-alerts', 'all');
    });

    newSocket.on('emergency-alert', (alert: Emergency) => {
      console.log('Emergency alert received:', alert);
      setEmergencies(prev => [alert, ...prev]);
    });

    newSocket.on('critical-alert', (alert: Emergency) => {
      console.log('CRITICAL ALERT:', alert);
      playAlertSound();
      setEmergencies(prev => [alert, ...prev]);
    });

    newSocket.on('active-alerts', (alerts: Emergency[]) => {
      setEmergencies(alerts);
    });

    newSocket.on('alert-stats', (stats: AlertStats) => {
      setStats(stats);
    });

    setSocket(newSocket);

    // Fetch initial data
    fetchEmergencies();
    fetchVehicles();
    fetchStats();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/emergencies`);
      setEmergencies(response.data);
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      setMessage('Failed to fetch emergencies');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_URL}/vehicles`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setMessage('Failed to fetch vehicles');
    }
  };

  const fetchStats = async () => {
    try {
      if (socket) {
        socket.emit('get-alert-stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleReportEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newAlert.vehicle) {
        setMessage('Please select a vehicle');
        return;
      }

      const emergencyData = {
        vehicle: newAlert.vehicle,
        emergencyType: newAlert.emergencyType,
        severity: newAlert.severity,
        description: newAlert.description,
        location: newAlert.location,
        status: 'reported'
      };

      const response = await axios.post(`${API_URL}/emergencies`, emergencyData);

      if (response.status === 201) {
        setMessage('Emergency reported successfully!');
        setNewAlert({
          vehicle: '',
          emergencyType: 'breakdown',
          severity: 'high',
          description: '',
          location: { latitude: 0, longitude: 0 }
        });
        fetchEmergencies();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error reporting emergency:', error);
      setMessage('Failed to report emergency');
    }
  };

  const handleUpdateStatus = async (emergencyId: string, status: string) => {
    try {
      if (socket) {
        socket.emit('update-alert-status', { emergencyId, status });
      }
    } catch (error) {
      console.error('Error updating alert status:', error);
    }
  };

  const handleCloseAlert = async (emergencyId: string) => {
    try {
      if (socket) {
        socket.emit('close-alert', emergencyId);
      }
    } catch (error) {
      console.error('Error closing alert:', error);
    }
  };

  const playAlertSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==');
    audio.play().catch(e => console.log('Could not play alert sound:', e));
  };

  const filteredEmergencies = selectedSeverity === 'all' 
    ? emergencies 
    : emergencies.filter(e => e.severity === selectedSeverity);

  if (loading) return <div className="loading">Loading emergencies...</div>;

  return (
    <div className="emergency-alerts">
      <div className="page-header">
        <h1>🚨 Emergency Alerts Management</h1>
      </div>

      {stats && (
        <div className="alert-stats">
          <div className="stat-card">
            <h3>Total Alerts</h3>
            <p className="value">{stats.total}</p>
          </div>
          <div className="stat-card critical">
            <h3>Critical</h3>
            <p className="value">{stats.critical}</p>
          </div>
          <div className="stat-card active">
            <h3>Active</h3>
            <p className="value">{stats.active}</p>
          </div>
          <div className="stat-card resolved">
            <h3>Resolved</h3>
            <p className="value">{stats.resolved}</p>
          </div>
          <div className="stat-card">
            <h3>Resolution Rate</h3>
            <p className="value">{stats.resolutionRate}%</p>
          </div>
        </div>
      )}

      <div className="alerts-container">
        <div className="report-section">
          <h2>Report Emergency</h2>
          {message && <div className="message">{message}</div>}
          <form onSubmit={handleReportEmergency} className="emergency-form">
            <div className="form-group">
              <label>Vehicle</label>
              <select
                value={newAlert.vehicle}
                onChange={(e) => setNewAlert({ ...newAlert, vehicle: e.target.value })}
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Emergency Type</label>
              <select
                value={newAlert.emergencyType}
                onChange={(e) => setNewAlert({ ...newAlert, emergencyType: e.target.value })}
              >
                <option value="breakdown">Breakdown</option>
                <option value="accident">Accident</option>
                <option value="theft">Theft</option>
                <option value="medical">Medical</option>
                <option value="mechanical">Mechanical</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Severity</label>
              <select
                value={newAlert.severity}
                onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value as any })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newAlert.description}
                onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-submit">Report Emergency</button>
          </form>
        </div>

        <div className="alerts-list-section">
          <div className="filter-bar">
            <h2>Active Alerts</h2>
            <select 
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="severity-filter"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="alerts-list">
            {filteredEmergencies.length === 0 ? (
              <p className="no-alerts">No alerts found</p>
            ) : (
              filteredEmergencies.map(emergency => (
                <div key={emergency._id} className={`alert-item severity-${emergency.severity}`}>
                  <div className="alert-header">
                    <div className="alert-title">
                      <span className="severity-badge">{emergency.severity.toUpperCase()}</span>
                      <span className="type">{emergency.emergencyType}</span>
                    </div>
                    <span className={`status-badge ${emergency.status}`}>
                      {emergency.status}
                    </span>
                  </div>
                  <div className="alert-details">
                    <p><strong>Vehicle:</strong> {emergency.vehicle.make} {emergency.vehicle.model} ({emergency.vehicle.licensePlate})</p>
                    <p><strong>Description:</strong> {emergency.description}</p>
                    <p><strong>Location:</strong> {emergency.location.latitude.toFixed(4)}, {emergency.location.longitude.toFixed(4)}</p>
                    <p><strong>Reported:</strong> {new Date(emergency.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="alert-actions">
                    {emergency.status === 'reported' && (
                      <button 
                        className="btn-action btn-progress"
                        onClick={() => handleUpdateStatus(emergency._id, 'in-progress')}
                      >
                        Mark In Progress
                      </button>
                    )}
                    {emergency.status === 'in-progress' && (
                      <button 
                        className="btn-action btn-resolve"
                        onClick={() => handleUpdateStatus(emergency._id, 'resolved')}
                      >
                        Mark Resolved
                      </button>
                    )}
                    {emergency.status !== 'closed' && (
                      <button 
                        className="btn-action btn-close"
                        onClick={() => handleCloseAlert(emergency._id)}
                      >
                        Close Alert
                      </button>
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

export default EmergencyAlerts;

