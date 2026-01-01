import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BudgetAllocation.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function BudgetAllocation({ year, month, segments, onUpdate }) {
  const [segmentBudgets, setSegmentBudgets] = useState({});
  const [totalBudget, setTotalBudget] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgetData();
  }, [year, month]);

  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('budgetToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch segment budgets
      const segmentResponse = await axios.get(`${API_URL}/segment-budgets/${year}/${month}`, { headers });
      const budgets = {};
      segmentResponse.data.forEach(item => {
        budgets[item.segment_id] = item.allocated_amount;
      });
      setSegmentBudgets(budgets);

      // Fetch total budget
      const totalResponse = await axios.get(`${API_URL}/budgets/${year}/${month}`, { headers });
      if (totalResponse.data) {
        setTotalBudget(totalResponse.data.total_budget);
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSegmentBudgetChange = (segmentId, value) => {
    setSegmentBudgets({
      ...segmentBudgets,
      [segmentId]: value
    });
  };

  const handleSaveBudgets = async () => {
    try {
      const token = localStorage.getItem('budgetToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Save total budget
      if (totalBudget) {
        await axios.post(`${API_URL}/budgets`, {
          year,
          month,
          total_budget: parseFloat(totalBudget)
        }, { headers });
      }

      // Save segment budgets
      const promises = segments.map(segment => {
        const amount = segmentBudgets[segment.id] || 0;
        return axios.post(`${API_URL}/segment-budgets`, {
          segment_id: segment.id,
          year,
          month,
          allocated_amount: parseFloat(amount)
        }, { headers });
      });

      await Promise.all(promises);
      alert('Budgets saved successfully!');
      onUpdate();
    } catch (error) {
      console.error('Error saving budgets:', error);
      alert('Error saving budgets');
    }
  };

  const handleCopyPreviousMonth = async () => {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    try {
      const token = localStorage.getItem('budgetToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post(`${API_URL}/segment-budgets/copy-previous`, {
        year,
        month,
        prev_year: prevYear,
        prev_month: prevMonth
      }, { headers });
      
      alert('Previous month budgets copied successfully!');
      fetchBudgetData();
      onUpdate();
    } catch (error) {
      console.error('Error copying budgets:', error);
      alert('Error copying previous month budgets');
    }
  };

  const calculateTotalAllocated = () => {
    return Object.values(segmentBudgets).reduce((sum, val) => sum + parseFloat(val || 0), 0);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return <div className="loading">Loading budget data...</div>;
  }

  const totalAllocated = calculateTotalAllocated();
  const remaining = (parseFloat(totalBudget) || 0) - totalAllocated;

  return (
    <div className="budget-allocation">
      <div className="budget-header">
        <h2>Budget Allocation - {monthNames[month - 1]} {year}</h2>
        <button onClick={handleCopyPreviousMonth} className="copy-btn">
          📋 Copy Previous Month
        </button>
      </div>

      <div className="total-budget-section">
        <label>
          <span className="label-text">Total Monthly Budget:</span>
          <input
            type="number"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            placeholder="Enter total budget"
            className="budget-input"
            min="0"
            step="0.01"
          />
        </label>
        <div className="budget-summary">
          <div className="summary-item">
            <span>Total Budget:</span>
            <strong>₹{parseFloat(totalBudget || 0).toFixed(2)}</strong>
          </div>
          <div className="summary-item">
            <span>Allocated:</span>
            <strong>₹{totalAllocated.toFixed(2)}</strong>
          </div>
          <div className={`summary-item ${remaining < 0 ? 'negative' : 'positive'}`}>
            <span>Remaining:</span>
            <strong>₹{remaining.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div className="segments-allocation">
        <h3>Segment-wise Allocation</h3>
        <div className="segments-grid">
          {segments.map(segment => (
            <div key={segment.id} className="segment-allocation-item">
              <label>
                <span className="segment-name">{segment.name}</span>
                <input
                  type="number"
                  value={segmentBudgets[segment.id] || ''}
                  onChange={(e) => handleSegmentBudgetChange(segment.id, e.target.value)}
                  placeholder="0.00"
                  className="segment-input"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={handleSaveBudgets} className="save-btn">
          💾 Save All Budgets
        </button>
      </div>
    </div>
  );
}

export default BudgetAllocation;
