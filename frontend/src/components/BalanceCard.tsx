import React, { useState } from 'react';
import './BalanceCard.css';

interface BalanceCardProps {
  balance: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="balance-card">
      <div className="balance-header">
        <h3>Available balance</h3>
        <button 
          className="toggle-btn"
          onClick={() => setShowBalance(!showBalance)}
        >
          {showBalance ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>

      <div className="balance-amount">
        <h2>${showBalance ? balance.toLocaleString() : '****'}</h2>
      </div>

      <div className="balance-footer">
        <div className="card-info">
          <span className="card-dots">•••• 1488</span>
          <div className="card-logos">
            <span className="logo">💳</span>
            <span className="logo">💳</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;

