import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function Dashboard({ year, month, refreshTrigger }) {
  const [monthlyData, setMonthlyData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [viewType, setViewType] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [year, month, refreshTrigger, viewType]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('budgetToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (viewType === 'monthly') {
        const response = await axios.get(`${API_URL}/dashboard/month/${year}/${month}`, { headers });
        setMonthlyData(response.data);
      } else {
        const response = await axios.get(`${API_URL}/dashboard/year/${year}`, { headers });
        setYearlyData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getProgressColor = (spent, budget) => {
    if (budget === 0) return '#ccc';
    const percentage = (spent / budget) * 100;
    if (percentage > 100) return '#f44336';
    if (percentage > 80) return '#ff9800';
    return '#4caf50';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  const data = viewType === 'monthly' ? monthlyData : yearlyData;

  if (!data) {
    return <div className="no-data">No data available</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>
          {viewType === 'monthly' 
            ? `${monthNames[month - 1]} ${year} - Overview`
            : `${year} - Annual Overview`}
        </h2>
        <div className="view-toggle">
          <button 
            className={viewType === 'monthly' ? 'active' : ''}
            onClick={() => setViewType('monthly')}
          >
            Monthly
          </button>
          <button 
            className={viewType === 'yearly' ? 'active' : ''}
            onClick={() => setViewType('yearly')}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card total-budget">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Budget</h3>
            <p className="amount">{formatCurrency(data.totals.budget)}</p>
          </div>
        </div>
        <div className="summary-card total-spent">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <h3>Total Spent</h3>
            <p className="amount">{formatCurrency(data.totals.spent)}</p>
          </div>
        </div>
        <div className="summary-card total-remaining">
          <div className="card-icon">
            {data.totals.remaining >= 0 ? '✅' : '⚠️'}
          </div>
          <div className="card-content">
            <h3>Remaining</h3>
            <p className={`amount ${data.totals.remaining < 0 ? 'negative' : ''}`}>
              {formatCurrency(data.totals.remaining)}
            </p>
          </div>
        </div>
      </div>

      <div className="segments-breakdown">
        <h3>Segment-wise Breakdown</h3>
        <div className="segments-list">
          {data.segments.map((segment) => {
            const percentage = segment.budget > 0 
              ? Math.min((segment.spent / segment.budget) * 100, 100)
              : 0;
            const color = getProgressColor(segment.spent, segment.budget);

            return (
              <div key={segment.id} className="segment-item">
                <div className="segment-header">
                  <h4>{segment.name}</h4>
                  <div className="segment-amounts">
                    <span className="spent">{formatCurrency(segment.spent)}</span>
                    <span className="separator">/</span>
                    <span className="budget">{formatCurrency(segment.budget)}</span>
                  </div>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
                <div className="segment-footer">
                  <span className="remaining">
                    Remaining: {formatCurrency(segment.remaining)}
                  </span>
                  <span className="percentage">
                    {segment.budget > 0 ? `${((segment.spent / segment.budget) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {data.segments.length === 0 && (
        <div className="no-data">
          <p>No budget data available for this period.</p>
          <p>Please allocate a budget first.</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
