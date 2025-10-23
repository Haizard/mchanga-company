import React, { useState } from 'react';
import axios from 'axios';
import './Reports.css';

interface ReportData {
  reportType: string;
  generatedAt: string;
  summary: any;
  data: any[];
  filters?: any;
}

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('trip');
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // Helper function to format cell values for display
  const formatCellValue = (val: any): string => {
    if (val === null || val === undefined) return '-';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      // Handle nested objects (vehicle, customer, etc.)
      if (val._id && val.firstName && val.lastName) {
        return `${val.firstName} ${val.lastName}`;
      }
      if (val._id && val.make && val.model) {
        return `${val.make} ${val.model}`;
      }
      if (val._id && val.registrationNumber) {
        return val.registrationNumber;
      }
      if (Array.isArray(val)) {
        return val.length > 0 ? `[${val.length} items]` : '[]';
      }
      // For other objects, try to find a readable property
      if (val.name) return val.name;
      if (val.title) return val.title;
      return '[Object]';
    }
    return String(val);
  };

  // Helper function to get column headers (skip internal fields)
  const getDisplayColumns = (data: any[]): string[] => {
    if (data.length === 0) return [];
    const allKeys = Object.keys(data[0]);
    // Filter out internal MongoDB fields
    return allKeys.filter(key => !key.startsWith('__') && key !== 'updatedAt');
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setMessage('');

      // Map frontend report types to backend endpoints
      const reportTypeMap: { [key: string]: string } = {
        'trip': 'trip',
        'revenue': 'revenue',
        'vehicle': 'vehicle-performance',
        'customer': 'customer',
        'service': 'service'
      };

      // Convert date strings to ISO format for backend
      // Important: Extend end date to end of day (23:59:59) so all records on that day are included
      let startDate = '';
      let endDate = '';

      if (filters.startDate) {
        const [year, month, day] = filters.startDate.split('-');
        const startDateObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0));
        startDate = startDateObj.toISOString();
      }

      if (filters.endDate) {
        const [year, month, day] = filters.endDate.split('-');
        const endDateObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 23, 59, 59, 999));
        endDate = endDateObj.toISOString();
      }

      const reportFilters = {
        ...filters,
        startDate: startDate,
        endDate: endDate
      };

      const endpoint = `${API_URL}/reports/${reportTypeMap[reportType] || reportType}`;
      console.log('Generating report from endpoint:', endpoint);
      console.log('Filters (converted to ISO):', reportFilters);

      const response = await axios.post(endpoint, reportFilters);
      console.log('Report response:', response.data);

      setReport(response.data);
      setMessage(`✅ Report generated successfully with ${response.data.data.length} records`);
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error generating report:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to generate report';
      setMessage(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      if (format === 'pdf') {
        exportPDF();
        return;
      }

      // Convert date strings to ISO format for backend
      // Important: Extend end date to end of day (23:59:59) so all records on that day are included
      let startDate = '';
      let endDate = '';

      if (filters.startDate) {
        const [year, month, day] = filters.startDate.split('-');
        const startDateObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0));
        startDate = startDateObj.toISOString();
      }

      if (filters.endDate) {
        const [year, month, day] = filters.endDate.split('-');
        const endDateObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 23, 59, 59, 999));
        endDate = endDateObj.toISOString();
      }

      const reportFilters = {
        ...filters,
        startDate: startDate,
        endDate: endDate
      };

      const endpoint = `${API_URL}/reports/export/${format}`;
      const response = await axios.post(
        endpoint,
        { reportType, filters: reportFilters },
        { responseType: format === 'csv' ? 'blob' : 'json' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      setMessage(`✅ Report exported as ${format.toUpperCase()}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting report:', error);
      setMessage('❌ Failed to export report');
    }
  };

  const exportPDF = () => {
    try {
      if (!report) {
        setMessage('❌ No report to export');
        return;
      }

      // Create a new window for printing
      const printWindow = window.open('', '', 'height=600,width=800');
      if (!printWindow) {
        setMessage('❌ Failed to open print window');
        return;
      }

      // Build HTML content
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${report.reportType}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #2196F3; padding-bottom: 10px; }
            h2 { color: #555; margin-top: 20px; }
            .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0; }
            .summary-item { background: #f5f5f5; padding: 10px; border-radius: 5px; }
            .summary-item .label { font-weight: bold; color: #2196F3; }
            .summary-item .value { font-size: 18px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { background: #2196F3; color: white; padding: 10px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background: #f9f9f9; }
            .footer { margin-top: 30px; font-size: 12px; color: #999; }
            .generated-date { color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>${report.reportType}</h1>
          <p class="generated-date">Generated: ${new Date(report.generatedAt).toLocaleString()}</p>

          <h2>Summary</h2>
          <div class="summary-grid">
      `;

      // Add summary items
      Object.entries(report.summary).forEach(([key, value]) => {
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        htmlContent += `
          <div class="summary-item">
            <div class="label">${key}</div>
            <div class="value">${displayValue}</div>
          </div>
        `;
      });

      htmlContent += `
          </div>

          <h2>Data</h2>
      `;

      // Add data table
      if (report.data.length > 0) {
        htmlContent += '<table><thead><tr>';
        Object.keys(report.data[0]).forEach(key => {
          htmlContent += `<th>${key}</th>`;
        });
        htmlContent += '</tr></thead><tbody>';

        report.data.forEach(row => {
          htmlContent += '<tr>';
          Object.values(row).forEach((val: any) => {
            const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
            htmlContent += `<td>${displayVal}</td>`;
          });
          htmlContent += '</tr>';
        });

        htmlContent += '</tbody></table>';
      } else {
        htmlContent += '<p>No data available</p>';
      }

      htmlContent += `
          <div class="footer">
            <p>This report was generated by Lite Kideko Fleet Management System</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Trigger print dialog
      setTimeout(() => {
        printWindow.print();
        setMessage('✅ PDF export ready (use browser print dialog)');
        setTimeout(() => setMessage(''), 3000);
      }, 250);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setMessage('❌ Failed to export PDF');
    }
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>📋 Reports & Analytics</h1>
      </div>

      <div className="reports-container">
        {message && <div className="message">{message}</div>}

        <div className="report-controls">
          <h2>Generate Report</h2>

          <div className="form-group">
            <label>Report Type</label>
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="trip">Trip Report</option>
              <option value="revenue">Revenue Report</option>
              <option value="vehicle">Vehicle Performance</option>
              <option value="customer">Customer Report</option>
              <option value="service">Service Report</option>
            </select>
          </div>

          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Status (Optional)</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button 
            className="btn-generate"
            onClick={generateReport}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        {report && (
          <div className="report-display">
            <div className="report-header">
              <h2>{report.reportType}</h2>
              <p className="generated-date">
                Generated: {new Date(report.generatedAt).toLocaleString()}
              </p>
            </div>

            <div className="report-summary">
              <h3>Summary</h3>
              <div className="summary-grid">
                {Object.entries(report.summary).map(([key, value]) => (
                  <div key={key} className="summary-item">
                    <span className="label">{key}</span>
                    <span className="value">
                      {typeof value === 'object' 
                        ? JSON.stringify(value) 
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="report-data">
              <h3>Data</h3>
              {report.data.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        {getDisplayColumns(report.data).map(key => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {report.data.map((row, idx) => {
                        const displayColumns = getDisplayColumns(report.data);
                        return (
                          <tr key={idx}>
                            {displayColumns.map((col) => (
                              <td key={col}>
                                {formatCellValue(row[col])}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No data available</p>
              )}
            </div>

            <div className="export-buttons">
              <button
                className="btn-export csv"
                onClick={() => exportReport('csv')}
              >
                📥 Export as CSV
              </button>
              <button
                className="btn-export json"
                onClick={() => exportReport('json')}
              >
                📥 Export as JSON
              </button>
              <button
                className="btn-export pdf"
                onClick={() => exportReport('pdf')}
              >
                📄 Export as PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

