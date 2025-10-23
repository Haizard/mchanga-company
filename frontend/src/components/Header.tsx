import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search..." 
          className="search-input"
        />
        <button className="search-btn">🔍</button>
      </div>

      <div className="header-actions">
        <button className="icon-btn">🔔</button>
        <button className="icon-btn">⚙️</button>
        <div className="user-profile">
          <div className="avatar">👤</div>
        </div>
      </div>
    </header>
  );
};

export default Header;

