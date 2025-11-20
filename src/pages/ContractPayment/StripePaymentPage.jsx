import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../api/axiosConfig';
import StripePayment from '../../components/common/StripePayment';
import OnboardingNotCompletedModal from '../../components/common/OnboardingNotCompletedModal';
import styles from './StripePaymentPage.module.css';

const StripePaymentPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  useEffect(() => {
    if (!contractId) {
      setError('No contract specified for payment.');
      setLoading(false);
      return;
    }

    fetchAndValidateContract();
  }, [contractId]);

  const fetchAndValidateContract = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/contracts/${contractId}`);
      const contractData = response.data.data.contract;
      setContract(contractData);

      // Check if tasker has proper Stripe account setup
      const taskerStripeAccountId =
        contractData?.tasker?.stripeAccountId || contractData?.stripeAccountId;

      if (!taskerStripeAccountId) {
        setShowOnboardingModal(true);
        setLoading(false);
        return;
      }

      // Only validate the tasker if the current user is the provider
      // Check if the user is a provider for this contract
      const isProvider = user && contractData.provider?._id === user._id;
      if (isProvider) {
        // Additional backend check to verify account status and capabilities
        // Check if tasker's Stripe account is properly configured
        try {
          // Make a backend call to validate the tasker's Stripe account
          await apiClient.get(
            `/payments/contracts/${contractId}/validate-tasker`
          );
        } catch (validationError) {
          // Check for 403 - unauthorized access (likely tasker accessing as provider)
          if (validationError.response?.status === 403) {
            // If it's a 403 error, the user doesn't have permission to validate
            // This could be normal if a tasker is accessing the page
            console.log(
              "User doesn't have permission to validate tasker account"
            );
          }
          // Check for 400 - validation errors (tasker account not properly configured)
          else if (validationError.response?.status === 400) {
            // The account exists but is likely not properly configured
            // Show modal to indicate tasker needs to complete onboarding
            setShowOnboardingModal(true);
            setLoading(false);
            return;
          }
          // Also check for other indicators of onboarding issues regardless of status code
          const errorMsg =
            validationError.response?.data?.message || validationError.message;
          if (
            errorMsg &&
            (errorMsg.includes('onboarding') ||
              errorMsg.includes('capability') ||
              errorMsg.includes('Stripe account is not') ||
              errorMsg.includes('transfers') ||
              errorMsg.includes('not enabled'))
          ) {
            // Show modal for any onboarding-related error
            setShowOnboardingModal(true);
            setLoading(false);
            return;
          }

          // For other network or unexpected errors, still allow navigation but log the issue
          console.warn('Error validating tasker account:', validationError);
        }
      }
    } catch (err) {
      console.error('Error fetching contract:', err);
      setError('Failed to load contract details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async paymentResult => {
    try {
      // Confirm payment success with backend
      await apiClient.post('/payments/confirm-payment-success', {
        paymentIntentId: paymentResult.id,
        contractId: contract._id || contract.id,
      });

      showToast(
        'Payment completed successfully! Contract has been completed.',
        'success'
      );

      // Redirect to contracts page or show success message
      setTimeout(() => {
        navigate('/contracts');
      }, 2000);
    } catch (err) {
      console.error('Error confirming Stripe payment:', err);
      showToast(
        'Payment succeeded but there was an issue updating the contract. Please contact support.',
        'warning'
      );
    }
  };

  const handlePaymentError = error => {
    console.error('Stripe payment error:', error);
    showToast(`Payment failed: ${error.message || 'Unknown error'}`, 'error');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading payment details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.paymentCard}>
          <div className={styles.header}>
            <h1>Pay with Credit Card (Stripe)</h1>
            <button
              onClick={handleCancel}
              className={styles.closeButton}
              aria-label="Close"
            >
              ✖
            </button>
          </div>

          <div className={styles.contractDetails}>
            <h2>Contract Details</h2>
            <div className={styles.detailRow}>
              <span className={styles.label}>Task:</span>
              <span className={styles.value}>
                {contract?.title || contract?.gig?.title || 'N/A'}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Tasker:</span>
              <span className={styles.value}>
                {contract?.tasker?.firstName || ''}{' '}
                {contract?.tasker?.lastName || ''}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Service Amount:</span>
              <span className={styles.value}>
                ${contract?.agreedCost || contract?.rate || '0.00'}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Platform Fee:</span>
              <span className={styles.value}>
                Calculated at checkout
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Tax (HST/GST):</span>
              <span className={styles.value}>
                Calculated at checkout
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Total:</span>
              <span className={styles.value}>
                Calculated at checkout
              </span>
            </div>
          </div>

          <div className={styles.stripePaymentSection}>
            <StripePayment
              contract={contract}
              amount={parseFloat(contract?.agreedCost || contract?.rate || 0)}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>

      {showOnboardingModal && (
        <OnboardingNotCompletedModal
          isOpen={showOnboardingModal}
          onClose={() => {
            setShowOnboardingModal(false);
            // Navigate back to contracts page when modal is closed
            navigate('/contracts');
          }}
        />
      )}
    </>
  );
};

export default StripePaymentPage;
