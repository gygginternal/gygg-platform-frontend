import React, { useEffect, useState } from 'react';
import styles from './ContractPayment.module.css';
import CheckoutForm from '../../common/CheckoutForm';
import NuveiPaymentForm from '../Shared/NuveiPaymentForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import apiClient from '@api/axiosConfig';
import RateTaskerButton from '../../common/RateTaskerButton';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const ContractPayment = ({ contractId, isProvider, onPaymentReleased }) => {
  const [payment, setPayment] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [nuveiPaymentConfig, setNuveiPaymentConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [releaseMessage, setReleaseMessage] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [contract, setContract] = useState(null);
  const [paymentProvider, setPaymentProvider] = useState('stripe'); // stripe, nuvei

  useEffect(() => {
    async function fetchPayment() {
      setLoading(true);
      setError(null);
      try {
        // Fetch payment info
        const paymentRes = await apiClient.get(
          `/payments/contracts/${contractId}/payment`
        );
        const paymentData = paymentRes.data.data.payment;
        setPayment(paymentData);
        
        // Check payment provider and set appropriate data
        if (paymentData.paymentProvider === 'nuvei') {
          setPaymentProvider('nuvei');
          // For Nuvei, we'll fetch session info separately
          if (paymentData.status === 'requires_payment_method') {
            try {
              const sessionRes = await apiClient.get(`/payments/nuvei/session/${paymentData.nuveiSessionId}`);
              setNuveiPaymentConfig(sessionRes.data.data);
            } catch (err) {
              console.error('Error fetching Nuvei session:', err);
            }
          }
        } else {
          // Default to Stripe
          setPaymentProvider('stripe');
          if (paymentData.status === 'requires_payment_method') {
            setClientSecret(paymentData.stripePaymentIntentSecret);
          } else {
            setClientSecret(null);
          }
        }
        
        // Fetch contract info to check status
        const contractRes = await apiClient.get(`/contracts/${contractId}`);
        setContract(contractRes.data.data.contract);
        
        // Check if contract is completed and user is provider to show rating button
        if (contractRes.data.data.contract.status === 'completed' && isProvider) {
          setShowRating(true);
        } else if (paymentData.status === 'succeeded' && isProvider) {
          // Fallback to payment status if contract status isn't completed yet
          setShowRating(true);
        }
      } catch (err) {
        setError('Failed to fetch payment info.');
      }
      setLoading(false);
    }
    if (contractId) fetchPayment();
  }, [contractId, isProvider]);

  const handlePaymentSuccess = () => {
    setTimeout(() => window.location.reload(), 1000); // Refresh to update status
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };

  const handleReleasePayment = async () => {
    setReleaseLoading(true);
    setReleaseMessage('');
    try {
      await apiClient.post(`/payments/contracts/${contractId}/release`);
      setReleaseMessage('Payment released to tasker!');
      
      // After releasing payment, fetch updated contract to check if it's completed
      try {
        const contractRes = await apiClient.get(`/contracts/${contractId}`);
        setContract(contractRes.data.data.contract);
        // Show rating button if contract is now completed
        if (contractRes.data.data.contract.status === 'completed') {
          setShowRating(true);
        }
      } catch (err) {
        // If we can't fetch contract, still show rating button based on payment status
        setShowRating(true);
      }
      
      if (onPaymentReleased) onPaymentReleased();
    } catch (err) {
      setReleaseMessage('Failed to release payment.');
    }
    setReleaseLoading(false);
  };

  const handleRatingSubmitted = () => {
    setReleaseMessage('Thank you for rating the tasker!');
    // Optionally refresh the page or update state
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
      
      <div className={styles.paymentProviderSelector}>
        <label>
          <input
            type="radio"
            name="paymentProvider"
            value="stripe"
            checked={paymentProvider === 'stripe'}
            onChange={(e) => setPaymentProvider(e.target.value)}
            disabled={payment.status !== 'requires_payment_method'}
          />
          Stripe
        </label>
        <label>
          <input
            type="radio"
            name="paymentProvider"
            value="nuvei"
            checked={paymentProvider === 'nuvei'}
            onChange={(e) => setPaymentProvider(e.target.value)}
            disabled={payment.status !== 'requires_payment_method'}
          />
          Nuvei (with InstaDebit)
        </label>
      </div>

      {payment.status === 'requires_payment_method' && isProvider && (
        <>
          {paymentProvider === 'stripe' && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                clientSecret={clientSecret}
                paymentData={payment}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </Elements>
          )}
          
          {paymentProvider === 'nuvei' && (
            <NuveiPaymentForm
              contractId={contractId}
              paymentData={payment}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          )}
        </>
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
      {showRating && (
        <RateTaskerButton 
          contractId={contractId} 
          onRatingSubmitted={handleRatingSubmitted} 
        />
      )}
    </section>
  );
};

export default ContractPayment;
