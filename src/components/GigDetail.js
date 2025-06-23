// @ts-nocheck

import { Button } from '../components/ui/button';
// frontend/src/pages/GigDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import {
  useStripe,
  useElements,
  Elements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
// import "./GigDetails.css"; // Assuming you have a CSS file for styling
import styles from './GigDetail.module.css'; // Import CSS Modules
import { GigApplications } from './GigApplications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GigApplySection } from './GigApplySection';
import ReviewSection from './ReviewSection';
import PropTypes from 'prop-types';

const stripePromise = loadStripe(
  'pk_test_51RRrQ2Q5bv7DRpKKkdum0wirsfQWdEid1PgmxjDvnY63M7wCbbRiH9mgitk4wpj37RTmTkgC3xYHEQhJOF9hUvXS00Z6OvQMz4'
); // Replace with your Stripe publishable key

const ConfirmButton = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleConfirmPayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      clientSecret,
      elements,
      confirmParams: {
        return_url: window.location.href, // Redirect URL after confirmation
      },
    });

    if (error) {
      console.error('Payment confirmation error:', error.message);
    }
  };

  return (
    <div>
      <PaymentElement />
      <Button
        className={styles.confirmPaymentButton}
        onClick={handleConfirmPayment}
        disabled={!stripe || !elements}
      >
        Confirm Payment Intent
      </Button>
    </div>
  );
};

ConfirmButton.propTypes = {
  clientSecret: PropTypes.string.isRequired,
};

