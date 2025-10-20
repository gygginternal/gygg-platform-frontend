import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './ConfirmModal.module.css';
import { decodeHTMLEntities } from '../../utils/htmlEntityDecoder';

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
  variant = 'default', // 'default', 'danger', 'warning'
}) => {
  const modalRef = useRef(null);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus the modal for accessibility
      if (modalRef.current) modalRef.current.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Trap focus inside modal
  useEffect(() => {
    if (!isOpen) return;
    const handleTab = e => {
      if (!modalRef.current) return;
      const focusableEls = Array.from(
        modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
      const [firstEl] = focusableEls;
      const lastEl = focusableEls[focusableEls.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      } else if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'danger':
        return styles.danger;
      case 'warning':
        return styles.warning;
      default:
        return styles.default;
    }
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      onKeyDown={e => {
        if (e.key === 'Escape') {
          onCancel();
        }
      }}
      tabIndex={-1}
    >
      <div className={styles.modalContent} ref={modalRef} tabIndex={-1}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button
            className={styles.closeButton}
            onClick={onCancel}
            aria-label="Close modal"
          >
            ✖
          </button>
        </div>

        <div className={styles.modalContentBody}>
          <p className={styles.modalMessage}>{decodeHTMLEntities(message)}</p>
        </div>

        <div className={styles.modalActions}>
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
  variant: PropTypes.oneOf(['default', 'danger', 'warning']),
};

export default ConfirmModal;
