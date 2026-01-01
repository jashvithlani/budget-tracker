import React, { createContext, useContext, useState, useCallback } from 'react';
import './ConfirmModal.css';

const ConfirmContext = createContext();

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger' // danger, warning, info
  });

  const confirm = useCallback(({ 
    title, 
    message, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    type = 'danger'
  }) => {
    return new Promise((resolve) => {
      setConfirmData({
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          setIsOpen(false);
          resolve(true);
        },
        onCancel: () => {
          setIsOpen(false);
          resolve(false);
        }
      });
      setIsOpen(true);
    });
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      confirmData.onCancel();
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && (
        <div className="confirm-backdrop" onClick={handleBackdropClick}>
          <div className="confirm-modal">
            <div className={`confirm-header confirm-header-${confirmData.type}`}>
              <h3>{confirmData.title}</h3>
            </div>
            <div className="confirm-body">
              <p>{confirmData.message}</p>
            </div>
            <div className="confirm-footer">
              <button 
                className="confirm-btn confirm-btn-cancel"
                onClick={confirmData.onCancel}
              >
                {confirmData.cancelText}
              </button>
              <button 
                className={`confirm-btn confirm-btn-${confirmData.type}`}
                onClick={confirmData.onConfirm}
              >
                {confirmData.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

