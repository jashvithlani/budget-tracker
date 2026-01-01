import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from './Toast';
import './SegmentManager.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function SegmentManager({ segments, onUpdate }) {
  const { showToast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [segmentName, setSegmentName] = useState('');

  const handleAddSegment = async (e) => {
    e.preventDefault();
    if (!segmentName.trim()) {
      showToast('Please enter a segment name', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('budgetToken');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_URL}/segments`, { name: segmentName.trim() }, { headers });
      showToast('Segment added successfully!', 'success');
      setSegmentName('');
      setShowAddForm(false);
      onUpdate();
    } catch (error) {
      console.error('Error adding segment:', error);
      showToast('Error adding segment. It might already exist.', 'error');
    }
  };

  const handleRenameSegment = async (e) => {
    e.preventDefault();
    if (!segmentName.trim()) {
      showToast('Please enter a segment name', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('budgetToken');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API_URL}/segments/${editingSegment.id}`, { 
        name: segmentName.trim() 
      }, { headers });
      showToast('Segment renamed successfully!', 'success');
      setSegmentName('');
      setEditingSegment(null);
      onUpdate();
    } catch (error) {
      console.error('Error renaming segment:', error);
      showToast('Error renaming segment. The name might already exist.', 'error');
    }
  };

  const handleDeleteSegment = async (segment) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${segment.name}"?\n\nThis will also delete all associated budgets and expenses for this segment.`
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('budgetToken');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/segments/${segment.id}`, { headers });
      showToast('Segment deleted successfully!', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error deleting segment:', error);
      showToast('Error deleting segment', 'error');
    }
  };

  const startEdit = (segment) => {
    setEditingSegment(segment);
    setSegmentName(segment.name);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingSegment(null);
    setSegmentName('');
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setSegmentName('');
  };

  return (
    <div className="segment-manager">
      <div className="segment-manager-header">
        <h2>Manage Budget Segments</h2>
        {!showAddForm && !editingSegment && (
          <button onClick={() => setShowAddForm(true)} className="add-segment-btn">
            ➕ Add New Segment
          </button>
        )}
      </div>

      {(showAddForm || editingSegment) && (
        <div className="segment-form-container">
          <h3>{editingSegment ? '✏️ Rename Segment' : '➕ Add New Segment'}</h3>
          <form onSubmit={editingSegment ? handleRenameSegment : handleAddSegment} className="segment-form">
            <input
              type="text"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              placeholder="Enter segment name"
              className="segment-name-input"
              autoFocus
            />
            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingSegment ? '💾 Save' : '➕ Add'}
              </button>
              <button 
                type="button" 
                onClick={editingSegment ? cancelEdit : cancelAdd} 
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="segments-list">
        <h3>Existing Segments</h3>
        <div className="segments-grid">
          {segments.map(segment => (
            <div key={segment.id} className="segment-card">
              <div className="segment-info">
                <span className="segment-icon">📁</span>
                <span className="segment-name">{segment.name}</span>
              </div>
              <div className="segment-actions">
                <button 
                  onClick={() => startEdit(segment)}
                  className="edit-btn"
                  title="Rename segment"
                  disabled={!!editingSegment || showAddForm}
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDeleteSegment(segment)}
                  className="delete-btn"
                  title="Delete segment"
                  disabled={!!editingSegment || showAddForm}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {segments.length === 0 && (
        <div className="no-segments">
          <p>No segments available. Add your first segment to get started!</p>
        </div>
      )}
    </div>
  );
}

export default SegmentManager;

