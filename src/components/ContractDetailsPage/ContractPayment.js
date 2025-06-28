// import React from 'react';
import { useEffect, useState } from 'react';
import styles from './ContractDetailsSection.module.css';
import CheckoutForm from './CheckoutForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import apiClient from '../../api/axiosConfig';
import PropTypes from 'prop-types';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const ContractPayment = ({ contractId, isProvider, onPaymentReleased }) => {
  const [payment, setPayment] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [releaseMessage, setReleaseMessage] = useState('');

  useEffect(() => {
    async function fetchPayment() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(
          `/payments/contracts/${contractId}/payment`
        );
        setPayment(res.data.data.payment);
        if (res.data.data.payment.status === 'requires_payment_method') {
          setClientSecret(res.data.data.payment.stripePaymentIntentSecret);
        } else {
          setClientSecret(null);
        }
      } catch (err) {
        setError('Failed to fetch payment info.');
      }
      setLoading(false);
    }
    if (contractId) fetchPayment();
  }, [contractId]);

  const handlePaymentSuccess = () => {
    setTimeout(() => window.location.reload(), 1000); // Refresh to update status
  };

  const handleReleasePayment = async () => {
    setReleaseLoading(true);
    setReleaseMessage('');
    try {
      await apiClient.post(`/payments/contracts/${contractId}/release`);
      setReleaseMessage('Payment released to tasker!');
      if (onPaymentReleased) onPaymentReleased();
    } catch (err) {
      setReleaseMessage('Failed to release payment.');
    }
    setReleaseLoading(false);
  };

  if (loading) return <div>Loading payment info...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!payment) return <div>No payment info found.</div>;

  return (
    <section className={styles.paymentSection}>
      <h2>Payment Info</h2>
      <div>Status: {payment.status}</div>
      <div>Amount: ${(payment.amount / 100).toFixed(2)}</div>
      <div>Tax: ${(payment.taxAmount / 100).toFixed(2)}</div>
      <div>
        Platform Fee: ${(payment.applicationFeeAmount / 100).toFixed(2)}
      </div>
      <div>
        Payout to Tasker: ${(payment.amountReceivedByPayee / 100).toFixed(2)}
      </div>
      {payment.status === 'requires_payment_method' &&
        clientSecret &&
        isProvider && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              clientSecret={clientSecret}
              paymentData={payment}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </Elements>
        )}
      {payment.status === 'requires_capture' && isProvider && (
        <button
          className={styles.releaseButton}
          onClick={handleReleasePayment}
          disabled={releaseLoading}
        >
          {releaseLoading ? 'Releasing...' : 'Release Payment to Tasker'}
        </button>
      )}
      {releaseMessage && (
        <div className={styles.releaseMessage}>{releaseMessage}</div>
      )}
    </section>
  );
};

ContractPayment.propTypes = {
  contractId: PropTypes.string,
  isProvider: PropTypes.bool,
  onPaymentReleased: PropTypes.func,
};

export default ContractPayment;
