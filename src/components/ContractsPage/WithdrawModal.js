// import React from 'react';
import { useState } from 'react';
import { X } from 'lucide-react';
import styles from './WithdrawModal.module.css';
import PropTypes from 'prop-types';

function WithdrawModal({ isOpen, onClose, availableAmount, onConfirm }) {
  const [selectedAmount, setSelectedAmount] = useState('available');
  const [customAmount, setCustomAmount] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const amount =
      selectedAmount === 'available'
        ? availableAmount
        : parseFloat(customAmount);
    onConfirm(amount);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h3 className={styles.title}>Withdraw Confirmation</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <X className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.modalContent}>
          <p className={styles.description}>
            The amount below will be withdrawn to banking account ending with
            S658.
          </p>

          <div className={styles.amountOptions}>
            <label className={styles.option}>
              <input
                type="radio"
                name="amount"
                value="available"
                checked={selectedAmount === 'available'}
                onChange={() => setSelectedAmount('available')}
                className={styles.radio}
              />
              <span className={styles.amountText}>
                ${availableAmount.toFixed(2)}
              </span>
            </label>

            <label className={styles.option}>
              <input
                type="radio"
                name="amount"
                value="custom"
                checked={selectedAmount === 'custom'}
                onChange={() => setSelectedAmount('custom')}
                className={styles.radio}
              />
              <div className={styles.customInputContainer}>
                <span className={styles.customLabel}>Enter custom amount</span>
                {selectedAmount === 'custom' && (
                  <input
                    type="number"
                    value={customAmount}
                    onChange={e => setCustomAmount(e.target.value)}
                    placeholder="0.00"
                    className={styles.customInput}
                    max={availableAmount}
                  />
                )}
              </div>
            </label>
          </div>

          <div className={styles.buttonGroup}>
            <button onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button onClick={handleConfirm} className={styles.confirmButton}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

WithdrawModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  availableAmount: PropTypes.number,
  onConfirm: PropTypes.func,
};

export default WithdrawModal;