function GigDetailPage() {
  const { gigId } = useParams();
  const { user } = useAuth();
  const [gigData, setGigData] = useState(null);

  const [contractData, setContractData] = useState(null);
  const isContractCompleted = contractData?.status === 'completed';

  const [paymentData, setPaymentData] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [isReleasable, setIsReleasable] = useState(false); // New state for release eligibility
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isRefunding = paymentData?.status === 'refund_pending';
  const isPaymentDeposit = paymentIntent?.status === 'succeeded';
  const hasPayment = Boolean(paymentData);
  const isProvider = user?.role?.includes('provider');
  const isTasker = !isProvider;

  const queryClient = useQueryClient();

  const fetchReleasableStatus = async contractId => {
    try {
      const response = await apiClient.get(
        `/payments/contracts/${contractId}/releasable`
      );
      const { isBalanceSufficient } = response.data.data;
      setIsReleasable(isBalanceSufficient);
    } catch (err) {
      setIsReleasable(false);
    }
  };

  const fetchPaymentDetails = async contractId => {
    try {
      const response = await apiClient.get(
        `/payments/contracts/${contractId}/payment`
      );
      setPaymentData(response.data.data.payment);
      setPaymentIntent(response.data.data.paymentIntent);
      await fetchReleasableStatus(contractId); // Fetch releasable status after payment details
    } catch (err) {
      setPaymentData(null);
    }
  };

  const fetchData = useCallback(async () => {
    if (
      !gigId ||
      typeof gigId !== 'string' ||
      gigId.length !== 24 ||
      !/^[a-fA-F0-9]{24}$/.test(gigId)
    ) {
      setError(`Invalid Gig ID found in URL: '${gigId || 'None'}'.`);
      setLoading(false);
      setGigData(null); // Clear any potentially stale data
      setContractData(null);
      setPaymentData(null); // Clear payment data
      return; // Stop execution
    }

    setLoading(true);
    setError('');

    try {
      const gigResponse = await apiClient.get(`/gigs/${gigId}`);
      const currentGig = gigResponse.data.data.gig;
      setGigData(currentGig);

      try {
        const contractResponse = await apiClient.get(
          `/contracts?gigId=${gigId}`
        );
        const currentContract = contractResponse.data.data.contract;
        setContractData(currentContract);

        if (
          currentContract &&
          currentContract.provider?._id === user?._id &&
          currentGig?.assignedTo?._id
        ) {
          const reviewParams = { gigId, reviewer: user._id };
          const reviewResponse = await apiClient.get('/reviews', {
            params: reviewParams,
          });
          // (Optional) Handle review existence if needed
        }

        if (currentContract?._id) {
          await fetchPaymentDetails(currentContract._id); // Fetch payment details if contract exists
        }
      } catch (contractError) {
        if (
          contractError.response?.status === 404 ||
          contractError.response?.status === 403 ||
          (contractError.response?.data?.message &&
            contractError.response.data.message.includes('No contract found'))
        ) {
          setContractData(null);
        } else {
          setError('Error loading associated contract details.');
        }
        setContractData(null);
        setPaymentData(null); // Clear payment data if no contract
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load gig details.');
      setGigData(null);
      setContractData(null);
      setPaymentData(null); // Clear payment data
    } finally {
      setLoading(false);
    }
  }, [gigId, user]); // user dependency is for the review check logic

  useEffect(() => {
    // Ensure user object is available from context before fetching
    // as fetchData might depend on it (e.g., for checking existing reviews)
    if (user !== undefined) {
      // user can be null if not logged in, undefined if context still loading
      fetchData();
    }
  }, [fetchData, user]); // Re-run if fetchData or user changes

  // ... rest of GigDetailPage component (callbacks and return JSX) ...
  const handleAcceptSuccess = () => {
    fetchData();
  };
  const handlePaymentSuccess = () => {
    fetchData();
  };
  const hasSecret = paymentData?.stripePaymentIntentSecret;
  const options = {
    // clientSecret: paymentData?.stripePaymentIntentSecret, // your test secret
    clientSecret:
      'pi_3RVl7SQ5bv7DRpKK1Ct8ziGw_secret_vXLXyg0ERmsJWiZxgnvtNN5JZ',
    // Fully customizable with appearance API.
    appearance: {
      /*...*/
    },
  };

  // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in a previous step

  const cancelContractMutation = useMutation({
    mutationFn: async contractId => {
      await apiClient.delete(`/contracts/${contractId}`);
    },
    onSuccess: () => {
      fetchData(); // Refetch data to update the UI
    },
  });

  const acceptContractMutation = useMutation({
    mutationFn: contractId => apiClient.put(`/contracts/${contractId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries(['gig', gigData._id]);
    },
  });

  const releaseFundsMutation = useMutation({
    mutationFn: contractId => apiClient.put(`/contracts/${contractId}/release`),
    onSuccess: () => {
      queryClient.invalidateQueries(['gig', gigData._id]);
    },
  });

  const completeContractMutation = useMutation({
    mutationFn: contractId =>
      apiClient.put(`/contracts/${contractId}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries(['gig', gigData._id]);
    },
  });

  if (!gigData && !loading) {
    return <div>No gig found with ID: {gigId || 'None'}.</div>;
  }

  return (
    <div className={styles.gigDetailPageContainer}>
      {loading ? (
        <div className={styles.loadingMessage}>Loading gig details...</div>
      ) : error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : (
        <div className={styles.gigContent}>
          <div className={styles.gigDetailsSection}>
            {/* Gig Info */}
            <h1 className={styles.gigTitle}>{gigData.title}</h1>
            <p className={styles.gigDescription}>{gigData.description}</p>
            <p className={styles.gigLocation}>
              <strong>Location:</strong> {gigData.location}
            </p>
            <p className={styles.gigBudget}>
              <strong>Budget:</strong> $
              {typeof gigData.budget === 'number' && !isNaN(gigData.budget)
                ? gigData.budget.toFixed(2)
                : 'N/A'}
            </p>
            <p className={styles.gigCategory}>
              <strong>Category:</strong> {gigData.category}
            </p>

            {/* Payment Breakdown */}
            {paymentData && (
              <div className={styles.paymentBreakdown}>
                <h3 className={styles.paymentBreakdownTitle}>
                  Payment Breakdown
                </h3>
                <div className={styles.breakdownItem}>
                  <strong>Total:</strong> $
                  {((paymentData.amount || 0) / 100).toFixed(2)}
                </div>
                <div className={styles.breakdownItem}>
                  <strong>Tax (13%):</strong> $
                  {((paymentData.taxAmount || 0) / 100).toFixed(2)}
                </div>
                <div className={styles.breakdownItem}>
                  <strong>Platform Fee ($5 + 5%):</strong> $
                  {((paymentData.applicationFeeAmount || 0) / 100).toFixed(2)}
                </div>
                <div className={styles.breakdownItem}>
                  <strong>Payout to Tasker:</strong> $
                  {((paymentData.amountReceivedByPayee || 0) / 100).toFixed(2)}
                </div>
              </div>
            )}

            {/* ... other sections ... */}
            {hasPayment && isProvider && !isPaymentDeposit && (
              <div className={styles.paymentSection}>
                <h3 className={styles.paymentSectionTitle}>Payment Deposit</h3>
                <Elements stripe={stripePromise} options={options}>
                  <ConfirmButton clientSecret={paymentIntent?.client_secret} />
                </Elements>
              </div>
            )}

            {contractData &&
              contractData.status === 'pending' &&
              isTasker &&
              gigData?.assignedTo?._id === user?._id && (
                <div className={styles.sectionCard}>
                  <h3 className={styles.sectionTitle}>
                    Contract Pending Acceptance
                  </h3>
                  <p className={styles.sectionText}>
                    Awaiting your acceptance of the contract for this gig.
                  </p>
                  <button
                    onClick={() =>
                      acceptContractMutation.mutate(contractData._id)
                    }
                    disabled={acceptContractMutation.isLoading}
                    className={styles.primaryButton}
                  >
                    {acceptContractMutation.isLoading
                      ? 'Accepting...'
                      : 'Accept Contract'}
                  </button>
                  <button
                    onClick={() =>
                      cancelContractMutation.mutate(contractData._id)
                    }
                    disabled={cancelContractMutation.isLoading}
                    className={styles.secondaryButton}
                  >
                    {cancelContractMutation.isLoading
                      ? 'Cancelling...'
                      : 'Cancel Contract'}
                  </button>
                </div>
              )}

            {/* Release Funds Section */}
            {isProvider &&
              isContractCompleted &&
              paymentData?.status === 'succeeded' &&
              !paymentData?.releasedToTasker &&
              isReleasable && (
                <div className={styles.sectionCard}>
                  <h3 className={styles.sectionTitle}>
                    Release Funds to Tasker
                  </h3>
                  <p className={styles.sectionText}>
                    The gig is completed and funds are ready to be released to
                    the tasker.
                  </p>
                  <button
                    onClick={() =>
                      releaseFundsMutation.mutate(paymentData.contract)
                    }
                    disabled={releaseFundsMutation.isLoading}
                    className={styles.primaryButton}
                  >
                    {releaseFundsMutation.isLoading
                      ? 'Releasing...'
                      : 'Release Funds'}
                  </button>
                </div>
              )}

            {isProvider &&
              isContractCompleted &&
              paymentData?.releasedToTasker && (
                <div className={styles.infoCard}>
                  <p className={styles.infoText}>
                    Funds have been successfully released to the tasker.
                  </p>
                </div>
              )}

            {isProvider &&
              isContractCompleted &&
              paymentData?.status === 'succeeded' &&
              !paymentData?.releasedToTasker &&
              !isReleasable && (
                <div className={styles.warningCard}>
                  <p className={styles.warningText}>
                    Funds cannot be released yet. The tasker needs to connect
                    their Stripe account and verify their identity.
                  </p>
                </div>
              )}

            {isTasker &&
              isContractCompleted &&
              paymentData?.status === 'succeeded' &&
              !paymentData?.releasedToTasker && (
                <div className={styles.infoCard}>
                  <p className={styles.infoText}>
                    The gig is completed. Funds are awaiting release from the
                    provider.
                  </p>
                </div>
              )}

            {isRefunding && (
              <div className={styles.warningCard}>
                <p className={styles.warningText}>
                  This payment is currently being refunded. Status:{' '}
                  {paymentData.status}
                </p>
              </div>
            )}

            {/* Gig Application Section */}
            {!contractData && isTasker && gigData?.status === 'open' && (
              <GigApplySection gigId={gigId} onApplySuccess={fetchData} />
            )}

            {/* Tasker Applications (for Provider) */}
            {isProvider && !contractData && gigData?.status === 'open' && (
              <GigApplications gigId={gigId} onApplicationUpdate={fetchData} />
            )}

            {/* Contract Management for Provider */}
            {contractData && isProvider && !isContractCompleted && (
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Contract Management</h3>
                <p className={styles.sectionText}>
                  Current Status: {contractData.status}
                </p>
                {contractData.status === 'accepted' && (
                  <button
                    onClick={() =>
                      completeContractMutation.mutate(contractData._id)
                    }
                    disabled={completeContractMutation.isLoading}
                    className={styles.primaryButton}
                  >
                    {completeContractMutation.isLoading
                      ? 'Completing...'
                      : 'Mark Contract as Completed'}
                  </button>
                )}
                {contractData.status === 'accepted' && (
                  <button
                    onClick={() =>
                      cancelContractMutation.mutate(contractData._id)
                    }
                    disabled={cancelContractMutation.isLoading}
                    className={styles.secondaryButton}
                  >
                    {cancelContractMutation.isLoading
                      ? 'Cancelling...'
                      : 'Cancel Contract'}
                  </button>
                )}
              </div>
            )}

            {/* Review Section */}
            {contractData &&
              isContractCompleted &&
              (gigData?.provider?._id === user?._id ||
                gigData?.assignedTo?._id === user?._id) && (
                <ReviewSection
                  gigId={gigId}
                  contractId={contractData._id}
                  reviewerId={user._id}
                  reviewedUserId={
                    user._id === gigData.provider._id
                      ? gigData.assignedTo._id
                      : gigData.provider._id
                  }
                  onReviewSubmitted={fetchData}
                />
              )}
          </div>{' '}
          {/* End gigDetailsSection */}
        </div> /* End gigContent */
      )}
    </div>
  );
}

GigDetailPage.propTypes = {
  // No props to add PropTypes for, but ensure accessibility and remove unused imports if any.
};

export default GigDetailPage;
