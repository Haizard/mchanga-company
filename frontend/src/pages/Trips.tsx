import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Trips.css';

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  licensePlate: string;
}

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Trip {
  _id: string;
  tripNumber: string;
  vehicle: Vehicle;
  customer: Customer;
  startTime: string;
  endTime?: string;
  distance?: number;
  fare: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'partial';
  notes?: string;
}

const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');

  const [formData, setFormData] = useState({
    tripNumber: '',
    vehicle: '',
    customer: '',
    startTime: '',
    endTime: '',
    distance: 0,
    fare: 0,
    status: 'scheduled' as const,
    paymentStatus: 'pending' as const,
    notes: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchTrips();
    fetchVehicles();
    fetchCustomers();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/trips`);
      setTrips(response.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
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

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'distance' || name === 'fare' ? parseFloat(value) : value
    }));
  };

  const generateTripNumber = () => {
    return `TRIP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        tripNumber: editingId ? formData.tripNumber : generateTripNumber()
      };

      if (editingId) {
        await axios.put(`${API_URL}/trips/${editingId}`, data);
      } else {
        await axios.post(`${API_URL}/trips`, data);
      }

      setEditingId(null);
      setShowForm(false);
      setFormData({
        tripNumber: '',
        vehicle: '',
        customer: '',
        startTime: '',
        endTime: '',
        distance: 0,
        fare: 0,
        status: 'scheduled',
        paymentStatus: 'pending',
        notes: ''
      });
      fetchTrips();
    } catch (error) {
      console.error('Error saving trip:', error);
      alert('Error saving trip');
    }
  };

  const handleEdit = (trip: Trip) => {
    setFormData({
      tripNumber: trip.tripNumber,
      vehicle: trip.vehicle._id,
      customer: trip.customer._id,
      startTime: trip.startTime.split('T')[0],
      endTime: trip.endTime ? trip.endTime.split('T')[0] : '',
      distance: trip.distance || 0,
      fare: trip.fare,
      status: trip.status,
      paymentStatus: trip.paymentStatus,
      notes: trip.notes || ''
    });
    setEditingId(trip._id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({
      tripNumber: '',
      vehicle: '',
      customer: '',
      startTime: '',
      endTime: '',
      distance: 0,
      fare: 0,
      status: 'scheduled',
      paymentStatus: 'pending',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await axios.delete(`${API_URL}/trips/${tripId}`);
        fetchTrips();
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Error deleting trip');
      }
    }
  };

  const filteredTrips = trips.filter(trip => {
    const statusMatch = filterStatus === 'all' || trip.status === filterStatus;
    const paymentMatch = filterPaymentStatus === 'all' || trip.paymentStatus === filterPaymentStatus;
    return statusMatch && paymentMatch;
  });

  if (loading) return <div className="loading">Loading trips...</div>;

  return (
    <div className="trips-page">
      <div className="page-header">
        <h1>🚚 Trips Management</h1>
        <p>Create and manage sand delivery trips</p>
      </div>

      <div className="trips-container">
        <div className="trips-controls">
          <button
            className="btn-primary"
            onClick={() => showForm ? handleCancel() : setShowForm(true)}
          >
            {showForm ? '✕ Cancel' : '+ Create Trip'}
          </button>
        </div>

        {showForm && (
          <div className="trip-form-container">
            <form onSubmit={handleSubmit} className="trip-form">
              <div className="form-row">
                <input
                  type="text"
                  name="tripNumber"
                  placeholder="Trip Number (auto-generated)"
                  value={formData.tripNumber}
                  disabled
                  readOnly
                />
              </div>

              <div className="form-row">
                <select
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.make} {v.model} ({v.licensePlate})
                    </option>
                  ))}
                </select>
                <select
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <input
                  type="number"
                  name="distance"
                  placeholder="Distance (km)"
                  value={formData.distance}
                  onChange={handleInputChange}
                />
                <input
                  type="number"
                  name="fare"
                  placeholder="Fare Amount"
                  value={formData.fare}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
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
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleInputChange}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                </select>
              </div>

              <textarea
                name="notes"
                placeholder="Notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />

              <button type="submit" className="btn-submit">
                {editingId ? 'Update Trip' : 'Create Trip'}
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

          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
          </select>
        </div>

        <div className="trips-table">
          <table>
            <thead>
              <tr>
                <th>Trip #</th>
                <th>Vehicle</th>
                <th>Customer</th>
                <th>Start Time</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Fare</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map(trip => (
                <tr key={trip._id}>
                  <td className="trip-number">{trip.tripNumber}</td>
                  <td>{trip.vehicle.make} {trip.vehicle.model}</td>
                  <td>{trip.customer.firstName} {trip.customer.lastName}</td>
                  <td>{new Date(trip.startTime).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${trip.status}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-badge ${trip.paymentStatus}`}>
                      {trip.paymentStatus}
                    </span>
                  </td>
                  <td className="fare">${trip.fare}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(trip)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(trip._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTrips.length === 0 && (
          <div className="empty-state">
            <p>No trips found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trips;

