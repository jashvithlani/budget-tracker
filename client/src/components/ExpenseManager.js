import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExpenseManager.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function ExpenseManager({ year, month, segments, onUpdate }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    segment_id: '',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    year: year,
    month: month
  });

  useEffect(() => {
    fetchExpenses();
  }, [year, month]);

  useEffect(() => {
    // Update form year and month when props change
    setFormData(prev => ({ ...prev, year, month }));
  }, [year, month]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/expenses/${year}/${month}`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const expenseYear = selectedDate.getFullYear();
    const expenseMonth = selectedDate.getMonth() + 1;
    
    setFormData({
      ...formData,
      expense_date: e.target.value,
      year: expenseYear,
      month: expenseMonth
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingExpense) {
        await axios.put(`${API_URL}/expenses/${editingExpense.id}`, formData);
        alert('Expense updated successfully!');
      } else {
        await axios.post(`${API_URL}/expenses`, formData);
        alert('Expense added successfully!');
      }
      
      resetForm();
      fetchExpenses();
      onUpdate();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error saving expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      segment_id: expense.segment_id,
      amount: expense.amount,
      description: expense.description,
      expense_date: expense.expense_date,
      year: expense.year,
      month: expense.month
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/expenses/${id}`);
      alert('Expense deleted successfully!');
      fetchExpenses();
      onUpdate();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error deleting expense');
    }
  };

  const resetForm = () => {
    setFormData({
      segment_id: '',
      amount: '',
      description: '',
      expense_date: new Date().toISOString().split('T')[0],
      year: year,
      month: month
    });
    setEditingExpense(null);
    setShowAddForm(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  };

  if (loading) {
    return <div className="loading">Loading expenses...</div>;
  }

  return (
    <div className="expense-manager">
      <div className="expense-header">
        <div>
          <h2>Expenses - {monthNames[month - 1]} {year}</h2>
          <p className="total-expenses">
            Total: {formatCurrency(getTotalExpenses())}
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="add-btn"
        >
          {showAddForm ? '❌ Cancel' : '➕ Add Expense'}
        </button>
      </div>

      {showAddForm && (
        <div className="expense-form-container">
          <h3>{editingExpense ? '✏️ Edit Expense' : '➕ Add New Expense'}</h3>
          <form onSubmit={handleSubmit} className="expense-form">
            <div className="form-row">
              <div className="form-group">
                <label>Segment *</label>
                <select
                  name="segment_id"
                  value={formData.segment_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a segment</option>
                  {segments.map(segment => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  name="expense_date"
                  value={formData.expense_date}
                  onChange={handleDateChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingExpense ? '💾 Update Expense' : '➕ Add Expense'}
              </button>
              {editingExpense && (
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="expenses-list">
        <h3>Expense History</h3>
        {expenses.length === 0 ? (
          <div className="no-expenses">
            <p>No expenses recorded for this month.</p>
            <p>Click "Add Expense" to get started!</p>
          </div>
        ) : (
          <div className="expenses-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Segment</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(expense => (
                  <tr key={expense.id}>
                    <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
                    <td>
                      <span className="segment-badge">{expense.segment_name}</span>
                    </td>
                    <td>{expense.description || '-'}</td>
                    <td className="amount-cell">{formatCurrency(expense.amount)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEdit(expense)}
                          className="edit-btn"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(expense.id)}
                          className="delete-btn"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpenseManager;

