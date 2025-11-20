import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import apiClient from '../../api/axiosConfig';
import styles from './StripePayment.module.css';

// Load Stripe SDK
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({
  contract,
  amount,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async event => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Confirm the payment with Stripe using Payment Element
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/stripe-onboarding/return`, // This is where the user will be redirected after payment
          payment_method_data: {
            billing_details: {
              name: `${contract.provider.firstName} ${contract.provider.lastName}`,
            },
          },
        },
        redirect: 'if_required', // Only redirect if required (for 3DS authentication)
      });

      if (result.error) {
        console.error('Stripe payment error:', result.error);
        setError(result.error.message);
        onPaymentError?.(result.error);
      } else if (result.paymentIntent) {
        // If we get here, it means no redirect was required and the payment was processed
        // Confirm payment success with backend
        await apiClient.post('/payments/confirm-payment-success', {
          paymentIntentId: result.paymentIntent.id,
          contractId: contract.id || contract._id,
        });

        onPaymentSuccess?.(result.paymentIntent);
      }
      // If redirect was required, the page will redirect and this code won't execute
      // The payment success will be handled by the return URL page
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(
        err.response?.data?.message ||
          'Failed to process payment. Please try again.'
      );
      onPaymentError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.paymentContainer}>
      <form onSubmit={handleSubmit} className={styles.paymentForm}>
        <div className={styles.paymentElementContainer}>
          <PaymentElement
            id="payment-element"
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
                radios: true,
                spacedAccordionItems: false,
              },
              business: {
                name: 'Gygg Platform',
              },
              wallets: {
                applePay: 'never',
                googlePay: 'never',
              },
            }}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || loading}
            className={styles.submitButton}
          >
            {loading ? (
              <>
                <div className={styles.buttonSpinner}></div>
                Processing...
              </>
            ) : (
              `Pay $${parseFloat(amount).toFixed(2)}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Global tracker to prevent multiple payment intent calls per contract
const paymentIntentCallTracker = new Map();

const StripePayment = ({
  contract,
  amount,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  // Refs to track mounted status and if call was already made
  const isMountedRef = useRef(true);
  const hasBeenCalledRef = useRef(false);

  // Initialize refs on component mount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initialize payment intent when component mounts
  useEffect(() => {
    const initializePayment = async () => {
      const contractId = contract?.id || contract?._id;

      // Check if call has been made for this contract instance
      if (hasBeenCalledRef.current) return;
      hasBeenCalledRef.current = true;

      // Check if payment intent creation is already in progress for this contract
      if (paymentIntentCallTracker.has(contractId)) {
        console.warn(
          `Payment intent creation already in progress for contract ${contractId}`
        );
        return;
      }

      // Add to tracker
      paymentIntentCallTracker.set(contractId, true);

      setLoading(true);

      try {
        const validAmount =
          amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;

        if (!contractId || !validAmount) {
          throw new Error('Missing contract or invalid amount');
        }

        // Check if the tasker has a valid Stripe account in the contract
        const taskerStripeAccountId =
          contract?.tasker?.stripeAccountId || contract?.stripeAccountId;
        if (!taskerStripeAccountId) {
          throw new Error(
            'The tasker has not completed their Stripe onboarding process. Payment cannot be processed until the tasker connects and verifies their Stripe account.'
          );
        }

        const response = await apiClient.post(
          `/payments/contracts/${contractId}/create-payment-intent`,
          { amount: parseFloat(amount) }
        );

        const newClientSecret = response.data.data.clientSecret;

        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setClientSecret(newClientSecret);
        }
      } catch (err) {
        console.error('Error initializing payment:', err);
        let errorMessage =
          err.response?.data?.message ||
          'Failed to initialize payment. Please try again.';

        // Check if it's specifically a Stripe account onboarding issue
        if (
          err.response?.data?.message?.includes('capability') ||
          err.response?.data?.message?.includes('transfers') ||
          err.response?.data?.message?.includes('onboarding')
        ) {
          errorMessage =
            'The tasker has not completed their Stripe onboarding process. Payment cannot be processed until the tasker completes their Stripe account setup.';
        }

        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setError(errorMessage);
          onPaymentError?.(err);
        }
      } finally {
        // Remove from tracker and only update state if mounted
        paymentIntentCallTracker.delete(contractId);
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    initializePayment();

    // Cleanup: remove from tracker when component unmounts
    return () => {
      const contractId = contract?.id || contract?._id;
      if (contractId) {
        paymentIntentCallTracker.delete(contractId);
      }
    };
  }, [contract, amount, onPaymentError]); // Only run once per component instance

  if (loading && !clientSecret) {
    return (
      <div className={styles.paymentContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Initializing secure payment system...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.stripePayment}>
        <h3>Pay with Credit Card (Stripe)</h3>
        <p>Securely pay using your credit or debit card through Stripe.</p>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className={styles.paymentContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Initializing secure payment system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stripePayment}>
      <h3>Pay with Credit Card (Stripe)</h3>
      <p>Securely pay using your credit or debit card through Stripe.</p>
      <p className={styles.paymentNote}>
        <em>Note: Additional taxes may apply and will be calculated at checkout.</em>
      </p>

      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm
          contract={contract}
          amount={amount}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  );
};

export default StripePayment;
