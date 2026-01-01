import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import BudgetAllocation from './components/BudgetAllocation';
import ExpenseManager from './components/ExpenseManager';
import SegmentManager from './components/SegmentManager';
import Login from './components/Login';
import { ToastProvider } from './components/Toast';
import { ConfirmProvider } from './components/ConfirmModal';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [segments, setSegments] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSegments();
    }
  }, [isAuthenticated]);

  const checkAuthentication = async () => {
    const token = localStorage.getItem('budgetToken');
    
    if (!token) {
      setIsAuthenticated(false);
      setIsCheckingAuth(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/verify-token`, { token });
      if (response.data.valid) {
        setIsAuthenticated(true);
        setCurrentUser(response.data.user);
      } else {
        localStorage.removeItem('budgetToken');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('budgetToken');
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('budgetToken');
      await axios.post(`${API_URL}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear all localStorage and force full reload
    localStorage.clear();
    window.location.reload();
  };

  const fetchSegments = async () => {
    try {
      const token = localStorage.getItem('budgetToken');
      const response = await axios.get(`${API_URL}/segments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSegments(response.data);
    } catch (error) {
      console.error('Error fetching segments:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchSegments();
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.5rem',
          color: 'white'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <ConfirmProvider>
        <ToastProvider>
          <Login onLoginSuccess={handleLoginSuccess} />
        </ToastProvider>
      </ConfirmProvider>
    );
  }

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
    <ConfirmProvider>
      <ToastProvider>
        <div className="App">
      <header className="app-header">
        <div>
          <h1>💰 Budget Tracker</h1>
          {currentUser && (
            <p className="user-greeting">Welcome, {currentUser.displayName}!</p>
          )}
        </div>
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
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            🚪 Logout
          </button>
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
            onAddExpenseClick={() => setCurrentView('expenses')}
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
      </ToastProvider>
    </ConfirmProvider>
  );
}

export default App;
