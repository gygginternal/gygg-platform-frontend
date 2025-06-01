// @ts-nocheck
// frontend/src/pages/GigDetailPage.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import {
  useStripe,
  useElements,
  Elements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import "./GigDetails.css"; // Assuming you have a CSS file for styling
import { GigApplications } from "./GigApplications";
import { useMutation } from "@tanstack/react-query";
import { GigApplySection } from "./GigApplySection";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY); // Replace with your Stripe publishable key

const ConfirmButton = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleConfirmPayment = async () => {
    if (!stripe || !elements) {
      console.error("Stripe.js has not loaded yet.");
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
      console.error("Payment confirmation error:", error.message);
    } else {
      console.log("Payment confirmed successfully.");
    }
  };

  return (
    <div>
      <button onClick={handleConfirmPayment} disabled={!stripe || !elements}>
        Confirm Payment Intent
      </button>
      <PaymentElement />
    </div>
  );
};

function GigDetailPage() {
  const { gigId } = useParams();
  const { user } = useAuth();
  const [gigData, setGigData] = useState(null);

  const [contractData, setContractData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [isReleasable, setIsReleasable] = useState(false); // New state for release eligibility
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isRefunding = paymentData?.status === "refund_pending";
  const isPaymentPending = paymentData?.status === "pending";
  const isPaymentCanceling = paymentData?.status === "canceling";
  const isPaymentSucceeded = paymentData?.status === "succeeded";
  const isPaymentCanceled = paymentData?.status === "canceled";
  const isPaymentConfirming =
    paymentIntent && paymentIntent.status !== "succeeded";
  const hasPayment = Boolean(paymentData);

  const fetchReleasableStatus = async (contractId) => {
    try {
      const response = await apiClient.get(
        `/payments/contracts/${contractId}/releasable`
      );
      const { isBalanceSufficient } = response.data.data;
      setIsReleasable(isBalanceSufficient);
    } catch (err) {
      console.error(
        "Error fetching releasable status:",
        err.response?.data || err.message
      );
      setIsReleasable(false);
    }
  };

  const fetchPaymentDetails = async (contractId) => {
    try {
      const response = await apiClient.get(
        `/payments/contracts/${contractId}/payment`
      );
      setPaymentData(response.data.data.payment);
      setPaymentIntent(response.data.data.paymentIntent);
      await fetchReleasableStatus(contractId); // Fetch releasable status after payment details
    } catch (err) {
      console.error(
        "Error fetching payment details:",
        err.response?.data || err.message
      );
      setPaymentData(null);
    }
  };

  const fetchData = useCallback(async () => {
    console.log("GigDetailPage - Attempting fetch with gigId:", gigId);

    // CHECK: Ensure gigId exists and looks like a valid ObjectId before proceeding
    if (
      !gigId ||
      typeof gigId !== "string" ||
      gigId.length !== 24 ||
      !/^[a-fA-F0-9]{24}$/.test(gigId)
    ) {
      console.error(
        "GigDetailPage: Invalid Gig ID detected. Aborting fetch.",
        gigId
      );
      setError(`Invalid Gig ID found in URL: '${gigId || "None"}'.`);
      setLoading(false);
      setGigData(null); // Clear any potentially stale data
      setContractData(null);
      setPaymentData(null); // Clear payment data
      return; // Stop execution
    }

    setLoading(true);
    setError("");

    try {
      // ... rest of your try/catch block for fetching gig, contract, and review data ...
      // (This part remains the same as the previous correct version)
      const gigResponse = await apiClient.get(`/gigs/${gigId}`);
      const currentGig = gigResponse.data.data.gig;
      setGigData(currentGig);
      console.log("Gig Data Fetched:", currentGig);

      try {
        const contractResponse = await apiClient.get(
          `/contracts?gigId=${gigId}`
        );
        const currentContract = contractResponse.data.data.contract;
        setContractData(currentContract);
        console.log("Contract Data Fetched:", currentContract);

        if (
          currentContract &&
          currentContract.provider?._id === user?._id &&
          currentGig?.assignedTo?._id
        ) {
          const reviewParams = { gigId: gigId, reviewer: user._id };
          const reviewResponse = await apiClient.get("/reviews", {
            params: reviewParams,
          });
          if (reviewResponse.data.results > 0) {
          }
        }

        if (currentContract?._id) {
          await fetchPaymentDetails(currentContract._id); // Fetch payment details if contract exists
        }
      } catch (contractError) {
        if (
          contractError.response?.status === 404 ||
          contractError.response?.status === 403 ||
          (contractError.response?.data?.message &&
            contractError.response.data.message.includes("No contract found"))
        ) {
          console.log(
            "No accessible contract found for this gig, or query failed."
          );
          setContractData(null);
        } else {
          console.error(
            "Error fetching contract:",
            contractError.response?.data || contractError.message
          );
          setError("Error loading associated contract details.");
        }
        setContractData(null);
        setPaymentData(null); // Clear payment data if no contract
      }
    } catch (err) {
      console.error(
        "Error fetching gig details:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.message || "Failed to load gig details.");
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
    console.log("Gig accepted, refreshing data...");
    fetchData();
  };
  const handlePaymentInitiated = () => {
    console.log("Payment initiated by user.");
  };
  const handlePaymentSuccess = () => {
    console.log("Payment successful, refreshing data...");
    fetchData();
  };
  const handleReviewSuccess = () => {
    console.log("Review submitted, refreshing data...");
    fetchData();
  };
  const options = {
    clientSecret: paymentData?.stripePaymentIntentSecret, // your test secret
    // Fully customizable with appearance API.
    appearance: {
      /*...*/
    },
  };

  // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in a previous step

  const cancelContractMutation = useMutation({
    mutationFn: async (contractId) => {
      await apiClient.delete(`/contracts/${contractId}`);
    },
    onSuccess: () => {
      console.log("Contract canceled successfully.");
      fetchData(); // Refetch data to update the UI
    },
    onError: (err) => {
      console.error(
        "Error canceling contract:",
        err.response?.data || err.message
      );
    },
  });

  if (!gigData && !loading) {
    return (
      <div className="ml-[200px]">No gig found with ID: {gigId || "None"}.</div>
    );
  }

  return (
    <div className="ml-[200px]">
      {!contractData && user?.role?.includes("provider") && (
        <GigApplications onOffer={fetchData} onReject={fetchData} />
      )}
      {isRefunding && (
        <div className="alert alert-warning">
          Gig is being canceled. Provider, Please wait for the refund process.
        </div>
      )}
      {isPaymentCanceled && <div>Contract canceled</div>}
      {isPaymentSucceeded && <div>Gig Payment Released</div>}
      {isPaymentPending && <div>Gig Payment Releasing</div>}
      {isPaymentCanceling && <div>Gig Payment Canceling</div>}
      {!isRefunding && !isPaymentSucceeded && (
        <div>
          {user?.role?.includes("tasker") && !contractData && (
            <GigApplySection gigId={gigId} onApplySuccess={fetchData} />
          )}

          {contractData && (
            <div>
              <h2>Contract Details</h2>
              <p>Job applied. Try deposit, release, or refund.</p>
              {paymentData ? (
                <div>
                  <h3>Payment Details</h3>
                  <p>Status: {paymentData.status}</p>
                  <p>Amount: ${paymentData.amount / 100}</p>
                  <p>Currency: {paymentData.currency.toUpperCase()}</p>
                </div>
              ) : (
                <p>No payment details available.</p>
              )}
            </div>
          )}

          {user?.role?.includes("provider") && contractData && !paymentData && (
            <div>
              <h1>Provider</h1>

              <button
                onClick={() => {
                  cancelContractMutation.mutate(contractData._id);
                }}
                disabled={cancelContractMutation.isLoading}
              >
                {cancelContractMutation.isLoading
                  ? "Canceling..."
                  : "Cancel Contract"}
              </button>

              {!paymentData && (
                <button
                  onClick={() => {
                    apiClient
                      .post(
                        `/payments/contracts/${contractData._id}/create-payment-intent`
                      )
                      .then((response) => {
                        console.log("Payment intent created:", response.data);
                        handleAcceptSuccess();
                      })
                      .catch((error) => {
                        console.error("Error creating payment intent:", error);
                      });
                  }}
                >
                  Deposit
                </button>
              )}
              {isPaymentConfirming && (
                <Elements stripe={stripePromise} options={options}>
                  <ConfirmButton clientSecret={paymentData?.clientSecret} />
                </Elements>
              )}
              {!isPaymentConfirming &&
                !isPaymentPending &&
                !isPaymentCanceling &&
                !isPaymentCanceled &&
                hasPayment && (
                  <button
                    onClick={() => {
                      apiClient
                        .post(`/payments/contracts/${contractData._id}/release`)
                        .then((response) => {
                          console.log("Funds released:", response.data);
                          handlePaymentSuccess();
                        })
                        .catch((error) => {
                          console.error("Error releasing funds:", error);
                        });
                    }}
                    disabled={!isReleasable} // Disable button if not releasable
                  >
                    Release Funds
                  </button>
                )}

              {!isPaymentConfirming &&
                !isPaymentPending &&
                !isPaymentCanceling &&
                !isPaymentCanceled &&
                hasPayment && (
                  <button
                    onClick={() => {
                      apiClient
                        .post(`/payments/contracts/${contractData._id}/refund`)
                        .then((response) => {
                          console.log("Funds refunded:", response.data);
                          handlePaymentSuccess();
                        })
                        .catch((error) => {
                          console.error("Error refunding funds:", error);
                        });
                    }}
                  >
                    Refund
                  </button>
                )}
            </div>
          )}
        </div>
      )}
      {!loading && (
        <button onClick={fetchData} style={{ marginTop: "15px" }}>
          Refresh Details
        </button>
      )}
    </div>
  );
}
export default GigDetailPage;
