// src/components/SimplifiedStripeOnboarding.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axiosConfig';
import styles from './SimplifiedStripeOnboarding.module.css';

export function SimplifiedStripeOnboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accountStatus, setAccountStatus] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  // Fetch account status when component mounts
  useEffect(() => {
    fetchAccountStatus();

    // Check for redirect return parameters
    const urlParams = new URLSearchParams(window.location.search);
    const onboardingStatus = urlParams.get('onboarding_status');

    if (onboardingStatus === 'success') {
      // Onboarding completed successfully
      setTimeout(() => {
        fetchAccountStatus();
      }, 2000);
    }
  }, []);

  const fetchAccountStatus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users/stripe/account-status');
      console.log('Account status response:', response);
      setAccountStatus(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching account status:', err);
      setError('Failed to fetch account status. Please try again.');
      setLoading(false);
    }
  };

  const initiateOnboarding = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create connected account if needed
      console.log('Creating connected account...');
      await apiClient.post('/payments/create-connected-account');
      console.log('Connected account created successfully');

      // Get account link for onboarding
      console.log('Initiating account session...');
      const response = await apiClient.post(
        '/payments/initiate-account-session'
      );
      console.log('Account session response:', response);

      if (response.data && response.data.data && response.data.data.url) {
        // Redirect to Stripe for onboarding
        setRedirecting(true);
        window.location.href = response.data.data.url;
      } else {
        console.error('Invalid response structure:', response);
        throw new Error('Failed to get onboarding URL. Please try again.');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error initiating onboarding:', err);

      let errorMessage = 'Failed to start onboarding. ';

      if (err.response) {
        errorMessage += err.response.data?.message || 'Please try again.';
      } else {
        errorMessage += err.message || 'Please try again or contact support.';
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  const refreshStatus = () => {
    fetchAccountStatus();
  };

  // If redirecting, show redirect message
  if (redirecting) {
    return (
      <div className={styles.container}>
        <div className={styles.redirecting}>
          <p>Redirecting to secure payment processor...</p>
          <p>
            Please complete your account setup and you'll be brought back to
            this page.
          </p>
        </div>
      </div>
    );
  }

  // If account is fully onboarded
  if (
    accountStatus &&
    accountStatus.detailsSubmitted &&
    accountStatus.chargesEnabled &&
    accountStatus.payoutsEnabled
  ) {
    return (
      <div className={styles.container}>
        <div className={styles.success}>
          <span className={styles.checkmark}>✓</span>
          <h3>Account Connected & Active</h3>
          <p>
            Your payment account is fully set up and ready to accept payments.
          </p>
          <button className={styles.refreshButton} onClick={refreshStatus}>
            Refresh Status
          </button>
        </div>

        <div className={styles.statusDetails}>
          <h4>Account Status</h4>
          <div className={styles.statusRow}>
            <span>Payouts Enabled:</span>
            <span className={styles.statusYes}>Yes</span>
          </div>
          <div className={styles.statusRow}>
            <span>Charges Enabled:</span>
            <span className={styles.statusYes}>Yes</span>
          </div>
          <div className={styles.statusRow}>
            <span>Details Submitted:</span>
            <span className={styles.statusYes}>Yes</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.onboardingCard}>
        <h3>
          {accountStatus
            ? 'Update Your Payment Information'
            : 'Complete Your Payment Setup'}
        </h3>
        <p>
          To receive payments, please complete your payment account
          verification.
        </p>

        {accountStatus && (
          <div className={styles.statusDetails}>
            <h4>Current Status</h4>
            <div className={styles.statusRow}>
              <span>Payouts Enabled:</span>
              <span
                className={
                  accountStatus.payoutsEnabled
                    ? styles.statusYes
                    : styles.statusNo
                }
              >
                {accountStatus.payoutsEnabled ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={styles.statusRow}>
              <span>Charges Enabled:</span>
              <span
                className={
                  accountStatus.chargesEnabled
                    ? styles.statusYes
                    : styles.statusNo
                }
              >
                {accountStatus.chargesEnabled ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={styles.statusRow}>
              <span>Details Submitted:</span>
              <span
                className={
                  accountStatus.detailsSubmitted
                    ? styles.statusYes
                    : styles.statusNo
                }
              >
                {accountStatus.detailsSubmitted ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        <button
          className={styles.onboardButton}
          onClick={initiateOnboarding}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Start Onboarding'}
        </button>
      </div>
    </div>
  );
}

export default SimplifiedStripeOnboarding;
