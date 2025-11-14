import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import apiClient from '../../api/axiosConfig';
import styles from './StripePayment.module.css';

// Load Stripe SDK
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Global map to track payment intent creation attempts per contract to prevent multiple calls
const paymentIntentCreationTracker = new Map();

const CheckoutForm = ({
  contract,
  amount,
  onPaymentSuccess,
  onPaymentError,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);

  // Use ref to store onPaymentError to avoid re-renders when function identity changes
  const onPaymentErrorRef = useRef(onPaymentError);
  useEffect(() => {
    onPaymentErrorRef.current = onPaymentError;
  }, [onPaymentError]);

  // Use ref to track if component is mounted to prevent state updates on unmounted component
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Use ref to track if payment intent creation has already been initiated for this component instance
  const hasPaymentIntentBeenCalledRef = useRef(false);
  const contractIdRef = useRef(null);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads, but only once
    if (isCreatingPaymentIntent || clientSecret || hasPaymentIntentBeenCalledRef.current) return; // Prevent multiple calls

    // Check if required props are valid before attempting to create payment intent
    const contractId = contract?.id || contract?._id;
    const validAmount = amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;

    if (!contractId || !validAmount) {
      console.warn('StripePayment: Missing or invalid contract/amount, skipping payment intent creation');
      return;
    }

    // Store contract ID for cleanup
    contractIdRef.current = contractId;

    // Check if payment intent creation is already in progress for this contract
    if (paymentIntentCreationTracker.get(contractId)) {
      console.warn(`Payment intent creation already in progress for contract ${contractId}`);
      return;
    }

    const createPaymentIntent = async () => {
      // Mark that payment intent creation is in progress for this contract
      paymentIntentCreationTracker.set(contractId, true);
      hasPaymentIntentBeenCalledRef.current = true;

      // Double-check we're still mounted before starting
      if (!isMountedRef.current) {
        paymentIntentCreationTracker.delete(contractId);
        return;
      }

      setIsCreatingPaymentIntent(true); // Set flag to prevent concurrent calls

      try {
        // Check if the tasker has a valid Stripe account in the contract
        const taskerStripeAccountId = contract?.tasker?.stripeAccountId || contract?.stripeAccountId;
        if (!taskerStripeAccountId) {
          const errorMessage = 'The tasker has not completed their Stripe onboarding process. Payment cannot be processed until the tasker connects and verifies their Stripe account.';

          // Only update state if component is still mounted
          if (isMountedRef.current) {
            setError(errorMessage);
            onPaymentErrorRef.current?.(new Error(errorMessage));
            setIsCreatingPaymentIntent(false);
          }
          paymentIntentCreationTracker.delete(contractId);
          return;
        }

        const response = await apiClient.post(
          `/payments/contracts/${contractId}/create-payment-intent`,
          { amount: parseFloat(amount) }
        );

        const { clientSecret: newClientSecret } = response.data.data;
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setClientSecret(newClientSecret);
        }
      } catch (err) {
        console.error('Error creating payment intent:', err);
        let errorMessage = err.response?.data?.message || 'Failed to initialize payment. Please try again.';

        // Check if it's specifically a Stripe account onboarding issue
        if (err.response?.data?.message?.includes('capability') ||
            err.response?.data?.message?.includes('transfers') ||
            err.response?.data?.message?.includes('onboarding')) {
          errorMessage = 'The tasker has not completed their Stripe onboarding process. Payment cannot be processed until the tasker completes their Stripe account setup.';
        }

        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setError(errorMessage);
          onPaymentErrorRef.current?.(err);
        }
      } finally {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setIsCreatingPaymentIntent(false);
        }
        // Remove the tracker entry when done
        paymentIntentCreationTracker.delete(contractId);
      }
    };

    createPaymentIntent();
  }, [contract, amount]); // Only depend on contract and amount, remove the state variables

  // Cleanup effect to remove contract from tracker when component unmounts
  useEffect(() => {
    return () => {
      const contractId = contractIdRef.current;
      if (contractId) {
        paymentIntentCreationTracker.delete(contractId);
      }
    };
  }, []); // Run only on mount/unmount

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
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
          contractId: contract.id || contract._id
        });

        onPaymentSuccess?.(result.paymentIntent);
      }
      // If redirect was required, the page will redirect and this code won't execute
      // The payment success will be handled by the return URL page
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err.response?.data?.message || 'Failed to process payment. Please try again.');
      onPaymentError?.(err);
    } finally {
      setLoading(false);
    }
  };

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

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

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

const StripePayment = ({ 
  contract, 
  amount, 
  onPaymentSuccess,
  onPaymentError,
  onCancel 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (loading) {
    return (
      <div className={styles.paymentContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Processing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stripePayment}>
      <h3>Pay with Credit Card (Stripe)</h3>
      <p>Securely pay using your credit or debit card through Stripe.</p>
      
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <Elements stripe={stripePromise}>
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