import { MapPin, User, ArrowLeft } from 'lucide-react';
import { Card } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns'; // Import date-fns for formatting dates
import styles from './ContractDetailsPage.module.css'; // Import CSS Modules
import ContractPayment from '../../components/features/ContractDetailsPage/ContractPayment';
import apiClient from '../../api/axiosConfig';
import { useMutation } from '@tanstack/react-query';
import OnboardingNotCompletedModal from '../../components/common/OnboardingNotCompletedModal';
import { useState } from 'react';

export default function ContractDetailsPage({ gig, contract, user, children }) {
  const navigate = useNavigate();

  // State for onboarding not completed modal
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // All React hooks must be at the top level, before any conditional returns
  // Mutation for approving contract completion
  const approveMutation = useMutation({
    mutationFn: contractId => {
      return apiClient.post(`/contracts/${contractId}/approve`);
    },
    onSuccess: () => {
      // Optionally refresh the page or update state
      window.location.reload();
    },
    onError: error => {
      console.error('Error approving contract:', error);
      alert('Failed to approve contract. Please try again.');
    },
  });

  // Mutation for requesting revision
  const requestRevisionMutation = useMutation({
    mutationFn: ({ contractId, reason }) => {
      return apiClient.post(`/contracts/${contractId}/request-revision`, {
        reason,
      });
    },
    onSuccess: () => {
      // Optionally refresh the page or update state
      window.location.reload();
    },
    onError: error => {
      console.error('Error requesting revision:', error);
      alert('Failed to request revision. Please try again.');
    },
  });

  // Mutation for accepting contract
  const acceptMutation = useMutation({
    mutationFn: contractId => {
      return apiClient.post(`/contracts/${contractId}/accept`);
    },
    onSuccess: () => {
      // Optionally refresh the page or update state
      window.location.reload();
    },
    onError: error => {
      console.error('Error accepting contract:', error);
      alert('Failed to accept contract. Please try again.');
    },
  });

  // Mutation for submitting contract completion
  const submitMutation = useMutation({
    mutationFn: contractId => {
      return apiClient.post(`/contracts/${contractId}/submit`);
    },
    onSuccess: () => {
      // Optionally refresh the page or update state
      window.location.reload();
    },
    onError: error => {
      console.error('Error submitting contract:', error);
      alert('Failed to submit contract. Please try again.');
    },
  });

  // Early return must come after all hooks are defined
  if (!gig) return null;
  const formattedDate = gig.createdAt
    ? format(new Date(gig.createdAt), 'MM-dd-yyyy')
    : 'N/A';
  // Assume contractId and user role are available
  const contractId = contract?.id || gig.contractId || gig.id;
  const isProvider = user?.role?.includes('provider');

  // Get contract status from the contract prop or default to 'Active'
  const contractStatus = contract?.status || gig.status || 'Active';
  const isSubmitted = contractStatus.toLowerCase() === 'submitted';
  const isPending = ['pending', 'pending acceptance'].includes(
    contractStatus.toLowerCase()
  );
  const isActive = ['active', 'accepted', 'pending payment'].includes(
    contractStatus.toLowerCase()
  );
  const isCompleted = contractStatus.toLowerCase() === 'completed';
  const isPendingPayment = contractStatus.toLowerCase() === 'pending payment';
  const isCancelled = contractStatus.toLowerCase() === 'cancelled';

  // Determine user role more comprehensively
  const isTasker = user?.role?.includes('tasker');

  // Function to check if tasker has completed onboarding before payment
  const checkTaskerOnboardingAndNavigateToPayment = async () => {
    try {
      // Fetch contract details to check tasker's onboarding status
      const response = await apiClient.get(`/contracts/${contractId}`);
      const contractData = response.data.data.contract;

      // Check if tasker has proper Stripe account setup
      const taskerStripeAccountId =
        contractData?.tasker?.stripeAccountId || contractData?.stripeAccountId;

      if (!taskerStripeAccountId) {
        // Show modal if tasker has not completed onboarding
        setShowOnboardingModal(true);
        return;
      }

      // Additional backend check to verify account status and capabilities
      // Check if tasker's Stripe account is properly configured
      try {
        // Make a backend call to validate the tasker's Stripe account
        // This is a simple validation to see if we can retrieve account details
        await apiClient.get(
          `/payments/contracts/${contractId}/validate-tasker`
        );
      } catch (validationError) {
        // Check for any validation error that indicates onboarding issues
        if (validationError.response?.status === 400) {
          // The account exists but is likely not properly configured
          // Show modal to indicate tasker needs to complete onboarding
          setShowOnboardingModal(true);
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
          return;
        }

        // For other network or unexpected errors, still allow navigation but log the issue
        console.warn('Error validating tasker account:', validationError);
      }

      // Navigate to payment summary page if onboarding is complete
      navigate(`/contracts/${contractId}/pay-summary`);
    } catch (error) {
      console.error('Error checking tasker onboarding status:', error);
      alert('Failed to check tasker onboarding status. Please try again.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Link
        className={styles.backButton}
        to={{
          pathname: '/contracts',
        }}
      >
        <ArrowLeft className={styles.backButtonIcon} />
        Back to contract list
      </Link>
      <Card className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderContent}>
            <h1 className={styles.gigTitle}>{gig.title}</h1>
          </div>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.detailRow}>
            <div className={styles.detailItem}>
              <User className={styles.detailIcon} />
              <span className={styles.detailLabel}>Hired by</span>
              <span className={styles.providerName}>
                {[gig.postedBy?.firstName, gig.postedBy?.lastName]
                  .filter(Boolean)
                  .join(' ')}
              </span>
            </div>
          </div>

          <div className={styles.gigDescription}>
            <em>{gig.title}</em>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Started</span>
              <span className={styles.infoValue}>{formattedDate}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Fee</span>
              <span className={styles.feeValue}>${gig.cost}</span>
            </div>
          </div>

          {contractId && (
            <ContractPayment contractId={contractId} isProvider={isProvider} />
          )}

          {/* Buttons for different contract statuses */}
          {!isCancelled && (
            <div className={styles.contractActions}>
              {/* Buttons for Submitted contract status - only show for providers */}
              {isProvider && isSubmitted && (
                <div className={styles.statusActions}>
                  <button
                    className={styles.primaryBtn}
                    onClick={() => approveMutation.mutate(contractId)}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending
                      ? 'Approving...'
                      : 'Approve Completion'}
                  </button>
                  <button
                    className={styles.secondaryBtn}
                    onClick={() =>
                      requestRevisionMutation.mutate({
                        contractId,
                        reason: 'Work needs revision',
                      })
                    }
                    disabled={requestRevisionMutation.isPending}
                  >
                    {requestRevisionMutation.isPending
                      ? 'Requesting...'
                      : 'Request Revision'}
                  </button>
                </div>
              )}

              {/* Buttons for Pending Payment status - Pay Tasker button for providers */}
              {isProvider && isPendingPayment && (
                <div className={styles.statusActions}>
                  <button
                    className={styles.primaryBtn}
                    onClick={checkTaskerOnboardingAndNavigateToPayment}
                  >
                    Pay Tasker
                  </button>
                </div>
              )}

              {/* Buttons for Pending contract status - Accept Contract button for providers and taskers */}
              {isPending && (
                <div className={styles.statusActions}>
                  <button
                    className={styles.primaryBtn}
                    onClick={() => acceptMutation.mutate(contractId)}
                    disabled={acceptMutation.isPending}
                  >
                    {acceptMutation.isPending
                      ? 'Accepting...'
                      : 'Accept Contract'}
                  </button>
                </div>
              )}

              {/* Buttons for Active/Accepted/Pending Payment status - Submit as Complete for taskers */}
              {isTasker && isActive && (
                <div className={styles.statusActions}>
                  <button
                    className={styles.primaryBtn}
                    onClick={() => submitMutation.mutate(contractId)}
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending
                      ? 'Submitting...'
                      : 'Submit as Complete'}
                  </button>
                </div>
              )}

              {/* Buttons for Completed contracts - Rate Tasker button for providers */}
              {isProvider && isCompleted && (
                <div className={styles.statusActions}>
                  <button
                    className={styles.primaryBtn}
                    onClick={() => {
                      // Navigate to the rate tasker page
                      window.location.href = `/contracts/${contractId}/rate-tasker`;
                    }}
                  >
                    Rate Tasker
                  </button>
                </div>
              )}
            </div>
          )}

          {children}
        </div>
      </Card>

      <OnboardingNotCompletedModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
      />
    </div>
  );
}
