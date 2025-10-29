// src/components/common/NuveiOnboarding.jsx
import { useState, useEffect } from 'react';
import apiClient from '../../api/axiosConfig';
import styles from './NuveiOnboarding.module.css';
import { useAuth } from '../../contexts/AuthContext';

export function NuveiOnboarding() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingUrl, setOnboardingUrl] = useState('');

  // Determine user role for appropriate messaging
  const isProvider = user?.role?.includes('provider');
  const isTasker = user?.role?.includes('tasker');

  // Fetch Nuvei account status
  const fetchAccountStatus = async () => {
    try {
      const response = await apiClient.get('/payments/nuvei/onboarding-status');
      const accountData = response.data.data || response.data;
      setAccountStatus(accountData);

      // If account is fully onboarded, show success state
      if (accountData && accountData.connected && accountData.bankTransferEnabled) {
        setSuccess(true);
        setError(null);
      } else {
        setSuccess(false);
      }

      return accountData;
    } catch (err) {
      console.error('Error fetching Nuvei account status:', err);
      setError(
        'Failed to fetch account status. Please check your connection and try again.'
      );
      setSuccess(false);
      return null;
    }
  };

  // Start Nuvei onboarding process
  const startNuveiOnboarding = async () => {
    try {
      setLoading(true);
      setError(null);

      // Start Nuvei onboarding
      console.log('Starting Nuvei onboarding process...');
      const response = await apiClient.post('/payments/nuvei/start-onboarding');
      console.log('Nuvei onboarding response:', response.data);
      const onboardingData = response.data.data || response.data;

      if (onboardingData && onboardingData.onboardingUrl) {
        console.log('Setting onboarding URL and preparing redirect...');
        setOnboardingUrl(onboardingData.onboardingUrl);
        setShowOnboarding(true);
        
        // Validate URL before redirecting
        try {
          const url = new URL(onboardingData.onboardingUrl);
          console.log('Valid URL constructed, redirecting to:', url.href);
          
          // Give React a moment to render the redirect message before redirecting
          setTimeout(() => {
            console.log('Redirecting to Nuvei onboarding:', onboardingData.onboardingUrl);
            window.location.href = onboardingData.onboardingUrl;
          }, 100);
        } catch (urlError) {
          console.error('Invalid onboarding URL:', onboardingData.onboardingUrl, urlError);
          throw new Error('Invalid onboarding URL received from server');
        }
      } else {
        console.error('No onboarding URL in response:', onboardingData);
        throw new Error('Failed to get onboarding URL from server');
      }

      setLoading(false);
    } catch (err) {
      console.error('Nuvei onboarding error:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to start Nuvei onboarding. Please try again.';
      setError(`Onboarding Error: ${errorMessage}`);
      setLoading(false);
      setShowOnboarding(false);
    }
  };

  // Handle onboarding exit/completion
  const handleOnboardingExit = async () => {
    console.log('User exited Nuvei onboarding flow');

    // Reset the onboarding state
    setShowOnboarding(false);
    setOnboardingUrl('');
    setLoading(true);

    // Check if onboarding is complete
    const status = await fetchAccountStatus();
    setLoading(false);

    if (status && status.connected && status.bankTransferEnabled) {
      setSuccess(true);
      setError(null);
    } else if (status && status.connected) {
      setError(
        'Your account setup is in progress. Nuvei is reviewing your information. This may take a few minutes to complete.'
      );
    } else {
      setError(
        'Onboarding was not completed. You can continue the setup process anytime by clicking the button below.'
      );
    }
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
    startNuveiOnboarding();
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
            <p>Loading your Nuvei payment information...</p>
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
          <h3>Nuvei Onboarding Completed Successfully!</h3>
          <p>
            {isProvider
              ? 'Your Nuvei account is now fully set up. You can make payments to taskers easily on the platform for their services using InstaDebit and bank transfers.'
              : isTasker
                ? 'Your Nuvei account is now fully set up and ready to receive payments. You can accept payments via InstaDebit and direct bank transfers.'
                : 'Your Nuvei account is now fully set up and ready for payments.'}
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
              <span>Connected:</span>
              <span
                className={
                  accountStatus.connected
                    ? styles.statusYes
                    : styles.statusNo
                }
              >
                {accountStatus.connected ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={styles.statusRow}>
              <span>Bank Transfer Enabled:</span>
              <span
                className={
                  accountStatus.bankTransferEnabled
                    ? styles.statusYes
                    : styles.statusNo
                }
              >
                {accountStatus.bankTransferEnabled ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={styles.statusRow}>
              <span>Verification Status:</span>
              <span className={`${styles.statusValue} ${accountStatus.verificationStatus === 'not_required' ? styles.statusNotRequired : ''}`}>
                {accountStatus.verificationStatus 
                  ? accountStatus.verificationStatus === 'not_required' 
                    ? 'Not Required' 
                    : accountStatus.verificationStatus 
                  : 'N/A'}
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
            ? 'Update Your Nuvei Payment Information'
            : 'Complete Your Nuvei Payment Setup'}
        </h3>
        <p>
          {isProvider
            ? 'To make payments to taskers using Canadian bank transfers, please complete your Nuvei account setup.'
            : isTasker
              ? 'To receive payments via InstaDebit and direct bank transfers, please complete your Nuvei account verification.'
              : 'Please complete your Nuvei account setup to enable Canadian payment methods.'}
        </p>

        {accountStatus && (
          <div className={styles.statusDetails}>
            <h4>Current Status</h4>
            <div className={styles.statusRow}>
              <span>Connected:</span>
              <span
                className={
                  accountStatus.connected
                    ? styles.statusYes
                    : styles.statusNo
                }
              >
                {accountStatus.connected ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={styles.statusRow}>
              <span>Bank Transfer Enabled:</span>
              <span
                className={
                  accountStatus.bankTransferEnabled
                    ? styles.statusYes
                    : styles.statusNo
                }
              >
                {accountStatus.bankTransferEnabled ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={styles.statusRow}>
              <span>Verification Status:</span>
              <span className={`${styles.statusValue} ${accountStatus.verificationStatus === 'not_required' ? styles.statusNotRequired : ''}`}>
                {accountStatus.verificationStatus 
                  ? accountStatus.verificationStatus === 'not_required' 
                    ? 'Not Required' 
                    : accountStatus.verificationStatus 
                  : 'N/A'}
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
              onClick={startNuveiOnboarding}
              disabled={loading}
            >
              {loading
                ? 'Processing...'
                : accountStatus && accountStatus.connected
                  ? 'Continue Setup'
                  : accountStatus
                    ? 'Update Payment Info'
                    : 'Start Nuvei Onboarding'}
            </button>
          ) : null)}

        {showOnboarding && (
          <div className={styles.onboardingWrapper}>
            <div className={styles.redirectMessage}>
              <p>Redirecting to Nuvei onboarding...</p>
              <p>If you are not redirected automatically, <a href={onboardingUrl} target="_blank" rel="noopener noreferrer">click here</a>.</p>
            </div>
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