import React, { useState } from 'react';
import axios from 'axios';
import './SegmentManager.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function SegmentManager({ segments, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [segmentName, setSegmentName] = useState('');

  const handleAddSegment = async (e) => {
    e.preventDefault();
    if (!segmentName.trim()) {
      alert('Please enter a segment name');
      return;
    }

    try {
      await axios.post(`${API_URL}/segments`, { name: segmentName.trim() });
      alert('Segment added successfully!');
      setSegmentName('');
      setShowAddForm(false);
      onUpdate();
    } catch (error) {
      console.error('Error adding segment:', error);
      alert('Error adding segment. It might already exist.');
    }
  };

  const handleRenameSegment = async (e) => {
    e.preventDefault();
    if (!segmentName.trim()) {
      alert('Please enter a segment name');
      return;
    }

    try {
      await axios.put(`${API_URL}/segments/${editingSegment.id}`, { 
        name: segmentName.trim() 
      });
      alert('Segment renamed successfully!');
      setSegmentName('');
      setEditingSegment(null);
      onUpdate();
    } catch (error) {
      console.error('Error renaming segment:', error);
      alert('Error renaming segment. The name might already exist.');
    }
  };

  const handleDeleteSegment = async (segment) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${segment.name}"?\n\nThis will also delete all associated budgets and expenses for this segment.`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/segments/${segment.id}`);
      alert('Segment deleted successfully!');
      onUpdate();
    } catch (error) {
      console.error('Error deleting segment:', error);
      alert('Error deleting segment.');
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

