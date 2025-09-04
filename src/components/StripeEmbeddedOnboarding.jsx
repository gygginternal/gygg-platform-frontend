// src/components/StripeEmbeddedOnboarding.jsx
import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import apiClient from '../api/axiosConfig';
import styles from './StripeEmbeddedOnboarding.module.css';

// Load Stripe.js with Connect support
let stripePromise;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export function StripeEmbeddedOnboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const onboardingRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Fetch account status
  const fetchAccountStatus = async () => {
    try {
      const response = await apiClient.get('/users/stripe/account-status');
      setAccountStatus(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching account status:', err);
      setError('Failed to fetch account status');
      return null;
    }
  };

  // Check if onboarding is complete
  const checkOnboardingStatus = async () => {
    try {
      const response = await apiClient.get('/payments/onboarding-status');
      if (response.data.data.onboardingComplete) {
        setSuccess(true);
        fetchAccountStatus(); // Refresh status
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error checking onboarding status:', err);
      return false;
    }
  };

  // Start polling for onboarding completion
  const startPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      const isComplete = await checkOnboardingStatus();
      if (isComplete) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }, 3000);
  };

  // Stop polling
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // Initialize onboarding
  const initiateOnboarding = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Create connected account if needed
      await apiClient.post('/payments/create-connected-account');

      // Get account session/link
      // Try embedded first, fall back to redirect if embedded is not supported
      try {
        const response = await apiClient.post(
          '/payments/initiate-account-session?embedded=true'
        );
        console.log('Account session response:', response);
        const { clientSecret, url } = response.data.data;
        console.log('Client secret:', clientSecret);
        console.log('URL:', url);

        // If we got a URL, use redirect approach
        if (url) {
          window.location.href = url;
          return;
        }

        // If we got a client secret, try embedded approach
        if (clientSecret) {
          // Load Stripe
          const stripe = await getStripe();

          // Clear existing content
          if (onboardingRef.current) {
            onboardingRef.current.innerHTML = '';
          }

          // Try different methods to initialize embedded onboarding
          let onboarding;

          // Method 1: initEmbeddedAccountOnboarding
          if (typeof stripe.initEmbeddedAccountOnboarding === 'function') {
            try {
              console.log('Trying initEmbeddedAccountOnboarding...');
              onboarding = await stripe.initEmbeddedAccountOnboarding({
                clientSecret,
              });
            } catch (err) {
              console.log('initEmbeddedAccountOnboarding failed:', err);
              throw err;
            }
          }
          // Method 2: connectEmbeddedAccountSession
          else if (typeof stripe.connectEmbeddedAccountSession === 'function') {
            try {
              console.log('Trying connectEmbeddedAccountSession...');
              const result =
                await stripe.connectEmbeddedAccountSession(clientSecret);
              if (result.error) {
                throw new Error(result.error.message);
              }
              // This method doesn't return an object to mount, it handles UI automatically
              return;
            } catch (err) {
              console.log('connectEmbeddedAccountSession failed:', err);
              throw err;
            }
          }
          // No valid method found
          else {
            throw new Error(
              'No valid embedded onboarding method found in Stripe.js'
            );
          }

          // Mount embedded onboarding (only for initEmbeddedAccountOnboarding)
          if (onboarding && typeof onboarding.mount === 'function') {
            onboarding.mount(onboardingRef.current);
          }
        }
      } catch (embeddedError) {
        console.log(
          'Embedded onboarding failed, trying redirect approach:',
          embeddedError
        );
        // Fall back to redirect approach
        const redirectResponse = await apiClient.post(
          '/payments/initiate-account-session'
        );
        if (redirectResponse.data.data.url) {
          window.location.href = redirectResponse.data.data.url;
          return;
        }
        throw embeddedError;
      }

      // Start polling for completion
      startPolling();

      setLoading(false);
    } catch (err) {
      console.error('Error initiating onboarding:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to initiate onboarding'
      );
      setLoading(false);
    }
  };

  // Handle exit
  const handleExit = () => {
    stopPolling();

    if (onboardingRef.current) {
      onboardingRef.current.innerHTML = '';
    }

    fetchAccountStatus();
  };

  // Cleanup
  useEffect(() => {
    fetchAccountStatus();

    return () => {
      stopPolling();
      if (onboardingRef.current) {
        onboardingRef.current.innerHTML = '';
      }
    };
  }, []);

  // Handle before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopPolling();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.success}>
          <span className={styles.checkmark}>✓</span>
          <h3>Account Connected & Active</h3>
          <p>Your Stripe account setup is completed.</p>
          <button className={styles.refreshButton} onClick={fetchAccountStatus}>
            Refresh Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.onboardingCard}>
        <h3>Complete Your Stripe Setup</h3>
        <p>
          To receive payments, please complete your Stripe account verification.
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

        <div
          ref={onboardingRef}
          className={styles.embeddedOnboarding}
          style={{ minHeight: '500px', marginTop: '20px' }}
        ></div>
      </div>
    </div>
  );
}
