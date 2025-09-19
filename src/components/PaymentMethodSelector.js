/**
 * Example frontend component for payment method selection
 * This is a conceptual example showing how the frontend could be updated
 * to support multiple payment methods.
 */

import React, { useState, useEffect } from 'react';
import { 
  loadStripe, 
  createPaymentIntent, 
  confirmPayment 
} from '../services/paymentService';

// Example payment service that supports multiple gateways
const paymentService = {
  // Get available payment methods for the platform
  getAvailablePaymentMethods: async () => {
    // This would come from an API endpoint
    return [
      { id: 'stripe', name: 'Credit Card (Stripe)', icon: '💳' },
      { id: 'paypal', name: 'PayPal', icon: '🅿️' },
      { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' }
    ];
  },

  // Create payment intent with selected gateway
  createPaymentIntent: async (contractId, paymentGateway) => {
    const response = await fetch(`/api/v1/payments/contracts/${contractId}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ paymentGateway })
    });
    
    return await response.json();
  },

  // Process payment based on gateway
  processPayment: async (paymentData, gateway) => {
    switch (gateway) {
      case 'stripe':
        return await processStripePayment(paymentData);
      case 'paypal':
        return await processPayPalPayment(paymentData);
      case 'bank_transfer':
        return await processBankTransfer(paymentData);
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
  }
};

// Stripe payment processing
const processStripePayment = async (paymentData) => {
  const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
  
  // Confirm the payment
  const result = await stripe.confirmCardPayment(paymentData.clientSecret, {
    payment_method: {
      card: paymentData.cardElement,
      billing_details: {
        name: paymentData.name,
        email: paymentData.email
      }
    }
  });
  
  return result;
};

// PayPal payment processing
const processPayPalPayment = async (paymentData) => {
  // Redirect to PayPal for payment approval
  window.location.href = paymentData.approvalUrl;
  
  // In a real implementation, you would listen for PayPal's return
  // and confirm the payment with your backend
  return { status: 'redirected_to_paypal' };
};

// Bank transfer processing
const processBankTransfer = async (paymentData) => {
  // For bank transfers, we might just generate instructions
  // and mark the payment as pending manual confirmation
  
  // This would likely involve:
  // 1. Generating bank transfer instructions
  // 2. Providing reference numbers
  // 3. Setting payment status to 'pending_verification'
  
  return {
    status: 'pending_bank_transfer',
    instructions: `Please transfer ${paymentData.amount} to the following account: ...`,
    reference: `PAYMENT-${paymentData.paymentId}`
  };
};

// React component for payment method selection
const PaymentMethodSelector = ({ contractId, onPaymentComplete }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load available payment methods
    const loadPaymentMethods = async () => {
      try {
        const methods = await paymentService.getAvailablePaymentMethods();
        setPaymentMethods(methods);
        // Select the first method by default
        if (methods.length > 0) {
          setSelectedMethod(methods[0].id);
        }
      } catch (err) {
        setError('Failed to load payment methods');
      }
    };

    loadPaymentMethods();
  }, []);

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create payment intent with selected gateway
      const paymentIntent = await paymentService.createPaymentIntent(
        contractId, 
        selectedMethod
      );

      if (!paymentIntent.success) {
        throw new Error(paymentIntent.message || 'Failed to create payment');
      }

      // Process the payment based on the selected gateway
      const result = await paymentService.processPayment(
        {
          ...paymentIntent.data,
          amount: paymentIntent.data.amount,
          paymentId: paymentIntent.data.paymentId
        },
        selectedMethod
      );

      if (result.error) {
        throw new Error(result.error.message || 'Payment failed');
      }

      // Notify parent component of successful payment
      onPaymentComplete(result);
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="payment-method-selector">
      <h3>Select Payment Method</h3>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="payment-methods">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`payment-method-option ${
              selectedMethod === method.id ? 'selected' : ''
            }`}
            onClick={() => setSelectedMethod(method.id)}
          >
            <span className="method-icon">{method.icon}</span>
            <span className="method-name">{method.name}</span>
          </div>
        ))}
      </div>

      <button
        className="pay-button"
        onClick={handlePayment}
        disabled={isLoading || !selectedMethod}
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
};

// Example usage in a payment page
const PaymentPage = ({ contractId }) => {
  const handlePaymentComplete = (result) => {
    console.log('Payment completed:', result);
    // Redirect to success page or update UI
  };

  return (
    <div className="payment-page">
      <h2>Complete Your Payment</h2>
      <PaymentMethodSelector 
        contractId={contractId}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};

export default PaymentPage;