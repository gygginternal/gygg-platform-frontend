/**
 * Payment Method Selector Component for Stripe and VoPay
 * This component allows users to choose between credit card (Stripe) 
 * and bank transfer (VoPay) for payments in Canada.
 */

import React, { useState, useEffect } from 'react';

// Example payment service that supports Stripe and VoPay
const paymentService = {
  // Get available payment methods for the platform (Canada-specific)
  getAvailablePaymentMethods: async () => {
    // In a real implementation, this would come from an API endpoint
    // that returns the gateway details from our factory
    return [
      { 
        id: 'stripe', 
        name: 'Credit/Debit Card', 
        description: 'Pay with Visa, Mastercard, American Express',
        icon: '💳',
        processingTime: 'Instant'
      },
      { 
        id: 'vopay', 
        name: 'Bank Transfer', 
        description: 'Pay with your Canadian bank account',
        icon: '🏦',
        processingTime: '1-2 business days'
      }
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
      case 'vopay':
        return await processVoPayPayment(paymentData);
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
  }
};

// Stripe payment processing
const processStripePayment = async (paymentData) => {
  // Load Stripe.js
  const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
  
  // Confirm the card payment
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

// VoPay payment processing
const processVoPayPayment = async (paymentData) => {
  // For VoPay bank transfers, we typically redirect or show instructions
  // since it's an asynchronous payment method
  
  // In a real implementation, you might:
  // 1. Show payment instructions to the user
  // 2. Redirect to a payment page
  // 3. Send an email notification
  // 4. Set up a webhook to listen for VoPay notifications
  
  return {
    status: 'pending_recipient',
    trackingId: paymentData.trackingId,
    instructions: paymentData.recipientInstructions,
    estimatedCompletion: paymentData.estimatedCompletion
  };
};

// React component for payment method selection
const PaymentMethodSelector = ({ contractId, amount, onPaymentComplete }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vopayEmail, setVopayEmail] = useState('');
  const [showVopayForm, setShowVopayForm] = useState(false);

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

    // For VoPay, we need the recipient's email
    if (selectedMethod === 'vopay' && !vopayEmail) {
      setError('Please enter your email for bank transfer');
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
          paymentId: paymentIntent.data.paymentId,
          recipientEmail: vopayEmail // For VoPay payments
        },
        selectedMethod
      );

      if (result.error) {
        throw new Error(result.error.message || 'Payment failed');
      }

      // For VoPay, we might want to show instructions instead of completing immediately
      if (selectedMethod === 'vopay') {
        setShowVopayForm(true);
        // Don't call onPaymentComplete yet for VoPay
        // This would be handled by a webhook when the transfer is completed
      } else {
        // Notify parent component of successful payment (Stripe)
        onPaymentComplete(result);
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVopayConfirm = () => {
    // When user confirms they've sent the bank transfer
    onPaymentComplete({ 
      status: 'pending_recipient',
      method: 'vopay'
    });
  };

  if (showVopayForm) {
    return (
      <div className="vopay-confirmation">
        <h3>Bank Transfer Instructions</h3>
        <p>An email with payment instructions has been sent to {vopayEmail}</p>
        <p>Please complete the transfer using your online banking.</p>
        <p>Amount: <strong>${(amount / 100).toFixed(2)} CAD</strong></p>
        <button 
          className="confirm-button"
          onClick={handleVopayConfirm}
        >
          I've Sent the Transfer
        </button>
      </div>
    );
  }

  return (
    <div className="payment-method-selector">
      <h3>Select Payment Method</h3>
      <p>Amount: <strong>${(amount / 100).toFixed(2)} CAD</strong></p>
      
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
            <div className="method-details">
              <span className="method-name">{method.name}</span>
              <span className="method-description">{method.description}</span>
              <span className="method-time">Processing: {method.processingTime}</span>
            </div>
          </div>
        ))}
      </div>

      {/* VoPay email input */}
      {selectedMethod === 'vopay' && (
        <div className="vopay-email-form">
          <label htmlFor="vopay-email">Email for Bank Transfer:</label>
          <input
            type="email"
            id="vopay-email"
            value={vopayEmail}
            onChange={(e) => setVopayEmail(e.target.value)}
            placeholder="your.email@example.com"
          />
          <p className="note">
            You'll receive an email notification to deposit the funds through your online banking.
          </p>
        </div>
      )}

      <button
        className="pay-button"
        onClick={handlePayment}
        disabled={isLoading || !selectedMethod}
      >
        {isLoading ? 'Processing...' : `Pay ${(amount / 100).toFixed(2)}`}
      </button>
    </div>
  );
};

// Example usage in a payment page
const PaymentPage = ({ contractId, amount }) => {
  const handlePaymentComplete = (result) => {
    console.log('Payment completed:', result);
    // Redirect to success page or update UI
    // For VoPay, this might be when the webhook confirms the transfer
  };

  return (
    <div className="payment-page">
      <h2>Complete Your Payment</h2>
      <PaymentMethodSelector 
        contractId={contractId}
        amount={amount}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};

export default PaymentPage;