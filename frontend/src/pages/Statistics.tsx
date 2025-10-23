import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Statistics.css';

interface Stats {
  totalVehicles: number;
  totalCustomers: number;
  totalTrips: number;
  totalRevenue: number;
  activeVehicles: number;
  completedTrips: number;
}

const Statistics: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalVehicles: 0,
    totalCustomers: 0,
    totalTrips: 0,
    totalRevenue: 0,
    activeVehicles: 0,
    completedTrips: 0
  });
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const [vehicles, customers, trips, payments] = await Promise.all([
        axios.get(`${API_URL}/vehicles`),
        axios.get(`${API_URL}/customers`),
        axios.get(`${API_URL}/trips`),
        axios.get(`${API_URL}/payments`)
      ]);

      const activeVehicles = vehicles.data.filter((v: any) => v.status === 'active').length;
      const completedTrips = trips.data.filter((t: any) => t.status === 'completed').length;
      const totalRevenue = payments.data
        .filter((p: any) => p.status === 'completed')
        .reduce((sum: number, p: any) => sum + p.amount, 0);

      setStats({
        totalVehicles: vehicles.data.length,
        totalCustomers: customers.data.length,
        totalTrips: trips.data.length,
        totalRevenue,
        activeVehicles,
        completedTrips
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Vehicles', value: stats.totalVehicles },
    { name: 'Customers', value: stats.totalCustomers },
    { name: 'Trips', value: stats.totalTrips }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 2000 },
    { month: 'Apr', revenue: 2780 },
    { month: 'May', revenue: 1890 },
    { month: 'Jun', revenue: 2390 }
  ];

  const COLORS = ['#667eea', '#764ba2', '#ff6b6b'];

  if (loading) return <div className="loading">Loading statistics...</div>;

  return (
    <div className="statistics-page">
      <h1>Statistics & Analytics</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <h3>Total Vehicles</h3>
            <p className="stat-value">{stats.totalVehicles}</p>
            <p className="stat-subtitle">{stats.activeVehicles} active</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Customers</h3>
            <p className="stat-value">{stats.totalCustomers}</p>
            <p className="stat-subtitle">Registered customers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛣️</div>
          <div className="stat-content">
            <h3>Total Trips</h3>
            <p className="stat-value">{stats.totalTrips}</p>
            <p className="stat-subtitle">{stats.completedTrips} completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats.totalRevenue.toLocaleString()}</p>
            <p className="stat-subtitle">From completed trips</p>
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h2>Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#667eea" 
                strokeWidth={2}
                dot={{ fill: '#667eea', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card full-width">
          <h2>Monthly Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

