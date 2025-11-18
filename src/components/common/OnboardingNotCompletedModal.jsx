import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './OnboardingNotCompletedModal.module.css';

const OnboardingNotCompletedModal = ({ isOpen, onClose }) => {
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
        onClose();
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
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
          onClose();
        }
      }}
      tabIndex={-1}
    >
      <div className={styles.modalContent} ref={modalRef} tabIndex={-1}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Tasker Onboarding Incomplete</h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✖
          </button>
        </div>

        <div className={styles.modalContentBody}>
          <p className={styles.modalMessage}>
            This tasker has not completed their Stripe onboarding process.
          </p>
          <p className={styles.modalMessage}>
            Payment cannot be processed until the tasker completes their Stripe
            account setup.
          </p>
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.okButton} onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

OnboardingNotCompletedModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default OnboardingNotCompletedModal;
