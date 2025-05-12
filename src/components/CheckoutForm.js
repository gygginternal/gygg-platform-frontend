import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

function CheckoutForm({ clientSecret, onPaymentSuccess, onPaymentError }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) { setMessage("Stripe.js hasn't loaded yet."); return; }
        setIsLoading(true); setMessage('Processing payment...');

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements, redirect: 'if_required'
        });

        if (error) {
             console.error("Payment Error:", error);
             setMessage(error.message || 'An unexpected error occurred.');
             if (onPaymentError) onPaymentError(error.message);
        } else if (paymentIntent) {
             console.log("Payment Intent:", paymentIntent);
             switch (paymentIntent.status) {
                 case 'succeeded': setMessage('Payment successful!'); if (onPaymentSuccess) onPaymentSuccess(paymentIntent.id); break;
                 case 'processing': setMessage('Payment processing...'); break;
                 case 'requires_payment_method':setMessage('Payment failed. Please try another method.'); if (onPaymentError) onPaymentError('Payment failed.'); break;
                 default: setMessage('Something went wrong.'); if (onPaymentError) onPaymentError('Something went wrong.'); break;
             }
        } else { setMessage('Unexpected state.'); if (onPaymentError) onPaymentError('Unexpected state.'); }
        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <h4 style={{ marginBottom: '20px'}}>Enter Payment Details:</h4>
            <PaymentElement id="payment-element" />
            <button disabled={isLoading || !stripe || !elements} id="submit" style={{ marginTop: '24px', width: '100%' }}>
                <span>{isLoading ? 'Processing...' : 'Pay now'}</span>
            </button>
            {message && <div id="payment-message" style={{ marginTop: '15px', textAlign: 'center', color: message.includes('success') ? 'green' : 'red' }}>{message}</div>}
        </form>
    );
}
export default CheckoutForm;