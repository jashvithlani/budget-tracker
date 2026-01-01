import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import BudgetAllocation from './components/BudgetAllocation';
import ExpenseManager from './components/ExpenseManager';
import SegmentManager from './components/SegmentManager';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [segments, setSegments] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      const response = await axios.get(`${API_URL}/segments`);
      setSegments(response.data);
    } catch (error) {
      console.error('Error fetching segments:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchSegments();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleExport = async (type) => {
    try {
      let url;
      if (type === 'month') {
        url = `${API_URL}/export/month/${selectedYear}/${selectedMonth}`;
      } else {
        url = `${API_URL}/export/year/${selectedYear}`;
      }
      
      window.location.href = url;
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Error exporting data');
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>💰 Budget Tracker</h1>
        <div className="header-controls">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="month-select"
          >
            {monthNames.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="year-input"
            min="2000"
            max="2100"
          />
        </div>
      </header>

      <nav className="app-nav">
        <button 
          className={currentView === 'dashboard' ? 'active' : ''}
          onClick={() => setCurrentView('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={currentView === 'budget' ? 'active' : ''}
          onClick={() => setCurrentView('budget')}
        >
          💵 Budget Allocation
        </button>
        <button 
          className={currentView === 'expenses' ? 'active' : ''}
          onClick={() => setCurrentView('expenses')}
        >
          🛒 Expenses
        </button>
        <button 
          className={currentView === 'segments' ? 'active' : ''}
          onClick={() => setCurrentView('segments')}
        >
          📁 Manage Segments
        </button>
        <div className="export-buttons">
          <button onClick={() => handleExport('month')} className="export-btn">
            📥 Export Month
          </button>
          <button onClick={() => handleExport('year')} className="export-btn">
            📥 Export Year
          </button>
        </div>
      </nav>

      <main className="app-main">
        {currentView === 'dashboard' && (
          <Dashboard 
            year={selectedYear} 
            month={selectedMonth}
            refreshTrigger={refreshTrigger}
          />
        )}
        {currentView === 'budget' && (
          <BudgetAllocation 
            year={selectedYear} 
            month={selectedMonth}
            segments={segments}
            onUpdate={handleRefresh}
          />
        )}
        {currentView === 'expenses' && (
          <ExpenseManager 
            year={selectedYear} 
            month={selectedMonth}
            segments={segments}
            onUpdate={handleRefresh}
          />
        )}
        {currentView === 'segments' && (
          <SegmentManager 
            segments={segments}
            onUpdate={handleRefresh}
          />
        )}
      </main>
    </div>
  );
}

export default App;
