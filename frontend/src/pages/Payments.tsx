import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Payments.css';

interface Payment {
  _id: string;
  paymentNumber: string;
  customer: { _id: string; firstName: string; lastName: string };
  trip?: { tripNumber: string };
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    paymentNumber: '',
    customer: '',
    amount: 0,
    paymentMethod: 'cash',
    status: 'pending'
  });
  const [filterStatus, setFilterStatus] = useState('all');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/payments`);
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/payments/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/payments`, formData);
      }
      setFormData({
        paymentNumber: '',
        customer: '',
        amount: 0,
        paymentMethod: 'cash',
        status: 'pending'
      });
      setEditingId(null);
      setShowForm(false);
      fetchPayments();
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Error saving payment');
    }
  };

  const handleEdit = (payment: Payment) => {
    setFormData({
      paymentNumber: payment.paymentNumber,
      customer: payment.customer._id || '',
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status
    });
    setEditingId(payment._id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({
      paymentNumber: '',
      customer: '',
      amount: 0,
      paymentMethod: 'cash',
      status: 'pending'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await axios.delete(`${API_URL}/payments/${id}`);
        fetchPayments();
      } catch (error) {
        console.error('Error deleting payment:', error);
      }
    }
  };

  const filteredPayments = payments.filter(payment =>
    filterStatus === 'all' || payment.status === filterStatus
  );

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const completedAmount = filteredPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) return <div className="loading">Loading payments...</div>;

  return (
    <div className="payments-page">
      <div className="page-header">
        <h1>Payment Management</h1>
        <button className="btn-primary" onClick={() => showForm ? handleCancel() : setShowForm(true)}>
          {showForm ? '✕ Cancel' : '+ Process Payment'}
        </button>
      </div>

      <div className="payment-stats">
        <div className="stat-card">
          <span className="label">Total Amount</span>
          <span className="value">${totalAmount.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="label">Completed</span>
          <span className="value">${completedAmount.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="label">Pending</span>
          <span className="value">
            ${(totalAmount - completedAmount).toLocaleString()}
          </span>
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-row">
              <input
                type="text"
                name="paymentNumber"
                placeholder="Payment Number"
                value={formData.paymentNumber}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="customer"
                placeholder="Customer ID"
                value={formData.customer}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <button type="submit" className="btn-submit">
              {editingId ? 'Update Payment' : 'Process Payment'}
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
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="payments-table">
        <table>
          <thead>
            <tr>
              <th>Payment #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map(payment => (
              <tr key={payment._id}>
                <td className="payment-number">{payment.paymentNumber}</td>
                <td>
                  {payment.customer.firstName} {payment.customer.lastName}
                </td>
                <td className="amount">${payment.amount.toLocaleString()}</td>
                <td>
                  <span className={`method-badge ${payment.paymentMethod}`}>
                    {payment.paymentMethod.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${payment.status}`}>
                    {payment.status}
                  </span>
                </td>
                <td>
                  {new Date(payment.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(payment)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(payment._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPayments.length === 0 && (
        <div className="empty-state">
          <p>No payments found</p>
        </div>
      )}
    </div>
  );
};

export default Payments;

