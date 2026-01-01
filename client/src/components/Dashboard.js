import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function Dashboard({ year, month, refreshTrigger, onAddExpenseClick }) {
  const [monthlyData, setMonthlyData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [viewType, setViewType] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [expandedSegments, setExpandedSegments] = useState({});
  const [segmentExpenses, setSegmentExpenses] = useState({});
  const [loadingExpenses, setLoadingExpenses] = useState({});

  useEffect(() => {
    fetchDashboardData();
    // Reset expanded segments when view changes
    setExpandedSegments({});
    setSegmentExpenses({});
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

  const fetchSegmentExpenses = async (segmentId) => {
    setLoadingExpenses(prev => ({ ...prev, [segmentId]: true }));
    try {
      const token = localStorage.getItem('budgetToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      let response;
      if (viewType === 'monthly') {
        response = await axios.get(`${API_URL}/expenses/${year}/${month}`, { headers });
        // Filter expenses for this segment
        const filtered = response.data.filter(exp => exp.segment_id === segmentId);
        setSegmentExpenses(prev => ({ ...prev, [segmentId]: filtered }));
      } else {
        // For yearly view, get all expenses for the year
        response = await axios.get(`${API_URL}/expenses/year/${year}`, { headers });
        // Filter expenses for this segment
        const filtered = response.data.filter(exp => exp.segment_id === segmentId);
        setSegmentExpenses(prev => ({ ...prev, [segmentId]: filtered }));
      }
    } catch (error) {
      console.error('Error fetching segment expenses:', error);
    } finally {
      setLoadingExpenses(prev => ({ ...prev, [segmentId]: false }));
    }
  };

  const toggleSegmentExpand = (segmentId) => {
    const isExpanding = !expandedSegments[segmentId];
    setExpandedSegments(prev => ({ ...prev, [segmentId]: isExpanding }));
    
    // Fetch expenses if expanding and not already loaded
    if (isExpanding && !segmentExpenses[segmentId]) {
      fetchSegmentExpenses(segmentId);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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
        <div className="dashboard-actions">
          <button 
            onClick={onAddExpenseClick}
            className="add-expense-btn"
            title="Add a new expense"
          >
            ➕ Add Expense
          </button>
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
        <h3>Segment-wise Breakdown <span className="hint">(Click to expand)</span></h3>
        <div className="segments-list">
          {data.segments.map((segment) => {
            const percentage = segment.budget > 0 
              ? Math.min((segment.spent / segment.budget) * 100, 100)
              : 0;
            const color = getProgressColor(segment.spent, segment.budget);
            const isExpanded = expandedSegments[segment.id];
            const expenses = segmentExpenses[segment.id] || [];
            const isLoadingExpenses = loadingExpenses[segment.id];

            return (
              <div key={segment.id} className={`segment-item ${isExpanded ? 'expanded' : ''}`}>
                <div 
                  className="segment-header clickable" 
                  onClick={() => toggleSegmentExpand(segment.id)}
                >
                  <div className="segment-title">
                    <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                    <h4>{segment.name}</h4>
                  </div>
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

                {/* Expanded Section - Show Expenses */}
                {isExpanded && (
                  <div className="segment-expenses">
                    {isLoadingExpenses ? (
                      <div className="expenses-loading">Loading expenses...</div>
                    ) : expenses.length === 0 ? (
                      <div className="no-expenses-message">
                        No expenses recorded for this segment in this {viewType === 'monthly' ? 'month' : 'year'}.
                      </div>
                    ) : (
                      <div className="expenses-table-wrapper">
                        <table className="expenses-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              {viewType === 'yearly' && <th>Month</th>}
                              <th>Description</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expenses.map(expense => (
                              <tr key={expense.id}>
                                <td>{formatDate(expense.expense_date)}</td>
                                {viewType === 'yearly' && (
                                  <td>{monthNames[expense.month - 1]}</td>
                                )}
                                <td>{expense.description || '-'}</td>
                                <td className="expense-amount">{formatCurrency(expense.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="total-row">
                              <td colSpan={viewType === 'yearly' ? 3 : 2}><strong>Total</strong></td>
                              <td className="expense-amount"><strong>{formatCurrency(segment.spent)}</strong></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                )}
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
