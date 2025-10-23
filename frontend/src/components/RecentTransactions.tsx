import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RecentTransactions.css';

interface Transaction {
  _id: string;
  customerId: { firstName: string; lastName: string };
  amount: number;
  status: string;
  createdAt: string;
}

const RecentTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/payments?limit=5`);
      setTransactions(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="recent-transactions"><p>Loading...</p></div>;
  }

  return (
    <div className="recent-transactions">
      <div className="transactions-header">
        <h3>Recent transactions</h3>
        <button className="view-all-btn">View all →</button>
      </div>

      <div className="transactions-list">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div key={transaction._id} className="transaction-item">
              <div className="transaction-left">
                <div className="transaction-icon">💳</div>
                <div className="transaction-info">
                  <h4>
                    {transaction.customerId?.firstName} {transaction.customerId?.lastName}
                  </h4>
                </div>
              </div>
              <div className="transaction-amount">
                ${transaction.amount.toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <p>No transactions found</p>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;

