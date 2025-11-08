import React, { useEffect, useRef, useState } from 'react';
import styles from './NuveiSimplyConnectPayment.module.css';
import apiClient from '@api/axiosConfig';
import { useAuth } from '@contexts/AuthContext';

const NuveiSimplyConnectPayment = ({ contractId, amount, currency = 'USD', onSuccess, onError, onComplete }) => {
  const { user } = useAuth();
  const [sessionToken, setSessionToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [merchantId, setMerchantId] = useState('');
  const [merchantSiteId, setMerchantSiteId] = useState('');
  const [initialized, setInitialized] = useState(false);
  const checkoutContainerRef = useRef(null);

  useEffect(() => {
    // Initialize Simply Connect by creating a payment session
    const initSimplyConnect = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Ensure amount is a proper positive number
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
          throw new Error(`Invalid amount: ${amount}. Amount must be a positive number.`);
        }
        
        // Ensure currency is properly formatted (3 characters)
        const formattedCurrency = currency && typeof currency === 'string' 
          ? currency.substring(0, 3).toUpperCase() 
          : 'USD';
        
        // Prepare billing address and additional required user details
        const billingDetails = {
          country: 'CA', // Required - use country code
          email: user?.email || 'test@example.com',
          firstName: user?.firstName || 'Test',
          lastName: user?.lastName || 'User',
          phone: user?.phoneNo || '+1234567890',
          ...(user?.address && {
            city: user?.address.city || 'Test City',
            address: user?.address.street || '123 Test Street',
            state: user?.address.state || 'ON',
            zip: user?.address.postalCode || 'K1A 0A6'
          })
        };

        // Step 1: Create an order to get session token
        const response = await apiClient.post('/nuvei-payments/open-order', {
          userTokenId: user?._id || `user_${Date.now()}`, // Use actual user ID or generate one
          clientUniqueId: `order_${contractId}_${Date.now()}`, // More specific unique ID
          clientRequestId: `req_${contractId}_${Date.now()}`, // More specific request ID
          currency: formattedCurrency,
          amount: numericAmount, // Ensure it's a proper numeric value
          contractId: contractId, // Link to the contract
          additionalParams: {
            // Add required billing address details
            billingAddress: billingDetails,
            // Add user details
            firstName: user?.firstName || 'Test',
            lastName: user?.lastName || 'User',
            email: user?.email || 'test@example.com',
            phone: user?.phoneNo || '+1234567890',
            // Add any other parameters needed for your use case
          }
        });

        const { orderId, sessionToken: token } = response.data.data;
        
        if (!token) {
          throw new Error('Failed to get session token from Nuvei');
        }

        // Get merchant credentials from environment/config
        setSessionToken(token);
        // Using constants from .env files (VITE_ prefixed for Vite)
        setMerchantId(import.meta.env.VITE_NUVEI_MERCHANT_ID || '1532752543015516036');
        setMerchantSiteId(import.meta.env.VITE_NUVEI_MERCHANT_SITE_ID || '1248117');

        setLoading(false);
      } catch (err) {
        console.error('Error initializing Nuvei Simply Connect:', err);
        setError(err.response?.data?.message || err.message || 'Failed to initialize payment');
        setLoading(false);
        if (onError) {
          onError(err);
        }
      }
    };

    initSimplyConnect();
  }, [contractId, amount, currency, onError]);

  // Initialize checkout when we have the session token
  useEffect(() => {
    if (sessionToken && !initialized) {
      // Wait for the DOM to be fully rendered and element to be in the document
      const checkElement = () => {
        const element = document.getElementById('nuvei-checkout-container');
        if (element) {
          initializeCheckout();
        } else {
          // Check again in a moment
          setTimeout(checkElement, 100);
        }
      };
      
      // Start the wait after the current execution stack
      setTimeout(checkElement, 100);
    }
  }, [sessionToken, initialized]);

  const initializeCheckout = () => {
    // Load the Nuvei checkout script if not already loaded
    if (!window.checkout) {
      const script = document.createElement('script');
      script.src = 'https://cdn.safecharge.com/safecharge_resources/v1/checkout/checkout.js';
      script.async = true;
      script.onload = () => {
        // Added a small delay to ensure the library is fully loaded before using it
        setTimeout(() => {
          if (window.checkout && typeof window.checkout === 'function') {
            setupCheckout();
          } else {
            console.error('Nuvei checkout function is not available after script load');
            setError('Payment system failed to initialize');
            if (onError) onError(new Error('Payment system failed to initialize'));
          }
        }, 200); // Small delay to allow complete initialization
      };
      script.onerror = () => {
        setError('Failed to load Nuvei checkout library');
        if (onError) onError(new Error('Failed to load Nuvei checkout library'));
      };
      document.head.appendChild(script);
    } else {
      setupCheckout();
    }
  };

  const setupCheckout = () => {
    try {
      // Ensure the element exists before creating the configuration
      if (!checkoutContainerRef.current) {
        console.error('Checkout container element not available when setupCheckout was called');
        setError('Unable to initialize payment form. Element not ready.');
        if (onError) onError(new Error('Checkout container element not ready.'));
        return;
      }

      const checkoutConfig = {
        env: 'int',
        renderTo: '#nuvei-checkout-container',
        sessionToken: sessionToken,
        merchantSiteId: merchantSiteId,
        merchantId: merchantId,
        currency: currency,
        amount: amount,
        locale: 'en',
        country: 'CA',
        fullName: user?.firstName + ' ' + user?.lastName || 'Test User',
        email: user?.email || 'test@example.com',

        billingAddress: {
          email: user?.email || 'test@example.com',
          country: 'CA',
        },

        onResult: (result) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Nuvei checkout result:', result);
          }
          
          if (result && (result.result === 'APPROVED' || result.status === 'success')) {
            // Process successful payment
            handlePaymentSuccess(result);
          } else {
            // Handle failed payment - provide more details
            const errorMessage = result?.error?.message || result?.reason || 'Payment failed';
            console.error('Nuvei checkout error:', errorMessage, result);
            const error = new Error(`Nuvei payment failed: ${errorMessage}`);
            if (onError) onError(error);
          }
        },

        // Optional UI settings
        payButton: "amountButton",
        showResponseMessage: true,
        autoOpenPM: false, // Changed to false to avoid automatic payment method opening issues
        alwaysCollectCvv: false,
        logLevel: 0,
        // Restrict payment methods to avoid issues with unsupported methods like Interac
        allowedPaymentMethods: ["card"],
        defaultPaymentMethod: "card",

        fieldStyle: {
          "base": {
            "iconColor": "#c4f0ff",
            "color": "#6b778c",
            "fontWeight": 400,
            "fontFamily": "Nunito Sans",
            "fontSize": "18px",
            "fontSmoothing": "antialiased",
            ":-webkit-autofill": {
              "color": "#ffffff"
            },
            "::placeholder": {
              "color": "#6b778c"
            }
          },
          "invalid": {
            "iconColor": "#FFC7EE",
            "color": "#FFC7EE"
          }
        }
      };

      // Small delay to ensure DOM element is fully ready and library is properly initialized
      setTimeout(() => {
        try {
          // Double-check that window.checkout exists before calling it
          if (typeof window.checkout !== 'function') {
            console.error('Nuvei checkout function is not available or not a function');
            setError('Payment system unavailable');
            if (onError) onError(new Error('Payment system unavailable'));
            return;
          }
          
          window.checkout(checkoutConfig);
          setInitialized(true);
        } catch (err) {
          console.error('Error initializing Nuvei checkout:', err);
          console.error('Error details:', err.message, err.stack);
          setError('Error initializing payment form');
          if (onError) onError(err);
        }
      }, 150); // Increased delay to allow library to fully initialize
    } catch (err) {
      console.error('Error setting up Nuvei checkout:', err);
      setError('Error setting up payment form');
      if (onError) onError(err);
    }
  };

  const handlePaymentSuccess = async (result) => {
    try {
      // Confirm the payment with the backend
      await apiClient.post('/nuvei-payments/confirm-simply-connect-payment', {
        sessionToken: sessionToken,
        contractId: contractId,
        paymentResult: result,
        amount: amount,
        currency: currency
      });

      if (onSuccess) {
        onSuccess(result);
      }
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Error confirming Nuvei payment:', err);
      setError('Payment successful but failed to confirm with server');
      if (onError) onError(err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Initializing Nuvei payment system...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <p className={styles.errorMessage}>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.paymentHeader}>
        <h3>Pay with Nuvei</h3>
        <p className={styles.paymentAmount}>Amount: {currency} {amount}</p>
      </div>
      
      <div id="nuvei-checkout-container" className={styles.checkoutContainer} ref={checkoutContainerRef}>
        {/* Nuvei checkout will be rendered here */}
      </div>
      
      <div className={styles.paymentFooter}>
        <p>Secure payment powered by Nuvei</p>
        <div className={styles.paymentMethods}>
          <span>💳 Cards</span>
          <span>🏦 InstaDebit</span>
          <span>🌐 Other methods</span>
        </div>
      </div>
    </div>
  );
};

export default NuveiSimplyConnectPayment;