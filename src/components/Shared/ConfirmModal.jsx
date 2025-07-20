import React from 'react';
import PropTypes from 'prop-types';
import styles from './ConfirmModal.module.css';

/**
 * Confirmation Modal Component
 * Replaces browser's window.confirm with a proper modal
 */
const ConfirmModal = ({ 
  isOpen, 
  title = 'Confirm Action',
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm, 
  onCancel,
  variant = 'default' // 'default', 'danger', 'warning'
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'danger': return styles.danger;
      case 'warning': return styles.warning;
      default: return styles.default;
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
        </div>
        
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`${styles.confirmButton} ${getVariantClass()}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'danger', 'warning'])
};

export default ConfirmModal;