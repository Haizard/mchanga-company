import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">🚚</div>
          <h1>Lite Kideko</h1>
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link to="/" className={`nav-item ${isActive('/')}`}>
          <span className="nav-icon">📊</span>
          <span className="nav-label">Dashboard</span>
        </Link>
        <Link to="/customers" className={`nav-item ${isActive('/customers')}`}>
          <span className="nav-icon">👥</span>
          <span className="nav-label">Customers</span>
        </Link>
        <Link to="/vehicles" className={`nav-item ${isActive('/vehicles')}`}>
          <span className="nav-icon">🚗</span>
          <span className="nav-label">Vehicles</span>
        </Link>
        <Link to="/trips" className={`nav-item ${isActive('/trips')}`}>
          <span className="nav-icon">🚚</span>
          <span className="nav-label">Trips</span>
        </Link>
        <Link to="/transactions" className={`nav-item ${isActive('/transactions')}`}>
          <span className="nav-icon">💳</span>
          <span className="nav-label">Transactions</span>
        </Link>
        <Link to="/services" className={`nav-item ${isActive('/services')}`}>
          <span className="nav-icon">🔧</span>
          <span className="nav-label">Services</span>
        </Link>
        <Link to="/payments" className={`nav-item ${isActive('/payments')}`}>
          <span className="nav-icon">💰</span>
          <span className="nav-label">Payments</span>
        </Link>
        <Link to="/billing" className={`nav-item ${isActive('/billing')}`}>
          <span className="nav-icon">💳</span>
          <span className="nav-label">Trip Billing</span>
        </Link>
        <Link to="/statistics" className={`nav-item ${isActive('/statistics')}`}>
          <span className="nav-icon">📈</span>
          <span className="nav-label">Statistics</span>
        </Link>
        <Link to="/trip-analytics" className={`nav-item ${isActive('/trip-analytics')}`}>
          <span className="nav-icon">📊</span>
          <span className="nav-label">Trip Analytics</span>
        </Link>
        <Link to="/emergency-alerts" className={`nav-item ${isActive('/emergency-alerts')}`}>
          <span className="nav-icon">🚨</span>
          <span className="nav-label">Emergency Alerts</span>
        </Link>
        <Link to="/service-scheduling" className={`nav-item ${isActive('/service-scheduling')}`}>
          <span className="nav-icon">📅</span>
          <span className="nav-label">Service Scheduling</span>
        </Link>
        <Link to="/reports" className={`nav-item ${isActive('/reports')}`}>
          <span className="nav-icon">📋</span>
          <span className="nav-label">Reports</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn">
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

