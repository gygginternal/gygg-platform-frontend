// src/components/StripeConnectOnboarding.jsx
import { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import styles from './StripeConnectOnboarding.module.css';
import {
  ConnectComponentsProvider,
  ConnectAccountOnboarding,
} from '@stripe/react-connect-js';
import { loadConnectAndInitialize } from '@stripe/connect-js';

export function StripeConnectOnboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [stripeConnectInstance, setStripeConnectInstance] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Fetch account status
  const fetchAccountStatus = async () => {
    try {
      const response = await apiClient.get('/users/stripe/account-status');
      setAccountStatus(response.data.data);

      // If account is fully onboarded, show success state
      if (
        response.data.data &&
        response.data.data.detailsSubmitted &&
        response.data.data.chargesEnabled &&
        response.data.data.payoutsEnabled
      ) {
        setSuccess(true);
      }

      return response.data.data;
    } catch (err) {
      setError('Failed to fetch account status');
      return null;
    }
  };

  // Fetch client secret function
  const fetchClientSecret = async () => {
    try {
      // Create connected account if needed
      await apiClient.post('/payments/create-connected-account');

      // Get client secret
      const accountResponse = await apiClient.post(
        '/payments/initiate-account-session?embedded=true'
      );

      const clientSecret = accountResponse.data.data?.clientSecret;

      if (!clientSecret) {
        throw new Error('Failed to get client secret from server');
      }

      // Validate client secret format
      if (typeof clientSecret !== 'string' || clientSecret.length < 50) {
        throw new Error('Invalid client secret format received from server');
      }

      return clientSecret;
    } catch (err) {
      // Provide a more user-friendly error message
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to initialize Stripe onboarding. Please try again.';
      throw new Error(errorMessage);
    }
  };

  // Initialize Stripe Connect
  const initializeConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if publishable key is available
      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        throw new Error(
          'Stripe publishable key is missing. Please check your environment configuration.'
        );
      }

      // Create a new Connect instance with the fetchClientSecret function
      const instance = loadConnectAndInitialize({
        publishableKey,
        fetchClientSecret,
        appearance: {
          overlays: 'dialog',
          variables: {
            colorPrimary: '#3d4d55',
          },
        },
      });

      setStripeConnectInstance(instance);
      setShowOnboarding(true);
      setLoading(false);
    } catch (err) {
      // Provide a more user-friendly error message
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to initialize onboarding. Please try again.';
      setError(`Initialization Error: ${errorMessage}`);
      setLoading(false);
    }
  };

  // Handle onboarding exit
  const handleOnboardingExit = async () => {
    console.log('User exited onboarding flow');

    // Reset the instance
    setStripeConnectInstance(null);
    setShowOnboarding(false);

    // Check if onboarding is complete
    const status = await fetchAccountStatus();

    if (status && status.detailsSubmitted) {
      console.log('Onboarding completed successfully');
      setSuccess(true);
    } else {
      console.log('Onboarding incomplete - user may need to return later');
    }
  };

  // Handle step changes for analytics/tracking
  const handleStepChange = stepChange => {
    console.log(`Onboarding step: ${stepChange.step}`);
    // You can add analytics tracking here
    // analytics.track('onboarding_step', { step: stepChange.step });
  };

  // Refresh status
  const refreshStatus = () => {
    fetchAccountStatus();
  };

  // Cleanup
  useEffect(() => {
    fetchAccountStatus();
  }, []);

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.success}>
          <span className={styles.checkmark}>✓</span>
          <h3>Account Connected & Active</h3>
          <p>Your Stripe account setup is completed.</p>
          <button className={styles.refreshButton} onClick={refreshStatus}>
            Refresh Status
          </button>
        </div>

        {accountStatus && (
          <div className={styles.statusDetails}>
            <h4>Account Status</h4>
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

        {!showOnboarding ? (
          <button
            className={styles.onboardButton}
            onClick={initializeConnect}
            disabled={loading}
          >
            {loading
              ? 'Processing...'
              : accountStatus
                ? 'Update Payment Info'
                : 'Start Onboarding'}
          </button>
        ) : (
          <div className={styles.onboardingWrapper}>
            <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
              <ConnectAccountOnboarding
                onExit={handleOnboardingExit}
                onStepChange={handleStepChange}
                onLoadError={error => {
                  // Provide a more user-friendly error message
                  const errorMessage =
                    error.message ||
                    'Failed to load onboarding component. Please try again or contact support.';
                  setError(`Onboarding Error: ${errorMessage}`);
                  setShowOnboarding(false);
                }}
                // Optional: Configure collection options
                collectionOptions={{
                  fields: 'eventually_due', // Collect all requirements upfront
                  futureRequirements: 'include', // Include future compliance requirements
                }}
              />
            </ConnectComponentsProvider>
            <button
              className={styles.cancelButton}
              onClick={handleOnboardingExit}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
