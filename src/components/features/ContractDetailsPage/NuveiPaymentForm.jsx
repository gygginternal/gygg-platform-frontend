import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import styles from './NuveiPaymentForm.module.css';
import apiClient from '@api/axiosConfig';

const NuveiPaymentForm = ({ contractId, paymentData, onPaymentSuccess, onPaymentError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle Nuvei payment process
  const handleNuveiPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate payment data first
      if (!paymentData) {
        throw new Error('Payment data is missing');
      }
      
      // Open Nuvei Simply Connect in a new tab/window
      // This would typically redirect to the Nuvei payment page
      window.open(`/contracts/${contractId}/pay-with-nuvei`, '_blank');
      
      // For a complete integration, you might want to handle post-payment redirects
      // and update the UI once payment is confirmed
      console.log('Opening Nuvei payment in new tab for contract:', contractId);
      
      setLoading(false);
      onPaymentSuccess && onPaymentSuccess();
    } catch (err) {
      console.error('Error processing Nuvei payment:', err);
      setError(err.response?.data?.message || err.message || 'Failed to process payment with Nuvei');
      setLoading(false);
      onPaymentError && onPaymentError(err);
    }
  };

  return (
    <div className={styles.container}>
      <h3>Pay with Nuvei</h3>
      <p>Secure payment through Nuvei's payment system.</p>
      
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}
      
      <button
        className={styles.payButton}
        onClick={handleNuveiPayment}
        disabled={loading}
      >
        {loading ? 'Processing...' : `Pay ${paymentData ? `$${(paymentData.amount / 100).toFixed(2)}` : ''} with Nuvei`}
      </button>
      
      <div className={styles.paymentMethods}>
        <p>Accepted methods:</p>
        <div className={styles.methodTags}>
          <span className={styles.methodTag}>💳 Cards</span>
          <span className={styles.methodTag}>🏦 InstaDebit</span>
          <span className={styles.methodTag}>🌐 Other</span>
        </div>
      </div>
    </div>
  );
};

export default NuveiPaymentForm;