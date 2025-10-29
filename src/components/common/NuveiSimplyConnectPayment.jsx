import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/axiosConfig';
import styles from './NuveiSimplyConnectPayment.module.css';

const NuveiSimplyConnectPayment = ({ 
  contract, 
  amount, 
  onPaymentSuccess,
  onPaymentError,
  onCancel 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [checkoutInitialized, setCheckoutInitialized] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card'); // Default to card
  const checkoutContainerRef = useRef(null);

  // Load Nuvei Simply Connect SDK
  useEffect(() => {
    const loadSdk = async () => {
      // Check if SDK is already loaded
      if (window.checkout) {
        setSdkLoaded(true);
        return;
      }

      // The Simply Connect SDK URL differs between prod and sandbox
      // For production, use the secure.nuvei.com domain
      // For development, we'll handle the domain resolution issue gracefully
      if (process.env.NODE_ENV === 'production') {
        const script = document.createElement('script');
        script.src = 'https://secure.nuvei.com/ppro/checkout/version/1.0/client-1.0.js';
        script.async = true;
        
        script.onload = () => {
          console.log('Nuvei Simply Connect SDK loaded successfully');
          setSdkLoaded(true);
        };
        
        script.onerror = (err) => {
          console.error('Failed to load Nuvei Simply Connect SDK:', err);
          // Even in production, continue with UI-only mode if SDK fails to load
          setSdkLoaded(true);
        };
        
        document.head.appendChild(script);
      } else {
        // In development, since secure.sandbox.nuvei.com doesn't exist,
        // we'll simulate SDK loading for testing purposes
        // In a real implementation with proper Nuvei sandbox, this would load the actual SDK
        console.log('Development: Secure sandbox SDK domain not available, proceeding with UI-only simulation');
        // Simulate async loading
        setTimeout(() => {
          setSdkLoaded(true);
        }, 500);
      }
    };

    loadSdk();
  }, []);

  // Initialize payment session with backend when SDK is loaded
  const initializePayment = async () => {
    if (loading || !sdkLoaded) return;
    
    setLoading(true);
    setError(null);
    setCheckoutInitialized(false); // Reset checkout initialization when re-initializing

    try {
      // Validate inputs
      if (!contract || (!contract.id && !contract._id)) {
        throw new Error('Contract information is required');
      }
      
      const contractId = contract.id || contract._id;
      const paymentAmount = parseFloat(amount);
      
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        throw new Error('Valid payment amount is required');
      }

      // Request Simply Connect session from backend
      const response = await apiClient.post('/payments/nuvei/create-simply-connect-session', {
        contractId,
        amount: paymentAmount,
        currency: 'CAD' // Canadian Dollar for Canadian market
      });

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from payment server');
      }

      const { sessionId, merchantId, merchantSiteId, checkoutParams, apmSupport } = response.data.data;

      if (!sessionId) {
        throw new Error('Failed to create payment session');
      }

      setSessionToken(sessionId);
      // Store merchant information, checkout parameters, and APM support for checkout initialization
      sessionStorage.setItem('nuveiMerchantInfo', JSON.stringify({
        merchantId,
        merchantSiteId,
        checkoutParams,
        apmSupport
      }));

    } catch (err) {
      console.error('Failed to initialize Nuvei Simply Connect payment:', err);
      let errorMessage = 'Failed to initialize payment';
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.message || 
                      err.response.data?.error || 
                      `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'Network error: Unable to connect to payment server';
      } else {
        // Something else happened
        errorMessage = err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
      onPaymentError?.(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset checkout initialization when payment method changes in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && window.checkout && checkoutInitialized) {
      // In production, when payment method changes, we need to reinitialize the checkout
      // For now, we'll just reset the initialized flag to trigger reinitialization
      setCheckoutInitialized(false);
    }
  }, [selectedPaymentMethod, checkoutInitialized]);

  const handlePaymentSuccess = (result) => {
    try {
      // Confirm the payment with our backend using the transaction ID
      apiClient.post('/payments/nuvei/confirm-simply-connect-payment', {
        contractId: contract._id || contract.id,
        transactionId: result.transactionId,
        paymentResult: result
      })
      .then(response => {
        console.log('Payment confirmed with backend', response.data);
        onPaymentSuccess && onPaymentSuccess(result);
      })
      .catch(err => {
        console.error('Error confirming payment with backend:', err);
        onPaymentError && onPaymentError(err);
      });
    } catch (err) {
      console.error('Error in payment success handling:', err);
      onPaymentError && onPaymentError(err);
    }
  };

  const handlePaymentError = (result) => {
    console.error('Simply Connect payment error:', result);
    const error = result.errorDescription || result.result || 'Payment failed';
    onPaymentError && onPaymentError(new Error(error));
  };

  // Initialize Simply Connect checkout when SDK is loaded and we have a session token
  useEffect(() => {
    if (sdkLoaded && sessionToken && checkoutContainerRef.current) {
      // If checkout is already initialized, we need to reinitialize when payment method changes
      if (checkoutInitialized) {
        // In production, when payment method changes, we need to reinitialize the checkout
        if (process.env.NODE_ENV === 'production' && window.checkout) {
          // Reset the initialized flag to trigger reinitialization with new payment method
          setCheckoutInitialized(false);
          return;
        }
        // In development, we've already initialized the simulated checkout
        // The simulated checkout handles payment method changes internally
        return;
      }
      
      // Initialize checkout if not already initialized
      // In development, since the SDK doesn't load, we'll simulate the checkout behavior
      if (process.env.NODE_ENV !== 'production' && !window.checkout) {
        console.log('Development: Simulating Simply Connect checkout behavior');
        // Show a simulated payment form for development/testing
        if (checkoutContainerRef.current) {
          checkoutContainerRef.current.innerHTML = `
            <div style="padding: 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <h3>Simply Connect Payment Simulation</h3>
              <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                <div id="card-option" style="flex: 1; border: 2px solid #007bff; border-radius: 8px; padding: 15px; cursor: pointer; background: #e7f3ff; transition: all 0.3s;">
                  <strong>Credit/Debit Card</strong>
                  <p>Pay with your card</p>
                </div>
                <div id="instadebit-option" style="flex: 1; border: 1px solid #ccc; border-radius: 8px; padding: 15px; cursor: pointer; background: #f9f9f9; transition: all 0.3s;">
                  <strong>InstaDebit</strong>
                  <p>Pay from your Canadian bank account</p>
                </div>
              </div>
              
              <div id="card-form" style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 10px 0;">
                <h4>Card Details</h4>
                <div style="margin-bottom: 10px;">
                  <label style="display: block; margin-bottom: 5px;">Name on Card</label>
                  <input type="text" placeholder="John Smith" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 10px;">
                  <label style="display: block; margin-bottom: 5px;">Card Number</label>
                  <input type="text" placeholder="1234 5678 9012 3456" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <div style="display: flex; gap: 10px;">
                  <div style="flex: 1;">
                    <label style="display: block; margin-bottom: 5px;">Expiry Date</label>
                    <input type="text" placeholder="MM/YY" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">
                  </div>
                  <div style="flex: 1;">
                    <label style="display: block; margin-bottom: 5px;">CVV</label>
                    <input type="text" placeholder="123" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">
                  </div>
                </div>
              </div>
              
              <div id="instadebit-form" style="border: 1px solid #ccc; border-radius: 8px; padding: 20px; margin: 10px 0; display: none;">
                <h4>Bank Account Details</h4>
                <p>Securely connect to your Canadian bank account through InstaDebit</p>
                <div style="margin-top: 15px; padding: 15px; background: #f0f8ff; border-radius: 4px; border: 1px solid #b3d9ff;">
                  <p style="margin: 0; font-size: 0.9em; color: #555;">
                    <strong>🔒 Secure Banking:</strong> You will be redirected to your bank's secure portal to authenticate.
                  </p>
                </div>
              </div>
              
              <button id="simulate-pay-btn" style="width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 16px; margin-top: 20px; cursor: pointer;">
                Pay $${amount ? amount.toFixed(2) : '0.00'} CAD via ${selectedPaymentMethod === 'card' ? 'Card' : 'InstaDebit'}
              </button>
            </div>
            
            <div style="background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 4px; padding: 15px; margin-top: 15px;">
              <strong>🔒 Secure Payment</strong>
              <p>Your payment is processed securely by Nuvei. This is a simulation for development purposes.</p>
            </div>
          `;
          
          // Add event listeners for payment method selection
          setTimeout(() => {
            const cardOption = document.getElementById('card-option');
            const instadebitOption = document.getElementById('instadebit-option');
            const cardForm = document.getElementById('card-form');
            const instadebitForm = document.getElementById('instadebit-form');
            const simulateBtn = document.getElementById('simulate-pay-btn');
            
            if (cardOption && instadebitOption) {
              // Set initial selection based on selectedPaymentMethod
              if (selectedPaymentMethod === 'instadebit') {
                cardOption.style.borderColor = '#ccc';
                cardOption.style.background = '#f9f9f9';
                instadebitOption.style.borderColor = '#007bff';
                instadebitOption.style.background = '#e7f3ff';
                cardForm.style.display = 'none';
                instadebitForm.style.display = 'block';
              } else {
                cardOption.style.borderColor = '#007bff';
                cardOption.style.background = '#e7f3ff';
                instadebitOption.style.borderColor = '#ccc';
                instadebitOption.style.background = '#f9f9f9';
                cardForm.style.display = 'block';
                instadebitForm.style.display = 'none';
              }
              
              // Card selection
              cardOption.addEventListener('click', () => {
                setSelectedPaymentMethod('card');
              });
              
              // InstaDebit selection
              instadebitOption.addEventListener('click', () => {
                setSelectedPaymentMethod('instadebit');
              });
              
              // Update simulate button text on payment method change
              if (simulateBtn) {
                simulateBtn.addEventListener('click', () => {
                  console.log('Simulated payment processed with method:', selectedPaymentMethod);
                  // Simulate successful payment
                  handlePaymentSuccess({
                    result: 'APPROVED',
                    transactionStatus: 'APPROVED',
                    transactionId: 'sim_' + Date.now(),
                    amount: amount,
                    currency: 'CAD',
                    paymentMethod: selectedPaymentMethod,
                    paymentResult: selectedPaymentMethod
                  });
                });
              }
            }
          }, 100);
        }
        setCheckoutInitialized(true);
        return;
      }
      
      // For production or when SDK is actually loaded
      if (!window.checkout) {
        console.log('Checkout SDK not available');
        return;
      }

      // Get user email from context or use a default
      const userEmail = localStorage.getItem('userEmail') || 'customer@example.com';
      const userFullName = localStorage.getItem('userFullName') || 'Customer Name';
      const userId = localStorage.getItem('userId') || '';

      // Get merchant information and checkout parameters from session storage
      const merchantInfo = JSON.parse(sessionStorage.getItem('nuveiMerchantInfo') || '{}');
      const checkoutParams = merchantInfo.checkoutParams || {};
      
      // Initialize the Simply Connect checkout with proper configuration
      window.checkout({
        sessionToken: sessionToken,
        merchantId: merchantInfo.merchantId || process.env.VITE_NUVEI_MERCHANT_ID,
        merchantSiteId: merchantInfo.merchantSiteId || process.env.VITE_NUVEI_MERCHANT_SITE_ID,
        env: process.env.NODE_ENV === 'production' ? 'prod' : 'int', // production or integration environment
        country: checkoutParams.country || 'CA', // Canada as the primary market (essential for InstaDebit availability)
        locale: checkoutParams.locale || 'en', // English language
        currency: checkoutParams.currency || 'CAD', // Canadian Dollar as the primary currency (essential for InstaDebit availability)
        amount: checkoutParams.amount || amount,
        fullName: checkoutParams.customerFullName || userFullName,
        email: checkoutParams.customerEmail || userEmail,
        userId: userId, // User ID if available
        billingAddress: checkoutParams.billingAddress || {
          email: checkoutParams.customerEmail || userEmail,
          country: checkoutParams.country || 'CA' // Essential for InstaDebit to be offered
        },
        // Additional fields from documentation
        clientRequestId: checkoutParams.clientRequestId,
        orderId: checkoutParams.orderId,
        
        // UI Customization for Canadian market
        cardLogo: {
          cardLogoPosition: 'right',
          backgroundSize: '30px 40px'
        },
        showCardLogos: true, // Show card scheme logos
        
        // APM (Alternative Payment Method) Configuration for InstaDebit
        // InstaDebit is a Canada-specific payment method that requires special handling
        apmWindowType: 'newTab', // InstaDebit requires redirect to banking portal, newTab provides better UX
        autoOpenPM: true, // Always show APM section expanded for better visibility
        
        // Enable decline recovery - allows users to try alternative payment methods on decline
        disableDeclineRecovery: false, // Enable decline recovery feature
        
        // Additional payment customizations
        promoCode: false, // Don't show promotional code field by default
        useDCC: "disable", // Disable Dynamic Currency Conversion for CAD
        
        // Card processing customizations
        alwaysCollectCvv: true, // Always collect CVV for stored cards
        maskCvv: false, // Don't mask CVV input
        
        // APM-specific configuration for InstaDebit and other payment methods
        apmConfig: {
          apmgw_InstaDebit: {
            savePM: "true", // Allow users to save their InstaDebit payment method for future use
            // InstaDebit-specific fields can be added here when identified
          },
          // Configuration for credit cards
          cc_card: {
            savePM: "true" // Allow users to save credit card details
          }
        },
        
        // Text and translation customization for Canadian users including InstaDebit
        i18n: {
          // Customize UI labels for Canadian users
          cc_name_on_card: 'Name on Card',
          cc_card_number: 'Card Number',
          cvv: 'CVV/CVC',
          mm_yy: 'MM/YY',
          expiry_date: 'Expiry Date',
          pay: 'Pay Now',
          cancel: 'Cancel',
          my_methods: 'My Payment Methods',
          other_methods: 'Select Payment Method',
          success: 'Payment Successful',
          success_text: 'Your payment has been processed successfully.',
          // Canadian-specific personal ID fields (if needed)
          personal_id: 'Personal ID',
          // InstaDebit-specific labels
          apmgw_InstaDebit: 'InstaDebit (Online Banking)',
          instadebit_description: 'Pay directly from your Canadian bank account using online banking',
          instadebit_secure_note: 'Your banking credentials are never shared with Gygg. You\'ll be redirected to your bank\'s secure portal.'
        },
        // Error message customization for Canadian users including InstaDebit
        error_i18n: {
          decline: 'Your payment was declined. Please try another payment method.',
          timeoutretry: 'Payment timed out. Please try again.',
          donohonour: 'Transaction not approved. Please contact your bank.',
          insufficient_funds: 'Insufficient funds. Please check your account balance.',
          // InstaDebit-specific error messages
          instadebit_declined: 'InstaDebit payment was declined. Please verify your online banking credentials and try again.',
          instadebit_timeout: 'InstaDebit payment timed out. Please check your bank\'s online portal for transaction status.',
          instadebit_authentication_failed: 'InstaDebit authentication failed. Please ensure you have the correct online banking credentials.'
        },
        // Response message handling
        showResponseMessage: true, // Show Nuvei's default response messages
        // Pay button customization
        payButton: 'amountButton', // Show amount on the pay button
        // Styling
        styles: {
          // Customize the look and feel for Canadian market
          '.sc-input': {
            'border-color': '#ced4da',
            'border-radius': '4px',
            'font-family': "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          },
          '.sc-button': {
            'background-color': '#007bff',
            'border-radius': '4px',
            'font-weight': 'bold'
          },
          '.sc-button:hover': {
            'background-color': '#0056b3'
          }
        },
        renderTo: '#nuvei-checkout-container',
        onResult: function(result) {
          console.log("Simply Connect Result", result);
          if (result && (result.result === 'APPROVED' || result.transactionStatus === 'APPROVED')) {
            handlePaymentSuccess(result);
          } else {
            handlePaymentError(result);
          }
        }
      });
      
      setCheckoutInitialized(true);
    }
  }, [sdkLoaded, sessionToken, selectedPaymentMethod, checkoutInitialized]);

  // Add a useEffect to handle payment method changes in development simulation
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !window.checkout && checkoutInitialized) {
      // In development simulation, update the displayed payment method when it changes
      const simulateBtn = document.getElementById('simulate-pay-btn');
      if (simulateBtn) {
        simulateBtn.textContent = `Pay $${amount ? amount.toFixed(2) : '0.00'} CAD via ${selectedPaymentMethod === 'card' ? 'Card' : 'InstaDebit'}`;
      }
      
      // Update form visibility based on selected payment method
      const cardForm = document.getElementById('card-form');
      const instadebitForm = document.getElementById('instadebit-form');
      const cardOption = document.getElementById('card-option');
      const instadebitOption = document.getElementById('instadebit-option');
      
      if (cardForm && instadebitForm && cardOption && instadebitOption) {
        if (selectedPaymentMethod === 'instadebit') {
          cardForm.style.display = 'none';
          instadebitForm.style.display = 'block';
          cardOption.style.borderColor = '#ccc';
          cardOption.style.background = '#f9f9f9';
          instadebitOption.style.borderColor = '#007bff';
          instadebitOption.style.background = '#e7f3ff';
        } else {
          cardForm.style.display = 'block';
          instadebitForm.style.display = 'none';
          cardOption.style.borderColor = '#007bff';
          cardOption.style.background = '#e7f3ff';
          instadebitOption.style.borderColor = '#ccc';
          instadebitOption.style.background = '#f9f9f9';
        }
      }
    }
  }, [selectedPaymentMethod, checkoutInitialized, amount]);

  // If we have a session token and SDK is loaded, show the Simply Connect form
  if (sdkLoaded && sessionToken) {
    return (
      <div className={styles.paymentContainer}>
        <div className={styles.paymentMethods}>
          <h3>Pay with Nuvei Simply Connect</h3>
          <p>Secure payment processing powered by Nuvei</p>
          
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {/* Payment method selection for production environment */}
          {process.env.NODE_ENV === 'production' && window.checkout && (
            <div className={styles.paymentMethodSelector}>
              <div className={styles.paymentMethodOptions}>
                <button
                  className={`${styles.paymentMethodOption} ${selectedPaymentMethod === 'card' ? styles.active : ''}`}
                  onClick={() => {
                    setSelectedPaymentMethod('card');
                    setCheckoutInitialized(false); // Reset to reinitialize with new payment method
                  }}
                >
                  <span className={styles.methodIcon}>💳</span>
                  <span className={styles.methodText}>Credit/Debit Card</span>
                </button>
                <button
                  className={`${styles.paymentMethodOption} ${selectedPaymentMethod === 'instadebit' ? styles.active : ''}`}
                  onClick={() => {
                    setSelectedPaymentMethod('instadebit');
                    setCheckoutInitialized(false); // Reset to reinitialize with new payment method
                  }}
                >
                  <span className={styles.methodIcon}>🏦</span>
                  <span className={styles.methodText}>InstaDebit (Bank)</span>
                </button>
              </div>
            </div>
          )}

          <div id="nuvei-checkout-container" ref={checkoutContainerRef} style={{ width: '100%', minHeight: '500px', border: '1px solid #d3d3d3', borderRadius: '4px' }}>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>Loading payment form...</p>
            </div>
          </div>

          <div className={styles.securityNote}>
            <span className={styles.lockIcon}>🔒</span>
            <span>Your payment information is processed securely by Nuvei and never stored on our servers.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.paymentContainer}>
      <div className={styles.paymentMethods}>
        <h3>Pay with Nuvei Simply Connect</h3>
        <p>Secure payment processing powered by Nuvei</p>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {!sdkLoaded ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading secure payment system...</p>
          </div>
        ) : (
          <button
            className={styles.payButton}
            onClick={initializePayment}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className={styles.buttonSpinner}></div>
                Initializing Payment (CAD) - Cards & InstaDebit...
              </>
            ) : (
              `Pay $${amount.toFixed(2)} CAD via Cards or InstaDebit`
            )}
          </button>
        )}

        <div className={styles.paymentInfo}>
          <p>Enter your payment details securely in the form above (CAD).</p>
          <p>Supported payment methods: Credit/Debit Cards, InstaDebit (CAD) - Canada only</p>
          <p className={styles.note}>ℹ️ InstaDebit requires online banking access and will redirect you to your bank's secure portal.</p>
        </div>

        <div className={styles.securityNote}>
          <span className={styles.lockIcon}>🔒</span>
          <span>Your payment information is processed securely by Nuvei and never stored on our servers. InstaDebit payments are processed through your bank's secure online banking portal.</span>
        </div>
      </div>
    </div>
  );
};

export default NuveiSimplyConnectPayment;