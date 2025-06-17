import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // To get userId if needed by backend
// import { Button } from "../components/ui/button"; // Removed as we'll use a local button or convert it
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/axiosConfig";
import styles from "./GigApplySection.module.css"; // Import CSS module

export function OfferCard({
  offer,
  onDelete,
  onAccept,
  onDecline,
  isProvider,
}) {
  const provider = offer.provider || {}; // Assuming offer has a provider object
  console.log({ provider });

  return (
    <div className={styles.offerCard}>
      <div className={styles.offerCardContent}>
        {" "}
        <>
          <button className={`${styles.acceptButton} ${styles.button}`} onClick={() => onAccept(offer._id)}>
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

export const GigApplySection = ({ gigId, onApplySuccess }) => {
  const { user } = useAuth(); // Get user if backend needs userId for non /me/album routes
  const [stripeStatus, setStripeStatus] = useState(null); // State for Stripe account status
  const [loadingStripeStatus, setLoadingStripeStatus] = useState(true); // Loading state for Stripe status

  // Fetch Stripe account status
  useEffect(() => {
    const fetchStripeStatus = async () => {
      setLoadingStripeStatus(true);
      try {
        const response = await apiClient.get("/users/stripe/account-status");
        setStripeStatus(response.data);
      } catch (err) {
        console.error(
          "Error fetching Stripe account status:",
          err.response?.data || err.message
        );
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
    queryKey: ["myApplication", gigId],
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
    queryKey: ["gigOffer", gigId],
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
    onSuccess: (data) => {
      console.log("Gig applied successfully:", data);
      refetchApp();
      if (onApplySuccess) {
        onApplySuccess(); // Notify parent component to refresh data
      }
    },
    onError: (err) => {
      console.error(
        "Error applying to gig:",
        err.response?.data || err.message
      );
    },
  });

  // Mutation for canceling the application
  const cancelMutation = useMutation({
    mutationFn: async (applicationId) => {
      await apiClient.patch(`/applications/${applicationId}/cancel`);
    },
    onSuccess: () => {
      console.log("Application canceled successfully.");
      refetchApp();
      if (onApplySuccess) {
        onApplySuccess(); // Notify parent component to refresh data
      }
    },
    onError: (err) => {
      console.error(
        "Error canceling application:",
        err.response?.data || err.message
      );
    },
  });

  const handleAcceptOffer = async (offerId) => {
    await apiClient.patch(`/offers/${offerId}/accept`);
    queryClient.invalidateQueries(["gigOffers", gigId]); // Refresh offers
    if (onApplySuccess) {
      onApplySuccess(); // Notify parent component to refresh data
    }
    console.log("Offer accepted successfully.");
  };

  const queryClient = useQueryClient(); // React Query client for invalidating queries

  const handleDeclineOffer = async (offerId) => {
    await apiClient.delete(`/offers/${offerId}`);
    queryClient.invalidateQueries(["gigOffers", gigId]); // Refresh offers
    console.log("Offer declined successfully.");
  };

  if (isApplicationLoading || loadingStripeStatus || isOfferLoading) {
    return <p>Loading...</p>;
  }

  if (isError || isOfferError) {
    return <p>Error loading application or offer status.</p>;
  }

  const isProvider = user?.role === "provider"; // Determine if the user is a provider

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
              You need to set up your Stripe account to apply for gigs.{" "}
              <a className={styles.stripeSetupLink} href="/settings?tab=withdraw">
                Set up Stripe
              </a>
            </p>
          )}
          {application?.applicationStatus === "rejected" && (
            <div className={styles.applicationRejectedMessage}>Your application was rejected.</div>
          )}

          {(!application || application.applicationStatus === "cancelled") &&
            isStripeIntegrted && (
              <button
                className={`${styles.applyButton} ${styles.button}`}
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isLoading}
              >
                {applyMutation.isLoading ? "Applying..." : "Apply"}
              </button>
            )}

          {application?.applicationStatus === "pending" && (
            <div>
              <button
                className={`${styles.cancelButton} ${styles.button}`}
                onClick={() => cancelMutation.mutate(application.id)}
                disabled={cancelMutation.isLoading}
              >
                {cancelMutation.isLoading
                  ? "Canceling..."
                  : "Cancel Application"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
