import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = 'http://localhost:5000/api';

const ExpenseTracker = ({ currentMonth, currentYear, setCurrentMonth, setCurrentYear, segments }) => {
  const [expenses, setExpenses] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    segment_id: '',
    amount: '',
    description: '',
    expense_date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchExpenses();
  }, [currentMonth, currentYear]);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API_URL}/expenses/${currentYear}/${currentMonth}`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      segment_id: '',
      amount: '',
      description: '',
      expense_date: format(new Date(), 'yyyy-MM-dd')
    });
    setShowAddExpense(false);
    setEditingExpense(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.segment_id || !formData.amount || !formData.expense_date) {
      alert('Please fill in all required fields');
      return;
    }

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
      description: expense.description || '',
      expense_date: expense.expense_date
    });
    setShowAddExpense(true);
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/expenses/${expenseId}`);
      alert('Expense deleted successfully!');
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error deleting expense');
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  return (
    <div className="content-card">
      <h2>📝 Expense Tracker</h2>

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

      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-primary btn-small" onClick={() => setShowAddExpense(!showAddExpense)}>
          ➕ {editingExpense ? 'Edit' : 'Add'} Expense
        </button>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          Total: <span className="status-negative">${totalExpenses.toFixed(2)}</span>
        </div>
      </div>

      {showAddExpense && (
        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem' }}>
          <h3>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
          <form onSubmit={handleSubmit}>
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
                  <option key={segment.id} value={segment.id}>{segment.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Amount ($) *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Optional description..."
              />
            </div>

            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="expense_date"
                value={formData.expense_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-success">
                {editingExpense ? 'Update' : 'Add'} Expense
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="empty-state">
          <p>No expenses recorded for {months[currentMonth - 1]} {currentYear}</p>
        </div>
      ) : (
        <div className="table-container">
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
                  <td>{format(new Date(expense.expense_date), 'MMM dd, yyyy')}</td>
                  <td>{expense.segment_name}</td>
                  <td>{expense.description || '-'}</td>
                  <td className="status-negative">${parseFloat(expense.amount).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => handleEdit(expense)}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(expense.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;

