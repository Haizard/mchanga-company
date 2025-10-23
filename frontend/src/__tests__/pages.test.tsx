import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TripAnalytics from '../pages/TripAnalytics';
import EmergencyAlerts from '../pages/EmergencyAlerts';
import ServiceScheduling from '../pages/ServiceScheduling';
import Reports from '../pages/Reports';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: {} }))
}));

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

// Mock environment variables
process.env.VITE_API_URL = 'http://localhost:5000/api';

describe('Frontend Pages', () => {
  describe('TripAnalytics Page', () => {
    it('should render page header', async () => {
      render(<TripAnalytics />);
      await waitFor(() => {
        expect(screen.getByText(/Trip Analytics & History/i)).toBeInTheDocument();
      });
    });

    it('should render date range selector', async () => {
      render(<TripAnalytics />);
      await waitFor(() => {
        const select = screen.getByDisplayValue('Last Month');
        expect(select).toBeInTheDocument();
      });
    });

    it('should render analytics cards', async () => {
      render(<TripAnalytics />);
      await waitFor(() => {
        expect(screen.getByText(/Total Trips/i)).toBeInTheDocument();
        expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
        expect(screen.getByText(/Average Fare/i)).toBeInTheDocument();
      });
    });

    it('should render charts', async () => {
      render(<TripAnalytics />);
      await waitFor(() => {
        expect(screen.getByText(/Revenue Trend/i)).toBeInTheDocument();
        expect(screen.getByText(/Top Customers by Revenue/i)).toBeInTheDocument();
      });
    });
  });

  describe('EmergencyAlerts Page', () => {
    it('should render page header', async () => {
      render(<EmergencyAlerts />);
      await waitFor(() => {
        expect(screen.getByText(/Emergency Alerts Management/i)).toBeInTheDocument();
      });
    });

    it('should render report emergency form', async () => {
      render(<EmergencyAlerts />);
      await waitFor(() => {
        expect(screen.getByText(/Report Emergency/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Vehicle ID/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Emergency Type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Severity/i)).toBeInTheDocument();
      });
    });

    it('should render alert statistics', async () => {
      render(<EmergencyAlerts />);
      await waitFor(() => {
        expect(screen.getByText(/Total Alerts/i)).toBeInTheDocument();
        expect(screen.getByText(/Critical/i)).toBeInTheDocument();
        expect(screen.getByText(/Active/i)).toBeInTheDocument();
      });
    });

    it('should render severity filter', async () => {
      render(<EmergencyAlerts />);
      await waitFor(() => {
        const select = screen.getByDisplayValue('All Severities');
        expect(select).toBeInTheDocument();
      });
    });
  });

  describe('ServiceScheduling Page', () => {
    it('should render page header', async () => {
      render(<ServiceScheduling />);
      await waitFor(() => {
        expect(screen.getByText(/Service Scheduling System/i)).toBeInTheDocument();
      });
    });

    it('should render schedule form', async () => {
      render(<ServiceScheduling />);
      await waitFor(() => {
        expect(screen.getByText(/Schedule New Service/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Vehicle ID/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Service Type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Service Date/i)).toBeInTheDocument();
      });
    });

    it('should render service statistics', async () => {
      render(<ServiceScheduling />);
      await waitFor(() => {
        expect(screen.getByText(/Total Services/i)).toBeInTheDocument();
        expect(screen.getByText(/Scheduled/i)).toBeInTheDocument();
        expect(screen.getByText(/Completed/i)).toBeInTheDocument();
      });
    });

    it('should render status filter', async () => {
      render(<ServiceScheduling />);
      await waitFor(() => {
        const select = screen.getByDisplayValue('All Status');
        expect(select).toBeInTheDocument();
      });
    });
  });

  describe('Reports Page', () => {
    it('should render page header', async () => {
      render(<Reports />);
      await waitFor(() => {
        expect(screen.getByText(/Reports & Analytics/i)).toBeInTheDocument();
      });
    });

    it('should render report type selector', async () => {
      render(<Reports />);
      await waitFor(() => {
        expect(screen.getByLabelText(/Report Type/i)).toBeInTheDocument();
      });
    });

    it('should render date filters', async () => {
      render(<Reports />);
      await waitFor(() => {
        expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
      });
    });

    it('should render generate button', async () => {
      render(<Reports />);
      await waitFor(() => {
        expect(screen.getByText(/Generate Report/i)).toBeInTheDocument();
      });
    });

    it('should handle generate report click', async () => {
      render(<Reports />);
      await waitFor(() => {
        const button = screen.getByText(/Generate Report/i);
        fireEvent.click(button);
        expect(button).toBeInTheDocument();
      });
    });
  });
});

