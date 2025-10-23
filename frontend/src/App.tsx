import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Vehicles from './pages/Vehicles';
import Trips from './pages/Trips';
import Transactions from './pages/Transactions';
import Statistics from './pages/Statistics';
import Services from './pages/Services';
import Payments from './pages/Payments';
import Billing from './pages/Billing';
import TripAnalytics from './pages/TripAnalytics';
import EmergencyAlerts from './pages/EmergencyAlerts';
import ServiceScheduling from './pages/ServiceScheduling';
import Reports from './pages/Reports';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/services" element={<Services />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/trip-analytics" element={<TripAnalytics />} />
            <Route path="/emergency-alerts" element={<EmergencyAlerts />} />
            <Route path="/service-scheduling" element={<ServiceScheduling />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

