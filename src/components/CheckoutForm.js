import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import styles from './CheckoutForm.module.css';
import PropTypes from 'prop-types';

function CheckoutForm({
  clientSecret,
  onPaymentSuccess,
  onPaymentError,
  paymentData,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!stripe || !elements) {
      setMessage("Stripe.js hasn't loaded yet.");
      return;
    }
    setIsLoading(true);
    setMessage('Processing payment...');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'An unexpected error occurred.');
      if (onPaymentError) onPaymentError(error.message);
    } else if (paymentIntent) {
      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Payment successful!');
          if (onPaymentSuccess) onPaymentSuccess(paymentIntent.id);
          break;
        case 'processing':
          setMessage('Payment processing...');
          break;
        case 'requires_payment_method':
          setMessage('Payment failed. Please try another method.');
          if (onPaymentError) onPaymentError('Payment failed.');
          break;
        default:
          setMessage('Something went wrong.');
          if (onPaymentError) onPaymentError('Something went wrong.');
          break;
      }
    } else {
      setMessage('Unexpected state.');
      if (onPaymentError) onPaymentError('Unexpected state.');
    }
    setIsLoading(false);
  };

  return (
    <form
      id="payment-form"
      onSubmit={handleSubmit}
      className={styles.paymentForm}
    >
      {paymentData && (
        <div className={styles.paymentBreakdown}>
          <h4 className={styles.breakdownTitle}>Payment Breakdown</h4>
          <div className={styles.breakdownDetails}>
            <div>
              <strong>Total:</strong> $
              {((paymentData.amount || 0) / 100).toFixed(2)}
            </div>
            <div>
              <strong>Tax (13%):</strong> $
              {((paymentData.taxAmount || 0) / 100).toFixed(2)}
            </div>
            <div>
              <strong>Platform Fee ($5 + 5%):</strong> $
              {((paymentData.applicationFeeAmount || 0) / 100).toFixed(2)}
            </div>
            <div>
              <strong>Payout to Tasker:</strong> $
              {((paymentData.amountReceivedByPayee || 0) / 100).toFixed(2)}
            </div>
          </div>
        </div>
      )}
      <h4 className={styles.paymentDetailsTitle}>Enter Payment Details:</h4>
      <PaymentElement id="payment-element" />
      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className={styles.submitButton}
      >
        <span>{isLoading ? 'Processing...' : 'Pay now'}</span>
      </button>
      {message && (
        <div
          id="payment-message"
          className={`${styles.paymentMessage} ${message.includes('success') ? styles.paymentSuccess : styles.paymentError}`}
        >
          {message}
        </div>
      )}
    </form>
  );
}

CheckoutForm.propTypes = {
  clientSecret: PropTypes.string,
  onPaymentSuccess: PropTypes.func,
  onPaymentError: PropTypes.func,
  paymentData: PropTypes.shape({
    amount: PropTypes.number,
    taxAmount: PropTypes.number,
    applicationFeeAmount: PropTypes.number,
    amountReceivedByPayee: PropTypes.number,
  }),
};

export default CheckoutForm;
