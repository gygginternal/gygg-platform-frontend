import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosConfig'; // If triggering status check automatically
import styles from './StripeReturnPage.module.css'; // Import CSS Modules

function StripeReturnPage() {
  const navigate = useNavigate();

  // Optional: Automatically trigger a status check on return
  useEffect(() => {
    // Give Stripe webhook a moment, then navigate or trigger check
    const timer = setTimeout(() => {
      // Option 1: Just navigate to dashboard, user can refresh status there
      navigate('/settings?activeTab=withdraw');

      // Option 2: Try fetching status here (might be too soon for webhook)
      apiClient
        .get('/users/stripe-status')
        .then(response => {
          // Optionally update user context or redirect
        })
        .catch(error => {
          // Option 2: Navigate anyway
          navigate('/profile');
        });
    }, 1500); // Wait 1.5 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [navigate]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Returning from Stripe...</h2>
      <p className={styles.message}>
        You will be redirected to your dashboard shortly.
      </p>
      <p className={styles.redirectPrompt}>
        If redirection doesn&apos;t happen,{' '}
        <Link to="/settings?activeTab=withdraw" className={styles.link}>
          click here to go to your Dashboard
        </Link>{' '}
        and check your Stripe status.
      </p>
    </div>
  );
}

export default StripeReturnPage;
