import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // To get userId if needed by backend
// import { Button } from "../components/ui/button"; // Removed as we'll use a local button or convert it
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axiosConfig';
import styles from './GigApplySection.module.css'; // Import CSS module
import PropTypes from 'prop-types';

export function OfferCard({
  offer,
  onDelete,
  onAccept,
  onDecline,
  isProvider,
}) {
  const provider = offer.provider || {}; // Assuming offer has a provider object

  return (
    <div className={styles.offerCard}>
      <div className={styles.offerCardContent}>
        {' '}
        <>
          <button
            className={`${styles.acceptButton} ${styles.button}`}
            onClick={() => onAccept(offer._id)}
          >
            Accept Offer
          </button>
          <button
            className={`${styles.declineButton} ${styles.button}`}
            onClick={() => onDecline(offer._id)}
          >
            Decline Offer
          </button>
        </>
      </div>
    </div>
  );
}

OfferCard.propTypes = {
  offer: PropTypes.object.isRequired,
  onDelete: PropTypes.func,
  onAccept: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
  isProvider: PropTypes.bool,
};

export const GigApplySection = ({ gigId, onApplySuccess }) => {
  const { user } = useAuth(); // Get user if backend needs userId for non /me/album routes
  const [stripeStatus, setStripeStatus] = useState(null); // State for Stripe account status
  const [loadingStripeStatus, setLoadingStripeStatus] = useState(true); // Loading state for Stripe status

  // Fetch Stripe account status
  useEffect(() => {
    const fetchStripeStatus = async () => {
      setLoadingStripeStatus(true);
      try {
        const response = await apiClient.get('/users/stripe/account-status');
        setStripeStatus(response.data);
      } catch (err) {
        setStripeStatus(null); // Reset to null on error
      } finally {
        setLoadingStripeStatus(false);
      }
    };

    fetchStripeStatus();
  }, []);

  const showOnboarding =
    !stripeStatus ||
    !stripeStatus.detailsSubmitted ||
    !stripeStatus.payoutsEnabled;

  const isStripeIntegrted = !showOnboarding; // Stripe is integrated if onboarding is not required

  // Fetch the current user's application for the gig
  const {
    data: application,
    isLoading: isApplicationLoading,
    isError,
    refetch: refetchApp,
  } = useQuery({
    queryKey: ['myApplication', gigId],
    queryFn: async () => {
      const response = await apiClient.get(`/gigs/${gigId}/my-application`);
      return response.data.data;
    },
    enabled: !!gigId, // Only fetch if gigId is available
  });

  // Fetch the offer for the gig
  const {
    data: offerData,
    isLoading: isOfferLoading,
    isError: isOfferError,
    error: offerError,
  } = useQuery({
    queryKey: ['gigOffer', gigId],
    queryFn: async () => {
      const response = await apiClient.get(`/gigs/${gigId}/offer`);
      return response.data.data.offer; // Return the single offer
    },
    enabled: !!gigId, // Only fetch if gigId is available
  });

  // Mutation for applying to the gig
  const applyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/gigs/${gigId}/apply`);
      return response.data;
    },
    onSuccess: data => {
      refetchApp();
      if (onApplySuccess) {
        onApplySuccess(); // Notify parent component to refresh data
      }
    },
    onError: err => {},
  });

  // Mutation for canceling the application
  const cancelMutation = useMutation({
    mutationFn: async applicationId => {
      await apiClient.patch(`/applications/${applicationId}/cancel`);
    },
    onSuccess: () => {
      refetchApp();
      if (onApplySuccess) {
        onApplySuccess(); // Notify parent component to refresh data
      }
    },
    onError: err => {},
  });

  const handleAcceptOffer = async offerId => {
    await apiClient.patch(`/offers/${offerId}/accept`);
    queryClient.invalidateQueries(['gigOffers', gigId]); // Refresh offers
    if (onApplySuccess) {
      onApplySuccess(); // Notify parent component to refresh data
    }
  };

  const queryClient = useQueryClient(); // React Query client for invalidating queries

  const handleDeclineOffer = async offerId => {
    await apiClient.delete(`/offers/${offerId}`);
    queryClient.invalidateQueries(['gigOffers', gigId]); // Refresh offers
  };

  if (isApplicationLoading || loadingStripeStatus || isOfferLoading) {
    return <p>Loading...</p>;
  }

  if (isError || isOfferError) {
    return <p>Error loading application or offer status.</p>;
  }

  const isProvider = user?.role === 'provider'; // Determine if the user is a provider

  return (
    <div>
      {offerData ? (
        <div>
          <h1>Gig Offer</h1>
          <OfferCard
            offer={offerData}
            onAccept={handleAcceptOffer}
            onDecline={handleDeclineOffer}
            isProvider={isProvider} // Dynamically determine if the user is the provider
          />
        </div>
      ) : (
        <div>
          {!isStripeIntegrted && (
            <p className={styles.stripeStatusMessage}>
              You need to set up your Stripe account to apply for gigs.{' '}
              <a
                className={styles.stripeSetupLink}
                href="/settings?tab=withdraw"
              >
                Set up Stripe
              </a>
            </p>
          )}
          {application?.applicationStatus === 'rejected' && (
            <div className={styles.applicationRejectedMessage}>
              Your application was rejected.
            </div>
          )}

          {(!application || application.applicationStatus === 'cancelled') &&
            isStripeIntegrted && (
              <button
                className={`${styles.applyButton} ${styles.button}`}
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isLoading}
              >
                {applyMutation.isLoading ? 'Applying...' : 'Apply'}
              </button>
            )}

          {application?.applicationStatus === 'pending' && (
            <div>
              <button
                className={`${styles.cancelButton} ${styles.button}`}
                onClick={() => cancelMutation.mutate(application.id)}
                disabled={cancelMutation.isLoading}
              >
                {cancelMutation.isLoading
                  ? 'Canceling...'
                  : 'Cancel Application'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

GigApplySection.propTypes = {
  gigId: PropTypes.string.isRequired,
  onApplySuccess: PropTypes.func,
};
