// @ts-nocheck

import { Button } from "../components/ui/button";
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

const stripePromise = loadStripe(
  "pk_test_51RRrQ2Q5bv7DRpKKkdum0wirsfQWdEid1PgmxjDvnY63M7wCbbRiH9mgitk4wpj37RTmTkgC3xYHEQhJOF9hUvXS00Z6OvQMz4"
); // Replace with your Stripe publishable key

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
      <PaymentElement />
      <Button
        className="mt-5 w-full bg-primary-500 hover:bg-primary-600 text-white"
        onClick={handleConfirmPayment}
        disabled={!stripe || !elements}
      >
        Confirm Payment Intent
      </Button>
    </div>
  );
};

function GigDetailPage() {
  const { gigId } = useParams();
  const { user } = useAuth();
  const [gigData, setGigData] = useState(null);

  const [contractData, setContractData] = useState(null);
  const isContractCompleted = contractData?.status === "completed";

  const [paymentData, setPaymentData] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [isReleasable, setIsReleasable] = useState(false); // New state for release eligibility
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isRefunding = paymentData?.status === "refund_pending";
  const isPaymentDeposit = paymentIntent?.status === "succeeded";
  const hasPayment = Boolean(paymentData);
  const isProvider = user?.role?.includes("provider");
  const isTasker = !isProvider;

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
  const handlePaymentSuccess = () => {
    console.log("Payment successful, refreshing data...");
    fetchData();
  };
  const hasSecret = paymentData?.stripePaymentIntentSecret;
  const options = {
    // clientSecret: paymentData?.stripePaymentIntentSecret, // your test secret
    clientSecret:
      "pi_3RVl7SQ5bv7DRpKK1Ct8ziGw_secret_vXLXyg0ERmsJWiZxgnvtNN5JZ",
    // Fully customizable with appearance API.
    appearance: {
      /*...*/
    },
  };
  console.log({
    hasSecret,
    options,
    stripePromise,
  });

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
    return <div>No gig found with ID: {gigId || "None"}.</div>;
  }

  return (
    <div>
      {!contractData && user?.role?.includes("provider") && (
        <GigApplications onOffer={fetchData} onReject={fetchData} />
      )}
      {isRefunding && (
        <div className="alert alert-warning">
          Gig is being canceled. Provider, Please wait for the refund process.
        </div>
      )}
      {/* {isPaymentCanceled && <div>Contract canceled</div>}
      {isPaymentDeposit && <div>Gig Payment Released</div>}
      {isPaymentPending && <div>Gig Payment Releasing</div>}
      {isPaymentCanceling && <div>Gig Payment Canceling</div>} */}

      {hasPayment &&
        isPaymentDeposit &&
        isProvider &&
        !isRefunding &&
        !isContractCompleted && (
          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
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
              // disabled={!isReleasable} // Disable button if not releasable
            >
              Release Funds
            </Button>

            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
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
            </Button>
          </div>
        )}

      {isTasker && !contractData && (
        <GigApplySection gigId={gigId} onApplySuccess={fetchData} />
      )}

      {!isRefunding && !isPaymentDeposit && !isContractCompleted && (
        <div>
          {isProvider && contractData && !paymentData && (
            <div className="flex gap-3 pt-4">
              {!paymentData && (
                <Button
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
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
                </Button>
              )}

              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                onClick={() => {
                  cancelContractMutation.mutate(contractData._id);
                }}
                disabled={cancelContractMutation.isLoading}
              >
                {cancelContractMutation.isLoading
                  ? "Canceling..."
                  : "End Contract"}
              </Button>
            </div>
          )}

          {isProvider && contractData && (
            <Elements stripe={stripePromise} options={options}>
              <ConfirmButton clientSecret={paymentData?.clientSecret} />
            </Elements>
          )}
        </div>
      )}
      {!loading && (
        <Button
          className="w-full"
          onClick={fetchData}
          style={{ marginTop: "15px" }}
        >
          Refresh Details
        </Button>
      )}
    </div>
  );
}
export default GigDetailPage;
