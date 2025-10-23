import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Billing.css';

interface Trip {
  _id: string;
  tripNumber: string;
  vehicle: { make: string; model: string };
  fare: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface BillingData {
  customerId: string;
  customerName: string;
  tripCount: number;
  pricePerTrip: number;
  totalAmount: number;
  trips: Trip[];
}

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const Billing: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
  const [pricePerTrip, setPricePerTrip] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleCustomerSelect = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    setSelectedTrips([]);
    setBillingData(null);
    setMessage('');

    if (!customerId) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/billing/customer/${customerId}/calculate?pricePerTrip=${pricePerTrip}`
      );
      setBillingData(response.data);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      setMessage('Error loading billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleTripSelect = (tripId: string) => {
    setSelectedTrips(prev =>
      prev.includes(tripId)
        ? prev.filter(id => id !== tripId)
        : [...prev, tripId]
    );
  };

  const handleSelectAll = () => {
    if (billingData) {
      if (selectedTrips.length === billingData.trips.length) {
        setSelectedTrips([]);
      } else {
        setSelectedTrips(billingData.trips.map(t => t._id));
      }
    }
  };

  const handleGeneratePayment = async () => {
    if (!selectedCustomerId || selectedTrips.length === 0) {
      setMessage('Please select a customer and at least one trip');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/billing/customer/${selectedCustomerId}/generate-payment`,
        {
          tripIds: selectedTrips,
          paymentMethod,
          pricePerTrip
        }
      );

      setMessage(`✅ Payment created successfully! Payment #: ${response.data.payment.paymentNumber}`);
      setSelectedTrips([]);
      handleCustomerSelect(selectedCustomerId);
    } catch (error) {
      console.error('Error generating payment:', error);
      setMessage('❌ Error creating payment');
    } finally {
      setLoading(false);
    }
  };

  const calculateSelectedTotal = () => {
    if (!billingData) return 0;
    return selectedTrips.length * pricePerTrip;
  };

  return (
    <div className="billing-page">
      <div className="page-header">
        <h1>💳 Trip-Based Billing System</h1>
        <p>Charge customers based on completed sand delivery trips</p>
      </div>

      <div className="billing-container">
        {/* Customer Selection */}
        <div className="billing-section">
          <h2>Step 1: Select Customer</h2>
          <select
            value={selectedCustomerId}
            onChange={(e) => handleCustomerSelect(e.target.value)}
            className="customer-select"
          >
            <option value="">-- Select a Customer --</option>
            {customers.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.firstName} {customer.lastName} ({customer.email})
              </option>
            ))}
          </select>
        </div>

        {/* Billing Configuration */}
        {selectedCustomerId && (
          <div className="billing-section">
            <h2>Step 2: Configure Billing</h2>
            <div className="config-grid">
              <div className="config-item">
                <label>Price Per Trip</label>
                <input
                  type="number"
                  value={pricePerTrip}
                  onChange={(e) => setPricePerTrip(parseInt(e.target.value))}
                  min="0"
                />
              </div>
              <div className="config-item">
                <label>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Trips Selection */}
        {billingData && (
          <div className="billing-section">
            <h2>Step 3: Select Trips to Bill</h2>
            <div className="trips-info">
              <p>Total Completed Trips: <strong>{billingData.tripCount}</strong></p>
              <p>Price Per Trip: <strong>${pricePerTrip}</strong></p>
            </div>

            <div className="trips-selection">
              <div className="select-all">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedTrips.length === billingData.trips.length && billingData.trips.length > 0}
                  onChange={handleSelectAll}
                />
                <label htmlFor="select-all">Select All Trips</label>
              </div>

              <div className="trips-list">
                {billingData.trips.length > 0 ? (
                  billingData.trips.map(trip => (
                    <div key={trip._id} className="trip-item">
                      <input
                        type="checkbox"
                        checked={selectedTrips.includes(trip._id)}
                        onChange={() => handleTripSelect(trip._id)}
                      />
                      <div className="trip-details">
                        <span className="trip-number">{trip.tripNumber}</span>
                        <span className="trip-vehicle">{trip.vehicle.make} {trip.vehicle.model}</span>
                        <span className="trip-date">{new Date(trip.createdAt).toLocaleDateString()}</span>
                        <span className={`trip-status ${trip.status}`}>{trip.status}</span>
                      </div>
                      <span className="trip-fare">${trip.fare}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-trips">No completed trips available for billing</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Summary and Action */}
        {billingData && billingData.trips.length > 0 && (
          <div className="billing-section summary-section">
            <h2>Step 4: Review & Generate Payment</h2>
            <div className="summary-box">
              <div className="summary-row">
                <span>Selected Trips:</span>
                <strong>{selectedTrips.length}</strong>
              </div>
              <div className="summary-row">
                <span>Price Per Trip:</span>
                <strong>${pricePerTrip}</strong>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <strong>${calculateSelectedTotal()}</strong>
              </div>
            </div>

            <button
              className="btn-generate-payment"
              onClick={handleGeneratePayment}
              disabled={loading || selectedTrips.length === 0}
            >
              {loading ? 'Generating...' : '✓ Generate Payment'}
            </button>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;

