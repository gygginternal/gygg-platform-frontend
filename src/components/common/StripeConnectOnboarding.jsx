// src/components/StripeConnectOnboarding.jsx
import { useState, useEffect } from 'react';
import apiClient from '../../api/axiosConfig';
import styles from './StripeConnectOnboarding.module.css';
import {
  ConnectComponentsProvider,
  ConnectAccountOnboarding,
} from '@stripe/react-connect-js';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import { useAuth } from '../../contexts/AuthContext';

export function StripeConnectOnboarding() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [stripeConnectInstance, setStripeConnectInstance] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Determine user role for appropriate messaging
  const isProvider = user?.role?.includes('provider');
  const isTasker = user?.role?.includes('tasker');

  // Fetch account status
  const fetchAccountStatus = async () => {
    try {
      const response = await apiClient.get('/users/stripe/account-status');
      // The response might be directly in response.data or response.data.data
      const accountData = response.data.data || response.data;
      setAccountStatus(accountData);

      // If account is fully onboarded, show success state
      if (
        accountData &&
        accountData.detailsSubmitted &&
        accountData.chargesEnabled &&
        accountData.payoutsEnabled
      ) {
        setSuccess(true);
        setError(null);
      } else {
        setSuccess(false);
      }

      return accountData;
    } catch (err) {
      console.error('Error fetching account status:', err);
      setError(
        'Failed to fetch account status. Please check your connection and try again.'
      );
      setSuccess(false);
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
    setLoading(true);

    // Check if onboarding is complete
    const status = await fetchAccountStatus();
    setLoading(false);

    if (
      status &&
      status.detailsSubmitted &&
      status.chargesEnabled &&
      status.payoutsEnabled
    ) {
      setSuccess(true);
      setError(null);
    } else if (status && status.detailsSubmitted) {
      setError(
        'Your account setup is in progress. Stripe is reviewing your information. This may take a few minutes to complete.'
      );
    } else {
      setError(
        'Onboarding was not completed. You can continue the setup process anytime by clicking the button below.'
      );
    }
  };

  // Handle step changes for analytics/tracking
  const handleStepChange = stepChange => {
    // You can add analytics tracking here
    // analytics.track('onboarding_step', { step: stepChange.step });
  };

  // Refresh status
  const refreshStatus = async () => {
    setLoading(true);
    setError(null);
    await fetchAccountStatus();
    setLoading(false);
  };

  // Retry onboarding
  const retryOnboarding = () => {
    setError(null);
    setSuccess(false);
    initializeConnect();
  };

  // Cleanup
  useEffect(() => {
    fetchAccountStatus();
  }, []);

  // Loading state component
  if (loading && !showOnboarding && !accountStatus) {
    return (
      <div className={styles.container}>
        <div className={styles.onboardingCard}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading your payment information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.success}>
          <span className={styles.checkmark}>✓</span>
          <h3>Onboarding Completed Successfully!</h3>
          <p>
            {isProvider
              ? 'Your Stripe account is now fully set up. You can pay taskers easily on the platform for their services.'
              : isTasker
                ? 'Your Stripe account is now fully set up and ready to receive payments. You can start accepting payments for your gigs immediately.'
                : 'Your Stripe account is now fully set up and ready for payments.'}
          </p>
          <button
            className={styles.refreshButton}
            onClick={refreshStatus}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Refresh Status'}
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
          {isProvider
            ? 'To make payments to taskers, please complete your Stripe account setup.'
            : isTasker
              ? 'To receive payments, please complete your Stripe account verification.'
              : 'Please complete your Stripe account setup to enable payments.'}
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
            {error.includes('not completed') && (
              <button
                className={styles.retryButton}
                onClick={retryOnboarding}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Continue Setup'}
              </button>
            )}
            {error.includes('in progress') && (
              <button
                className={styles.refreshButton}
                onClick={refreshStatus}
                disabled={loading}
              >
                {loading ? 'Checking...' : 'Check Status'}
              </button>
            )}
          </div>
        )}

        {!showOnboarding &&
          // Only show the main button if there's no error with a retry button
          (!error ||
          (!error.includes('not completed') &&
            !error.includes('in progress')) ? (
            <button
              className={styles.onboardButton}
              onClick={initializeConnect}
              disabled={loading}
            >
              {loading
                ? 'Processing...'
                : accountStatus && accountStatus.detailsSubmitted
                  ? 'Continue Setup'
                  : accountStatus
                    ? 'Update Payment Info'
                    : 'Start Onboarding'}
            </button>
          ) : null)}

        {showOnboarding && (
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
