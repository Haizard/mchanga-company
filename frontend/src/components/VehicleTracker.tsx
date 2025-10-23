import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import './VehicleTracker.css';

interface TrackingData {
  vehicleId: string;
  status: string;
  currentLocation: { latitude: number; longitude: number };
  distance: number;
  speed: number;
  lastUpdate: string;
}

interface TrackingStats {
  vehicleId: string;
  distance: string;
  duration: number;
  averageSpeed: string;
  currentSpeed: number;
  status: string;
}

const VehicleTracker: React.FC<{ vehicleId?: string }> = ({ vehicleId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [allTracking, setAllTracking] = useState<TrackingData[]>([]);

  useEffect(() => {
    // Connect to WebSocket server
    const newSocket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('Connected to tracking server');
    });

    newSocket.on('tracking-data', (data: TrackingData) => {
      setTracking(data);
    });

    newSocket.on('location-update', (data: TrackingData) => {
      setTracking(data);
    });

    newSocket.on('tracking-started', (data: TrackingData) => {
      setTracking(data);
      setIsTracking(true);
    });

    newSocket.on('tracking-stopped', (data: any) => {
      setIsTracking(false);
    });

    newSocket.on('tracking-stats', (data: TrackingStats) => {
      setStats(data);
    });

    newSocket.on('all-tracking', (data: TrackingData[]) => {
      setAllTracking(data);
    });

    newSocket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleStartTracking = () => {
    if (socket && vehicleId) {
      socket.emit('start-tracking', vehicleId);
    }
  };

  const handleStopTracking = () => {
    if (socket && vehicleId) {
      socket.emit('stop-tracking', vehicleId);
    }
  };

  const handleSubscribe = () => {
    if (socket && vehicleId) {
      socket.emit('subscribe-tracking', vehicleId);
    }
  };

  const handleGetStats = () => {
    if (socket && vehicleId) {
      socket.emit('get-stats', vehicleId);
    }
  };

  const handleGetAllTracking = () => {
    if (socket) {
      socket.emit('get-all-tracking');
    }
  };

  const handleUpdateLocation = () => {
    if (socket && vehicleId) {
      // Simulate location update (in production, use GPS)
      const lat = -1.2921 + (Math.random() - 0.5) * 0.01;
      const lon = 36.8219 + (Math.random() - 0.5) * 0.01;
      socket.emit('update-location', {
        vehicleId,
        latitude: lat,
        longitude: lon
      });
    }
  };

  return (
    <div className="vehicle-tracker">
      <div className="tracker-header">
        <h2>🚗 Real-Time Vehicle Tracking</h2>
        <div className="connection-status">
          <span className={`status-dot ${socket?.connected ? 'connected' : 'disconnected'}`}></span>
          <span>{socket?.connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {vehicleId && (
        <div className="tracker-controls">
          <button 
            className="btn-control"
            onClick={handleStartTracking}
            disabled={isTracking}
          >
            ▶ Start Tracking
          </button>
          <button 
            className="btn-control"
            onClick={handleStopTracking}
            disabled={!isTracking}
          >
            ⏹ Stop Tracking
          </button>
          <button 
            className="btn-control"
            onClick={handleSubscribe}
          >
            📡 Subscribe
          </button>
          <button 
            className="btn-control"
            onClick={handleUpdateLocation}
          >
            📍 Update Location
          </button>
          <button 
            className="btn-control"
            onClick={handleGetStats}
          >
            📊 Get Stats
          </button>
        </div>
      )}

      <button 
        className="btn-control full-width"
        onClick={handleGetAllTracking}
      >
        🗺️ View All Active Tracking
      </button>

      {tracking && (
        <div className="tracking-info">
          <h3>Current Tracking</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Vehicle ID:</span>
              <span className="value">{tracking.vehicleId}</span>
            </div>
            <div className="info-item">
              <span className="label">Status:</span>
              <span className={`value status-${tracking.status}`}>
                {tracking.status}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Latitude:</span>
              <span className="value">{tracking.currentLocation.latitude.toFixed(6)}</span>
            </div>
            <div className="info-item">
              <span className="label">Longitude:</span>
              <span className="value">{tracking.currentLocation.longitude.toFixed(6)}</span>
            </div>
            <div className="info-item">
              <span className="label">Distance:</span>
              <span className="value">{tracking.distance.toFixed(2)} km</span>
            </div>
            <div className="info-item">
              <span className="label">Speed:</span>
              <span className="value">{tracking.speed.toFixed(2)} km/h</span>
            </div>
            <div className="info-item">
              <span className="label">Last Update:</span>
              <span className="value">
                {new Date(tracking.lastUpdate).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="tracking-stats">
          <h3>Tracking Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="label">Total Distance:</span>
              <span className="value">{stats.distance} km</span>
            </div>
            <div className="stat-item">
              <span className="label">Duration:</span>
              <span className="value">{Math.floor(stats.duration / 60)} min</span>
            </div>
            <div className="stat-item">
              <span className="label">Average Speed:</span>
              <span className="value">{stats.averageSpeed} km/h</span>
            </div>
            <div className="stat-item">
              <span className="label">Current Speed:</span>
              <span className="value">{stats.currentSpeed.toFixed(2)} km/h</span>
            </div>
          </div>
        </div>
      )}

      {allTracking.length > 0 && (
        <div className="all-tracking">
          <h3>Active Vehicles ({allTracking.length})</h3>
          <div className="tracking-list">
            {allTracking.map(track => (
              <div key={track.vehicleId} className="tracking-item">
                <div className="item-header">
                  <span className="vehicle-id">{track.vehicleId}</span>
                  <span className={`status-badge ${track.status}`}>
                    {track.status}
                  </span>
                </div>
                <div className="item-details">
                  <span>📍 {track.currentLocation.latitude.toFixed(4)}, {track.currentLocation.longitude.toFixed(4)}</span>
                  <span>📏 {track.distance.toFixed(2)} km</span>
                  <span>⚡ {track.speed.toFixed(2)} km/h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleTracker;

