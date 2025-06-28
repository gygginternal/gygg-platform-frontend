// import React from 'react';
import { useState, useEffect } from 'react';
// import { Button } from "../components/ui/button"; // Removed as we'll use a local button or convert it
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axiosConfig';
import styles from './GigApplySection.module.css'; // Import CSS module
import PropTypes from 'prop-types';

export function OfferCard({ offer, onAccept, onDecline }) {
  return (
    <div className={styles.offerCard}>
      <div className={styles.offerCardContent}>
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
  onAccept: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
};

export const GigApplySection = ({ gigId, onApplySuccess }) => {
  const [stripeStatus, setStripeStatus] = useState(null);
  const [loadingStripeStatus, setLoadingStripeStatus] = useState(true);

  useEffect(() => {
    const fetchStripeStatus = async () => {
      setLoadingStripeStatus(true);
      try {
        const response = await apiClient.get('/users/stripe/account-status');
        setStripeStatus(response.data);
      } catch {
        setStripeStatus(null);
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
  const isStripeIntegrted = !showOnboarding;

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
    enabled: !!gigId,
  });

  const {
    data: offerData,
    isLoading: isOfferLoading,
    isError: isOfferError,
  } = useQuery({
    queryKey: ['gigOffer', gigId],
    queryFn: async () => {
      const response = await apiClient.get(`/gigs/${gigId}/offer`);
      return response.data.data.offer;
    },
    enabled: !!gigId,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/gigs/${gigId}/apply`);
      return response.data;
    },
    onSuccess: () => {
      refetchApp();
      if (onApplySuccess) {
        onApplySuccess();
      }
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async applicationId => {
      await apiClient.patch(`/applications/${applicationId}/cancel`);
    },
    onSuccess: () => {
      refetchApp();
      if (onApplySuccess) {
        onApplySuccess();
      }
    },
  });

  const queryClient = useQueryClient();

  const handleAcceptOffer = async offerId => {
    await apiClient.patch(`/offers/${offerId}/accept`);
    queryClient.invalidateQueries(['gigOffers', gigId]);
    if (onApplySuccess) {
      onApplySuccess();
    }
  };

  const handleDeclineOffer = async offerId => {
    await apiClient.delete(`/offers/${offerId}`);
    queryClient.invalidateQueries(['gigOffers', gigId]);
  };

  if (isApplicationLoading || loadingStripeStatus || isOfferLoading) {
    return <p>Loading...</p>;
  }

  if (isError || isOfferError) {
    return <p>Error loading application or offer status.</p>;
  }

  return (
    <div>
      {offerData ? (
        <div>
          <h1>Gig Offer</h1>
          <OfferCard
            offer={offerData}
            onAccept={handleAcceptOffer}
            onDecline={handleDeclineOffer}
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
          {application && application.applicationStatus === 'pending' && (
            <button
              className={`${styles.cancelButton} ${styles.button}`}
              onClick={() => cancelMutation.mutate(application._id)}
              disabled={cancelMutation.isLoading}
            >
              {cancelMutation.isLoading
                ? 'Cancelling...'
                : 'Cancel Application'}
            </button>
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
