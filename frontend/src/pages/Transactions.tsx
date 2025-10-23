import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Transactions.css';

interface Transaction {
  _id: string;
  paymentNumber: string;
  customer: { firstName: string; lastName: string };
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/payments`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || transaction.paymentMethod === filterMethod;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const completedCount = filteredTransactions.filter(t => t.status === 'completed').length;

  if (loading) return <div className="loading">Loading transactions...</div>;

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transactions</h1>
        <div className="header-stats">
          <div className="stat">
            <span className="label">Total Amount</span>
            <span className="value">${totalAmount.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="label">Completed</span>
            <span className="value">{completedCount}</span>
          </div>
        </div>
      </div>

      <div className="filters-container">
        <input
          type="text"
          placeholder="Search by payment number or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
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

        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Methods</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="mobile_money">Mobile Money</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </div>

      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Payment #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(transaction => (
              <tr key={transaction._id}>
                <td className="payment-number">{transaction.paymentNumber}</td>
                <td>
                  {transaction.customer.firstName} {transaction.customer.lastName}
                </td>
                <td className="amount">${transaction.amount.toLocaleString()}</td>
                <td>
                  <span className={`method-badge ${transaction.paymentMethod}`}>
                    {transaction.paymentMethod.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${transaction.status}`}>
                    {transaction.status}
                  </span>
                </td>
                <td>
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="empty-state">
          <p>No transactions found</p>
        </div>
      )}
    </div>
  );
};

export default Transactions;

