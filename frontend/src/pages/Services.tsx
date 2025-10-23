import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Services.css';

interface Vehicle {
  _id: string;
  registrationNumber: string;
  make: string;
  model: string;
}

interface Service {
  _id: string;
  vehicle: { _id: string; registrationNumber: string; make: string; model: string };
  serviceType: string;
  cost: number;
  status: string;
  serviceDate: string;
  description: string;
  mileage?: number;
  provider?: string;
}

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    vehicle: '',
    serviceType: 'maintenance',
    cost: 0,
    serviceDate: '',
    status: 'scheduled',
    description: '',
    mileage: 0,
    provider: ''
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchServices();
    fetchVehicles();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/services`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setMessage('Error loading services');
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
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.vehicle) {
        setMessage('❌ Please select a vehicle');
        return;
      }
      if (!formData.serviceDate) {
        setMessage('❌ Please select a service date');
        return;
      }
      if (formData.cost <= 0) {
        setMessage('❌ Cost must be greater than 0');
        return;
      }

      if (editingId) {
        await axios.put(`${API_URL}/services/${editingId}`, formData);
        setMessage('✅ Service updated successfully');
      } else {
        await axios.post(`${API_URL}/services`, formData);
        setMessage('✅ Service created successfully');
      }

      setFormData({
        vehicle: '',
        serviceType: 'maintenance',
        cost: 0,
        serviceDate: '',
        status: 'scheduled',
        description: '',
        mileage: 0,
        provider: ''
      });
      setEditingId(null);
      setShowForm(false);
      fetchServices();

      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error saving service:', error);
      const errorMsg = error.response?.data?.error || 'Error saving service';
      setMessage(`❌ ${errorMsg}`);
    }
  };

  const handleEdit = (service: Service) => {
    setFormData({
      vehicle: service.vehicle._id || '',
      serviceType: service.serviceType,
      cost: service.cost,
      serviceDate: service.serviceDate.split('T')[0],
      status: service.status,
      description: service.description,
      mileage: service.mileage || 0,
      provider: service.provider || ''
    });
    setEditingId(service._id);
    setShowForm(true);
    setMessage('');
  };

  const handleCancel = () => {
    setFormData({
      vehicle: '',
      serviceType: 'maintenance',
      cost: 0,
      serviceDate: '',
      status: 'scheduled',
      description: '',
      mileage: 0,
      provider: ''
    });
    setEditingId(null);
    setShowForm(false);
    setMessage('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service record?')) {
      try {
        await axios.delete(`${API_URL}/services/${id}`);
        setMessage('✅ Service deleted successfully');
        fetchServices();
        setTimeout(() => setMessage(''), 3000);
      } catch (error: any) {
        console.error('Error deleting service:', error);
        const errorMsg = error.response?.data?.error || 'Error deleting service';
        setMessage(`❌ ${errorMsg}`);
      }
    }
  };

  const filteredServices = services.filter(service =>
    filterStatus === 'all' || service.status === filterStatus
  );

  const totalCost = filteredServices.reduce((sum, s) => sum + s.cost, 0);
  const scheduledCount = filteredServices.filter(s => s.status === 'scheduled').length;

  if (loading) return <div className="loading">Loading services...</div>;

  return (
    <div className="services-page">
      <div className="page-header">
        <h1>Services & Maintenance</h1>
        <button className="btn-primary" onClick={() => showForm ? handleCancel() : setShowForm(true)}>
          {showForm ? '✕ Cancel' : '+ Schedule Service'}
        </button>
      </div>

      <div className="header-stats">
        <div className="stat">
          <span className="label">Total Cost</span>
          <span className="value">${totalCost.toLocaleString()}</span>
        </div>
        <div className="stat">
          <span className="label">Scheduled</span>
          <span className="value">{scheduledCount}</span>
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="service-form">
            {message && <div className="message">{message}</div>}
            <div className="form-row">
              <select
                name="vehicle"
                value={formData.vehicle}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.make} {vehicle.model} ({vehicle.registrationNumber})
                  </option>
                ))}
              </select>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
              >
                <option value="maintenance">Maintenance</option>
                <option value="repair">Repair</option>
                <option value="inspection">Inspection</option>
                <option value="oil_change">Oil Change</option>
                <option value="tire_replacement">Tire Replacement</option>
              </select>
            </div>
            <div className="form-row">
              <input
                type="number"
                name="cost"
                placeholder="Cost"
                value={formData.cost}
                onChange={handleInputChange}
                required
              />
              <input
                type="date"
                name="serviceDate"
                value={formData.serviceDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="number"
                name="mileage"
                placeholder="Mileage (km)"
                value={formData.mileage}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="provider"
                placeholder="Service Provider"
                value={formData.provider}
                onChange={handleInputChange}
              />
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <textarea
              name="description"
              placeholder="Service description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
            <button type="submit" className="btn-submit">
              {editingId ? 'Update Service' : 'Schedule Service'}
            </button>
          </form>
        </div>
      )}

      <div className="filter-container">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="services-list">
        {filteredServices.map(service => (
          <div key={service._id} className="service-item">
            <div className="service-header">
              <h3>{service.vehicle.make} {service.vehicle.model}</h3>
              <span className={`status-badge ${service.status}`}>
                {service.status}
              </span>
            </div>
            <div className="service-body">
              <div className="info-row">
                <span className="label">Registration:</span>
                <span className="value">{service.vehicle.registrationNumber}</span>
              </div>
              <div className="info-row">
                <span className="label">Service Type:</span>
                <span className="value">{service.serviceType}</span>
              </div>
              <div className="info-row">
                <span className="label">Cost:</span>
                <span className="value">${service.cost.toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span className="label">Date:</span>
                <span className="value">
                  {new Date(service.serviceDate).toLocaleDateString()}
                </span>
              </div>
              {service.mileage && (
                <div className="info-row">
                  <span className="label">Mileage:</span>
                  <span className="value">{service.mileage.toLocaleString()} km</span>
                </div>
              )}
              {service.provider && (
                <div className="info-row">
                  <span className="label">Provider:</span>
                  <span className="value">{service.provider}</span>
                </div>
              )}
              <div className="info-row">
                <span className="label">Description:</span>
                <span className="value">{service.description}</span>
              </div>
            </div>
            <div className="service-footer">
              <button
                className="btn-edit"
                onClick={() => handleEdit(service)}
              >
                Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(service._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="empty-state">
          <p>No services found</p>
        </div>
      )}
    </div>
  );
};

export default Services;

