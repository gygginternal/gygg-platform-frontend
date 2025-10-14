import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import apiClient from '../../../api/axiosConfig';
import styles from './NuveiPaymentForm.module.css';

const NuveiPaymentForm = ({ 
  contractId, 
  onPaymentSuccess, 
  onPaymentError, 
  paymentData 
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card'); // card, instadebit
  const [sessionId, setSessionId] = useState(null);
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const containerRef = useRef(null);

  // Initialize Nuvei SDK when component mounts
  useEffect(() => {
    // Load Nuvei SDK script if not already loaded
    const scriptId = 'nuvei-sdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      // Using sandbox URL for development
      script.src = 'https://sandbox.nuvei.com/ppro/checkout/version/1.0/client-1.0.js';
      script.async = true;
      script.onload = () => {
        console.log('Nuvei SDK loaded successfully');
      };
      script.onerror = () => {
        console.error('Failed to load Nuvei SDK');
        setMessage('Failed to load payment system. Please try again later.');
      };
      document.head.appendChild(script);
    }
  }, []);

  // Create a Nuvei payment session when component mounts
  useEffect(() => {
    const createPaymentSession = async () => {
      try {
        const response = await apiClient.post('/payments/nuvei/create-session', {
          contractId,
          paymentMethod // Send payment method to backend
        });
        setSessionId(response.data.data.sessionId);
      } catch (error) {
        console.error('Error creating Nuvei payment session:', error);
        setMessage('Failed to initialize payment. Please try again.');
      }
    };

    if (!sessionId) {
      createPaymentSession();
    }
  }, [contractId, sessionId, paymentMethod]);

  // Initialize Nuvei payment form when session ID is available
  useEffect(() => {
    if (sessionId && window.NuveiClient && containerRef.current && !paymentInitialized) {
      initializeNuveiForm();
    }
  }, [sessionId, paymentMethod, paymentInitialized]);

  const initializeNuveiForm = () => {
    if (!window.NuveiClient || !sessionId || !containerRef.current) {
      return;
    }

    try {
      // Get the configuration from backend
      apiClient.get(`/payments/nuvei/session/${sessionId}`)
        .then(response => {
          const config = response.data.data.nuveiConfig;
          
          // Initialize Nuvei payment form
          const paymentOptions = {
            merchantId: config.merchantId,
            merchantSiteId: config.merchantSiteId,
            sessionToken: sessionId,
            divId: 'nuvei-payment-container', // ID of the container where the form will be rendered
            paymentOption: paymentMethod,
            // Configuration options for the payment form
            style: {
              // Custom styling can be applied here
            },
            // Event handlers
            onSuccess: (data) => {
              console.log('Nuvei payment successful:', data);
              handlePaymentSuccess(data);
            },
            onError: (error) => {
              console.error('Nuvei payment error:', error);
              handlePaymentError(error);
            },
            onPaymentChange: (data) => {
              // Handle payment method changes
              console.log('Payment method changed:', data);
            }
          };

          // Initialize the Nuvei payment form
          window.NuveiClient.initPayment(paymentOptions);
          setPaymentInitialized(true);
        })
        .catch(error => {
          console.error('Error getting Nuvei session details:', error);
          setMessage('Failed to initialize payment form.');
        });
    } catch (error) {
      console.error('Error initializing Nuvei form:', error);
      setMessage('Failed to initialize payment form.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Processing payment...');

    // In a real implementation, the payment would be processed via Nuvei's form
    // which should be automatically handled when user fills in the form
    // and clicks the submit button rendered by Nuvei
    
    // The actual payment processing happens through Nuvei's SDK
    // so we just need to make sure the form is properly initialized
    if (!paymentInitialized) {
      initializeNuveiForm();
    }
  };

  const handlePaymentSuccess = (response) => {
    setMessage('Payment successful!');
    showToast('Payment processed successfully!', 'success');
    
    // Confirm payment on backend
    apiClient.post('/payments/nuvei/confirm-payment', {
      sessionId: sessionId,
      nuveiTransactionId: response.transactionId || response.id
    })
    .then(confirmResponse => {
      console.log('Payment confirmed on backend:', confirmResponse.data);
      if (onPaymentSuccess) {
        onPaymentSuccess(response);
      }
    })
    .catch(error => {
      console.error('Error confirming payment:', error);
      handlePaymentError(error);
    });
  };

  const handlePaymentError = (error) => {
    const errorMessage = typeof error === 'string' 
      ? error 
      : (error?.message || error?.error || 'Payment failed');
    setMessage(errorMessage);
    showToast(errorMessage, 'error');
    if (onPaymentError) {
      onPaymentError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <div className={styles.paymentMethodSelector}>
        <h4>Select Payment Method:</h4>
        <div className={styles.paymentMethodOptions}>
          <label className={styles.paymentMethodOption}>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPaymentInitialized(false); // Reset to reinitialize form
              }}
            />
            <span>Card Payment</span>
          </label>
          <label className={styles.paymentMethodOption}>
            <input
              type="radio"
              name="paymentMethod"
              value="instadebit"
              checked={paymentMethod === 'instadebit'}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPaymentInitialized(false); // Reset to reinitialize form
              }}
            />
            <span>InstaDebit</span>
          </label>
        </div>
      </div>

      {paymentData && (
        <div className={styles.paymentBreakdown}>
          <h4 className={styles.breakdownTitle}>Payment Breakdown</h4>
          <div className={styles.breakdownDetails}>
            <div>
              <strong>Total:</strong> ${((paymentData.amount || 0) / 100).toFixed(2)}
            </div>
            <div>
              <strong>Tax (13%):</strong> ${((paymentData.taxAmount || 0) / 100).toFixed(2)}
            </div>
            <div>
              <strong>Platform Fee ($5 + 5%):</strong> ${((paymentData.applicationFeeAmount || 0) / 100).toFixed(2)}
            </div>
            <div>
              <strong>Payout to Tasker:</strong> ${((paymentData.amountReceivedByPayee || 0) / 100).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      <div id="nuvei-payment-container" ref={containerRef} className={styles.nuveiContainer}>
        {!paymentInitialized && sessionId && (
          <div className={styles.loadingMessage}>
            Loading payment form...
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !paymentInitialized}
        className={styles.submitButton}
      >
        {loading ? 'Processing...' : `Pay ${((paymentData?.amount || 0) / 100).toFixed(2)}`}
      </button>

      {message && (
        <div className={`${styles.message} ${message.includes('success') ? styles.success : styles.error}`}>
          {message}
        </div>
      )}
    </form>
  );
};

export default NuveiPaymentForm;