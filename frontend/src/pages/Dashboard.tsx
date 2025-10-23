import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import BalanceCard from '../components/BalanceCard';
import ProfitLoss from '../components/ProfitLoss';
import StatisticsChart from '../components/StatisticsChart';
import RecentTransactions from '../components/RecentTransactions';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [spendings, setSpendings] = useState(0);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch payments to calculate balance, income, and spendings
      const paymentsResponse = await axios.get(`${API_URL}/payments`);
      const payments = paymentsResponse.data;

      // Calculate totals
      const totalIncome = payments
        .filter((p: any) => p.status === 'completed')
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      const totalSpendings = payments
        .filter((p: any) => p.status === 'pending')
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      setIncome(totalIncome);
      setSpendings(totalSpendings);
      setBalance(totalIncome - totalSpendings);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard"><p>Loading...</p></div>;
  }

  return (
    <div className="dashboard">
      <Header />

      <div className="dashboard-grid">
        <div className="left-section">
          <BalanceCard balance={balance} />
        </div>

        <div className="right-section">
          <ProfitLoss income={income} spendings={spendings} />
          <StatisticsChart />
        </div>
      </div>

      <div className="bottom-section">
        <RecentTransactions />
      </div>
    </div>
  );
};

export default Dashboard;

