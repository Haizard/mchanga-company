import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './TripAnalytics.css';

interface Trip {
  _id: string;
  tripNumber: string;
  vehicle: { make: string; model: string };
  customer: { firstName: string; lastName: string };
  fare: number;
  status: string;
  createdAt: string;
}

interface Analytics {
  totalTrips: number;
  completedTrips: number;
  totalRevenue: number;
  averageFare: number;
  topCustomers: any[];
  tripsByDay: any[];
}

const TripAnalytics: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchTripsAndAnalytics();
  }, [dateRange]);

  const fetchTripsAndAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/trips`);
      const tripsData = response.data;
      setTrips(tripsData);

      // Calculate analytics
      const completed = tripsData.filter((t: Trip) => t.status === 'completed');
      const totalRevenue = completed.reduce((sum: number, t: Trip) => sum + t.fare, 0);
      const avgFare = completed.length > 0 ? totalRevenue / completed.length : 0;

      // Group by customer
      const customerMap = new Map();
      completed.forEach((trip: Trip) => {
        const key = `${trip.customer.firstName} ${trip.customer.lastName}`;
        customerMap.set(key, (customerMap.get(key) || 0) + trip.fare);
      });

      const topCustomers = Array.from(customerMap.entries())
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Group by day
      const dayMap = new Map();
      completed.forEach((trip: Trip) => {
        const date = new Date(trip.createdAt).toLocaleDateString();
        dayMap.set(date, (dayMap.get(date) || 0) + trip.fare);
      });

      const tripsByDay = Array.from(dayMap.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setAnalytics({
        totalTrips: tripsData.length,
        completedTrips: completed.length,
        totalRevenue,
        averageFare: avgFare,
        topCustomers,
        tripsByDay
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;

  return (
    <div className="trip-analytics">
      <div className="page-header">
        <h1>Trip Analytics & History</h1>
        <select 
          value={dateRange} 
          onChange={(e) => setDateRange(e.target.value)}
          className="date-range-select"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {analytics && (
        <>
          <div className="analytics-cards">
            <div className="card">
              <h3>Total Trips</h3>
              <p className="value">{analytics.totalTrips}</p>
              <p className="subtitle">Completed: {analytics.completedTrips}</p>
            </div>
            <div className="card">
              <h3>Total Revenue</h3>
              <p className="value">${analytics.totalRevenue.toLocaleString()}</p>
              <p className="subtitle">From completed trips</p>
            </div>
            <div className="card">
              <h3>Average Fare</h3>
              <p className="value">${analytics.averageFare.toFixed(2)}</p>
              <p className="subtitle">Per trip</p>
            </div>
            <div className="card">
              <h3>Completion Rate</h3>
              <p className="value">
                {analytics.totalTrips > 0 
                  ? ((analytics.completedTrips / analytics.totalTrips) * 100).toFixed(1) 
                  : 0}%
              </p>
              <p className="subtitle">Success rate</p>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-container">
              <h2>Revenue Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.tripsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#667eea" 
                    strokeWidth={2}
                    dot={{ fill: '#667eea', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h2>Top Customers by Revenue</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topCustomers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#764ba2" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="trips-history">
            <h2>Recent Trips</h2>
            <div className="trips-table">
              <table>
                <thead>
                  <tr>
                    <th>Trip #</th>
                    <th>Vehicle</th>
                    <th>Customer</th>
                    <th>Fare</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.slice(0, 10).map(trip => (
                    <tr key={trip._id}>
                      <td>{trip.tripNumber}</td>
                      <td>{trip.vehicle.make} {trip.vehicle.model}</td>
                      <td>{trip.customer.firstName} {trip.customer.lastName}</td>
                      <td className="fare">${trip.fare.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${trip.status}`}>
                          {trip.status}
                        </span>
                      </td>
                      <td>{new Date(trip.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TripAnalytics;

