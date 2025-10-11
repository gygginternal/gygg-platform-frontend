// src/components/StripeOnboarding.js
import apiClient from '../../api/axiosConfig';
import React, { useState, useEffect } from 'react';
import styles from './StripeOnboarding.module.css';

export function StripeOnboarding() {
  const [status, setStatus] = useState(null); // null = unknown, object = found, false = confirmed not found
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const response = await apiClient.get('/users/stripe/account-status');
      if (response.data) {
        setStatus(response.data);
      } else {
        setStatus(false);
      }
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 400) {
        setStatus(false);
      } else {
        setStatus(null);
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
    <section className={styles.stripeCard}>
      {loading && <p>Loading...</p>}

      {!showOnboarding ? (
        <span className={styles.connected}>
          ✓ Connected & Active
          <br />
          <small>Your Stripe account setup is completed.</small>
        </span>
      ) : (
        <div>
          <span className={styles.actionRequired}>
            ! Action Required: <br />
            <small>
              Your Stripe account setup is incomplete or needs updates to enable
              payouts.
            </small>
          </span>
        </div>
      )}

      {status && (
        <div className={styles.statusDetails}>
          <p>
            Payout Enabled:{' '}
            {status.payoutsEnabled ? (
              <span className={styles.statusYes}>Yes</span>
            ) : (
              <span className={styles.statusNo}>No</span>
            )}
          </p>
          <p>
            Charge Enabled:{' '}
            {status.chargesEnabled ? (
              <span className={styles.statusYes}>Yes</span>
            ) : (
              <span className={styles.statusNo}>No</span>
            )}
          </p>
          <p>
            Details Submitted:{' '}
            {status.detailsSubmitted ? (
              <span className={styles.statusYes}>Yes</span>
            ) : (
              <span className={styles.statusNo}>No</span>
            )}
          </p>
        </div>
      )}

      <div className={styles.noBio}>
        <p>
          {showOnboarding ? 'Connect' : 'Update'} your Stripe account{' '}
          {showOnboarding && 'to process payments'}
        </p>
        <button
          className={styles.addButton}
          onClick={() => {
            apiClient
              .get('/users/stripe/account-link')
              .then(response => {
                window.location.href = response.data.url;
              })
              .catch(() => {
                // No need to handle error here, as it's already handled in the fetchStatus function
              });
          }}
        >
          {status?.payoutsEnabled ? 'Update Info' : 'Complete Verification'}
        </button>
        {/* {status?.detailsSubmitted && (
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
        )} */}
      </div>
    </section>
  );
}
