// src/components/NuveiOnboarding.jsx
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
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    bankName: '',
  });

  // Determine user role for appropriate messaging
  const isProvider = user?.role?.includes('provider');
  const isTasker = user?.role?.includes('tasker');

  // Fetch account status
  const fetchAccountStatus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users/me'); // Get user details to check nuvei setup
      const userData = response.data.data.user;
      
      // Check Nuvei-specific details in user profile
      const hasNuveiDetails = !!(
        userData.nuveiBankDetails?.accountNumber &&
        userData.nuveiBankDetails?.routingNumber
      );
      
      setAccountStatus({
        hasNuveiDetails,
        bankDetails: userData.nuveiBankDetails || null
      });

      if (hasNuveiDetails) {
        setBankDetails(userData.nuveiBankDetails);
        setSuccess(true);
        setError(null);
      } else {
        setSuccess(false);
      }
    } catch (err) {
      console.error('Error fetching account status:', err);
      setError('Failed to fetch account status. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Save Nuvei bank details to user profile
      await apiClient.patch('/users/me', {
        nuveiBankDetails: bankDetails
      });

      setSuccess(true);
      setError(null);
      // Refresh status
      await fetchAccountStatus();
    } catch (err) {
      console.error('Error saving Nuvei details:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to save bank details. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Refresh status
  const refreshStatus = async () => {
    await fetchAccountStatus();
  };

  // Load initial status
  useEffect(() => {
    fetchAccountStatus();
  }, []);

  // Loading state
  if (loading && !accountStatus) {
    return (
      <div className={styles.container}>
        <div className={styles.onboardingCard}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading payment setup information...</p>
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
          <h3>Nuvei Setup Completed!</h3>
          <p>
            {isTasker
              ? 'Your bank details are set up. You can now receive payments via Nuvei.'
              : isProvider
                ? 'Your payment method is ready. You can now make payments via Nuvei.'
                : 'Your Nuvei payment setup is complete.'}
          </p>
          <button
            className={styles.refreshButton}
            onClick={refreshStatus}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Refresh Status'}
          </button>
        </div>

        {accountStatus?.bankDetails && (
          <div className={styles.statusDetails}>
            <h4>Bank Details</h4>
            <div className={styles.statusRow}>
              <span>Account Holder:</span>
              <span className={styles.statusValue}>
                {accountStatus.bankDetails.accountHolderName}
              </span>
            </div>
            <div className={styles.statusRow}>
              <span>Bank Name:</span>
              <span className={styles.statusValue}>
                {accountStatus.bankDetails.bankName}
              </span>
            </div>
            <div className={styles.statusRow}>
              <span>Account Number:</span>
              <span className={styles.statusValue}>
                ****{accountStatus.bankDetails.accountNumber.slice(-4)}
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
        <h3>Set Up Nuvei Payment Details</h3>
        <p>
          {isTasker
            ? 'To receive payments via Nuvei, please provide your bank account details.'
            : isProvider
              ? 'To make payments via Nuvei, you need to set up your payment details.'
              : 'Please provide your bank account details for Nuvei payments.'}
        </p>

        {accountStatus?.bankDetails && (
          <div className={styles.statusDetails}>
            <h4>Current Status</h4>
            <div className={styles.statusRow}>
              <span>Bank Details:</span>
              <span
                className={
                  accountStatus.hasNuveiDetails
                    ? styles.statusYes
                    : styles.statusNo
                }
              >
                {accountStatus.hasNuveiDetails ? 'Provided' : 'Missing'}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="accountHolderName">Account Holder Name</label>
            <input
              type="text"
              id="accountHolderName"
              name="accountHolderName"
              value={bankDetails.accountHolderName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bankName">Bank Name</label>
            <input
              type="text"
              id="bankName"
              name="bankName"
              value={bankDetails.bankName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="accountNumber">Account Number</label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={bankDetails.accountNumber}
              onChange={handleInputChange}
              placeholder="Enter your bank account number"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="routingNumber">Routing Number</label>
            <input
              type="text"
              id="routingNumber"
              name="routingNumber"
              value={bankDetails.routingNumber}
              onChange={handleInputChange}
              placeholder="Enter routing number"
              required
            />
          </div>

          <button
            type="submit"
            className={styles.onboardButton}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Save Bank Details'}
          </button>
        </form>
      </div>
    </div>
  );
}