import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Vehicles.css';

interface Vehicle {
  _id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  status: string;
  totalTrips: number;
  currentLocation?: { latitude: number; longitude: number };
}

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    status: 'active'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/vehicles`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/vehicles/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/vehicles`, formData);
      }
      setFormData({
        registrationNumber: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        licensePlate: '',
        status: 'active'
      });
      setEditingId(null);
      setShowForm(false);
      fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Error saving vehicle');
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setFormData({
      registrationNumber: vehicle.registrationNumber,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      status: vehicle.status
    });
    setEditingId(vehicle._id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({
      registrationNumber: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      status: 'active'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await axios.delete(`${API_URL}/vehicles/${id}`);
        fetchVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading vehicles...</div>;

  return (
    <div className="vehicles-page">
      <div className="page-header">
        <h1>Vehicles</h1>
        <button className="btn-primary" onClick={() => showForm ? handleCancel() : setShowForm(true)}>
          {showForm ? '✕ Cancel' : '+ Add Vehicle'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="vehicle-form">
            <div className="form-row">
              <input
                type="text"
                name="registrationNumber"
                placeholder="Registration Number"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="licensePlate"
                placeholder="License Plate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                name="make"
                placeholder="Make (e.g., Toyota)"
                value={formData.make}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="model"
                placeholder="Model (e.g., Hiace)"
                value={formData.model}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="number"
                name="year"
                placeholder="Year"
                value={formData.year}
                onChange={handleInputChange}
                required
              />
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            <button type="submit" className="btn-submit">
              {editingId ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
          </form>
        </div>
      )}

      <div className="search-container">
        <input
          type="text"
          placeholder="Search vehicles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="vehicles-grid">
        {filteredVehicles.map(vehicle => (
          <div key={vehicle._id} className="vehicle-card">
            <div className="card-header">
              <h3>{vehicle.make} {vehicle.model}</h3>
              <span className={`status-badge ${vehicle.status}`}>
                {vehicle.status}
              </span>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="label">Registration:</span>
                <span className="value">{vehicle.registrationNumber}</span>
              </div>
              <div className="info-row">
                <span className="label">License Plate:</span>
                <span className="value">{vehicle.licensePlate}</span>
              </div>
              <div className="info-row">
                <span className="label">Year:</span>
                <span className="value">{vehicle.year}</span>
              </div>
              <div className="info-row">
                <span className="label">Total Trips:</span>
                <span className="value">{vehicle.totalTrips}</span>
              </div>
              {vehicle.currentLocation && (
                <div className="info-row">
                  <span className="label">Location:</span>
                  <span className="value">
                    {vehicle.currentLocation.latitude.toFixed(4)}, {vehicle.currentLocation.longitude.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
            <div className="card-footer">
              <button
                className="btn-edit"
                onClick={() => handleEdit(vehicle)}
              >
                Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(vehicle._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="empty-state">
          <p>No vehicles found</p>
        </div>
      )}
    </div>
  );
};

export default Vehicles;

