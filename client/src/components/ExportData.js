import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const ExportData = ({ currentMonth, currentYear, setCurrentMonth, setCurrentYear }) => {
  const [exportType, setExportType] = useState('monthly'); // 'monthly' or 'yearly'
  const [isExporting, setIsExporting] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const convertToCSV = (data) => {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const escaped = ('' + value).replace(/"/g, '""');
        return value === null || value === undefined ? '' : `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let response;
      let filename;

      if (exportType === 'monthly') {
        response = await axios.get(`${API_URL}/export/monthly/${currentYear}/${currentMonth}`);
        filename = `budget_report_${months[currentMonth - 1]}_${currentYear}.csv`;
      } else {
        response = await axios.get(`${API_URL}/export/yearly/${currentYear}`);
        filename = `budget_report_${currentYear}.csv`;
      }

      const csvContent = convertToCSV(response.data);

      if (!csvContent) {
        alert('No data available to export');
        return;
      }

      downloadCSV(csvContent, filename);
      alert('Export successful!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="content-card">
      <h2>📤 Export Data</h2>

      <div className="form-group">
        <label>Export Type:</label>
        <select value={exportType} onChange={(e) => setExportType(e.target.value)}>
          <option value="monthly">Monthly Report</option>
          <option value="yearly">Yearly Report</option>
        </select>
      </div>

      {exportType === 'monthly' ? (
        <div className="month-selector">
          <label>Month:</label>
          <select value={currentMonth} onChange={(e) => setCurrentMonth(parseInt(e.target.value))}>
            {months.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>

          <label>Year:</label>
          <input
            type="number"
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            min="2000"
            max="2100"
          />
        </div>
      ) : (
        <div className="form-group">
          <label>Year:</label>
          <input
            type="number"
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            min="2000"
            max="2100"
          />
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <button
          className="btn btn-primary"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? '⏳ Exporting...' : '📥 Export to CSV'}
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '10px' }}>
        <h3 style={{ marginBottom: '1rem' }}>📋 Export Information</h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <strong>Monthly Report includes:</strong>
          <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
            <li>Budget allocation for each segment</li>
            <li>All expenses with dates and descriptions</li>
            <li>Amounts for each transaction</li>
          </ul>
        </div>

        <div>
          <strong>Yearly Report includes:</strong>
          <ul style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
            <li>Complete breakdown by month and segment</li>
            <li>All expenses throughout the year</li>
            <li>Budget allocations for each month</li>
            <li>Comprehensive financial overview</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExportData;

