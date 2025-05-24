// src/components/ProfilePage/AboutSection.js
import apiClient from "../api/axiosConfig"; // Adjust path
import React, { useState, useEffect } from "react";
import styles from "./AboutSection.module.css"; // Create this CSS module

export function StripeOnboarding() {
  // Initialize status as potentially null, and add a specific 'notFound' state
  const [status, setStatus] = useState(null); // null = unknown, object = found, false = confirmed not found
  const [loading, setLoading] = useState(true); // Start loading immediately on mount

  const fetchStatus = async () => {
    setLoading(true);
    setStatus(null); // Reset status while fetching
    try {
      console.log("StripeOnboarding: Fetching account status...");
      const response = await apiClient.get("/users/stripe/account-status");
      console.log({ response });

      // Check if backend might return null data even on success
      if (response.data) {
        setStatus(response.data);
        console.log("StripeOnboarding: Status received:", response.data.data);
      } else {
        // Explicitly set status to indicate account not found after successful check
        setStatus(false); // Use 'false' to differentiate from initial 'null' state
        console.log(
          "StripeOnboarding: Account status check returned no account ID."
        );
      }
    } catch (err) {
      console.error(
        "StripeOnboarding: Error fetching status:",
        err.response?.data || err.message
      );
      // If backend returns 400/404 specifically because account doesn't exist
      if (err.response?.status === 404 || err.response?.status === 400) {
        setStatus(false); // Explicitly set status to indicate account not found
        console.log("StripeOnboarding: Backend confirmed no account found.");
      } else {
        setStatus(null); // Reset to unknown on other errors
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const showOnboarding =
    !status || !status.detailsSubmitted || !status.payoutsEnabled;

  return (
    <section>
      {loading && <p>Loading...</p>}

      {!showOnboarding ? (
        <span style={{ color: "green", fontWeight: "bold" }}>
          ✓ Connected & Active
          <br />
          <small>Your Stripe account setup is completed.</small>
        </span>
      ) : (
        <div>
          <span style={{ color: "orange", fontWeight: "bold" }}>
            ! Action Required: <br />
            <small>
              Your Stripe account setup is incomplete or needs updates to enable
              payouts.
            </small>
          </span>
        </div>
      )}

      {status && (
        <div>
          <p>
            Payout Enabled:{" "}
            {status.payoutsEnabled ? (
              <span style={{ color: "green" }}>Yes</span>
            ) : (
              <span style={{ color: "orange" }}>No</span>
            )}
          </p>
          <p>
            Charge Enabled:{" "}
            {status.chargesEnabled ? (
              <span style={{ color: "green" }}>Yes</span>
            ) : (
              <span style={{ color: "orange" }}>No</span>
            )}
          </p>
          <p>
            Details Submitted:{" "}
            {status.detailsSubmitted ? (
              <span style={{ color: "green" }}>Yes</span>
            ) : (
              <span style={{ color: "orange" }}>No</span>
            )}
          </p>
        </div>
      )}

      <div className={styles.noBio}>
        <p>
          {showOnboarding ? "Connect" : "Update"} your Stripe account{" "}
          {showOnboarding && "to process payments"}
        </p>
        <button
          className={styles.addButton}
          onClick={() => {
            apiClient
              .get("/users/stripe/account-link")
              .then((response) => {
                window.location.href = response.data.url;
              })
              .catch((error) => {
                console.error("Error connecting to Stripe:", error);
              });
          }}
        >
          {status?.detailsSubmitted ? "Update Info" : "Connect Stripe"}
        </button>
        {status?.detailsSubmitted && (
          <button
            className={styles.addButton}
            onClick={() => {
              apiClient
                .get("/users/stripe/login-link")
                .then((response) => {
                  window.location.href = response.data.data.loginLink;
                })
                .catch((error) => {
                  console.error("Error connecting to Stripe:", error);
                });
            }}
          >
            View Stripe Dashboard
          </button>
        )}
      </div>
    </section>
  );
}
