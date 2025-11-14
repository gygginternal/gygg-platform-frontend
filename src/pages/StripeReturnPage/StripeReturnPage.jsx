import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../api/axiosConfig'; // If triggering status check automatically
import { useToast } from '../../contexts/ToastContext';
import styles from './StripeReturnPage.module.css'; // Import CSS Modules

function StripeReturnPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  // Check if this is coming from a payment confirmation
  const paymentIntentId = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');

  // We'll determine if it's a payment return based on the presence of payment_intent
  const isPaymentReturn = !!paymentIntentId;

  useEffect(() => {
    // For payment returns, we should check if payment was successful
    if (isPaymentReturn && paymentIntentId) {
      // We don't have contractId from params, so we can't call confirm-payment-success directly here
      // Instead, we'll rely on the webhook to handle the confirmation, and just refresh the UI
      const timer = setTimeout(() => {
        if (redirectStatus === 'succeeded') {
          showToast('Payment completed successfully!', 'success');
        } else if (redirectStatus === 'processing') {
          showToast('Payment is being processed, please check back shortly', 'info');
        } else if (redirectStatus === 'requires_payment_method') {
          showToast('Payment failed, please try again', 'error');
        }
        navigate('/contracts');
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      // For onboarding return, continue with original logic
      const timer = setTimeout(() => {
        // Option 1: Just navigate to dashboard, user can refresh status there
        navigate('/settings?activeTab=withdraw');

        // Option 2: Try fetching status here (might be too soon for webhook)
        apiClient
          .get('/users/stripe-status')
          .then(response => {
            // Optionally update user context or redirect
          })
          .catch(error => {
            // Option 2: Navigate anyway
            navigate('/profile');
          });
      }, 1500); // Wait 1.5 seconds

      return () => clearTimeout(timer);
    }
  }, [isPaymentReturn, paymentIntentId, redirectStatus, navigate, showToast]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Returning from Stripe...</h2>
      <p className={styles.message}>
        {!isPaymentReturn
          ? "Processing your account setup. You will be redirected shortly."
          : "Processing your payment. You will be redirected shortly."
        }
      </p>
      <p className={styles.redirectPrompt}>
        If redirection doesn&apos;t happen,{' '}
        {!isPaymentReturn ? (
          <>
            <Link to="/settings?activeTab=withdraw" className={styles.link}>
              click here to go to your Dashboard
            </Link>{' '}
            and check your Stripe status.
          </>
        ) : (
          <>
            <Link to="/contracts" className={styles.link}>
              click here to go to your Contracts
            </Link>{' '}
            to see payment status.
          </>
        )}
      </p>
    </div>
  );
}

export default StripeReturnPage;
