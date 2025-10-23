import React from 'react';
import './ProfitLoss.css';

interface ProfitLossProps {
  income: number;
  spendings: number;
}

const ProfitLoss: React.FC<ProfitLossProps> = ({ income, spendings }) => {
  const profit = income - spendings;

  return (
    <div className="profit-loss-container">
      <div className="profit-loss-card">
        <h3>Profit & loss</h3>
        <div className="available-balance">
          <div className="balance-item">
            <span className="label">Available balance</span>
            <span className="toggle">💳</span>
          </div>
          <div className="amount">$3,550</div>
          <div className="card-number">•••• 1488</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <span className="stat-label">Income</span>
            <span className="stat-amount">${income.toLocaleString()}</span>
          </div>
        </div>

        <div className="stat-card spending">
          <div className="stat-icon">📉</div>
          <div className="stat-content">
            <span className="stat-label">Spendings</span>
            <span className="stat-amount">${spendings.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLoss;

