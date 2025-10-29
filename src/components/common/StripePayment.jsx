import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import apiClient from '../../api/axiosConfig';
import styles from './StripePayment.module.css';

// Load Stripe SDK
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RGtPuFdkW2xpfFKuaVicLXIWIglcyp7qOe3LD3Ut8i3LcOfpwI1KjnHGCrAlcQWo5t1tHFH8YaSsTeBnQobkpDv00y2jij4BO');

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

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        const response = await apiClient.post(
          `/payments/contracts/${contract.id || contract._id}/create-payment-intent`,
          { amount: parseFloat(amount) }
        );
        
        const { clientSecret } = response.data.data;
        setClientSecret(clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err.response?.data?.message || 'Failed to initialize payment. Please try again.');
        onPaymentError?.(err);
      }
    };

    createPaymentIntent();
  }, [contract, amount, onPaymentError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: `${contract.provider.firstName} ${contract.provider.lastName}`,
            },
          },
        }
      );

      if (stripeError) {
        console.error('Stripe payment error:', stripeError);
        setError(stripeError.message);
        onPaymentError?.(stripeError);
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment success with backend
        await apiClient.post('/payments/confirm-payment-success', {
          paymentIntentId: paymentIntent.id,
          contractId: contract.id || contract._id
        });

        onPaymentSuccess?.(paymentIntent);
      }
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
        <div className={styles.cardElementContainer}>
          <label htmlFor="card-element">Credit or debit card</label>
          <CardElement
            id="card-element"
            className={styles.cardElement}
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
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