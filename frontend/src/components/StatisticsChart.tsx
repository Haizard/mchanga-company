import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './StatisticsChart.css';

interface VehicleStats {
  name: string;
  value: number;
}

const StatisticsChart: React.FC = () => {
  const [data, setData] = useState<VehicleStats[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;
  const COLORS = ['#FF6B6B', '#FFC107', '#667EEA', '#4CAF50', '#2196F3'];

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/vehicles`);
      const vehicles = response.data;

      // Group vehicles by status
      const statusCounts = vehicles.reduce((acc: any, vehicle: any) => {
        const status = vehicle.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: value as number
      }));

      setData(chartData);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="statistics-chart"><p>Loading...</p></div>;
  }

  return (
    <div className="statistics-chart">
      <div className="chart-header">
        <h3>Vehicle Status Distribution</h3>
        <select className="period-select">
          <option>Current</option>
          <option>All Time</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="chart-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: COLORS[index] }}
            ></span>
            <span className="legend-label">{item.name}</span>
            <span className="legend-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsChart;

