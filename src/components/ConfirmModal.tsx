import React from 'react';
import { Modal } from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  showIcon?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  type = 'danger',
  showIcon = true
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return 'var(--color-danger)';
      case 'warning':
        return '#FFA500';
      case 'info':
        return 'var(--color-primary)';
      default:
        return 'var(--color-danger)';
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'modal-btn modal-btn-danger';
      case 'warning':
        return 'modal-btn modal-btn-warning';
      case 'info':
        return 'modal-btn modal-btn-primary';
      default:
        return 'modal-btn modal-btn-danger';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className="confirm-modal-content">
        {showIcon && (
          <div className="confirm-modal-icon" style={{ color: getIconColor() }}>
            <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
          </div>
        )}
        
        <div className="confirm-modal-message">
          <p>{message}</p>
        </div>
        
        <div className="modal-actions">
          <button 
            type="button" 
            onClick={onClose}
            className="modal-btn modal-btn-secondary"
          >
            {cancelText}
          </button>
          <button 
            type="button"
            onClick={handleConfirm}
            className={getConfirmButtonClass()}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
