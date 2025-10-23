import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Sidebar from '../components/Sidebar';
import VehicleTracker from '../components/VehicleTracker';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  return {
    io: jest.fn(() => ({
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      connected: true
    }))
  };
});

describe('Frontend Components', () => {
  describe('Sidebar Component', () => {
    it('should render sidebar with all navigation items', () => {
      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      expect(screen.getByText('Mchanga')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Customers')).toBeInTheDocument();
      expect(screen.getByText('Vehicles')).toBeInTheDocument();
      expect(screen.getByText('Transactions')).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByText('Payments')).toBeInTheDocument();
      expect(screen.getByText('Statistics')).toBeInTheDocument();
    });

    it('should highlight active route', () => {
      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('active');
    });

    it('should have logout button', () => {
      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      expect(screen.getByText('Sign out')).toBeInTheDocument();
    });

    it('should have correct navigation links', () => {
      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('VehicleTracker Component', () => {
    it('should render tracker header', () => {
      render(<VehicleTracker vehicleId="123" />);
      expect(screen.getByText(/Real-Time Vehicle Tracking/i)).toBeInTheDocument();
    });

    it('should show connection status', () => {
      render(<VehicleTracker vehicleId="123" />);
      expect(screen.getByText(/Connected|Disconnected/)).toBeInTheDocument();
    });

    it('should render control buttons', () => {
      render(<VehicleTracker vehicleId="123" />);
      expect(screen.getByText(/Start Tracking/i)).toBeInTheDocument();
      expect(screen.getByText(/Stop Tracking/i)).toBeInTheDocument();
      expect(screen.getByText(/Subscribe/i)).toBeInTheDocument();
      expect(screen.getByText(/Update Location/i)).toBeInTheDocument();
    });

    it('should render view all tracking button', () => {
      render(<VehicleTracker vehicleId="123" />);
      expect(screen.getByText(/View All Active Tracking/i)).toBeInTheDocument();
    });

    it('should handle start tracking click', () => {
      render(<VehicleTracker vehicleId="123" />);
      const startButton = screen.getByText(/Start Tracking/i);
      fireEvent.click(startButton);
      expect(startButton).toBeInTheDocument();
    });

    it('should display tracking info when available', async () => {
      render(<VehicleTracker vehicleId="123" />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Current Tracking/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});

