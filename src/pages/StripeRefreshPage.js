import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../components/StripeRefreshPage/StripeRefreshPage.module.css';

function StripeRefreshPage() {
    const navigate = useNavigate();

    // This page is hit if the AccountLink expires.
    // We just guide the user back to the dashboard to generate a new link.

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Stripe connection link expired</h2>
            <p className={styles.message}>Your secure connection link to Stripe has expired.</p>
            <button onClick={() => navigate('/profile')} className={styles.button}>
                Go back to Dashboard to generate a new link
            </button>
        </div>
    );
}

export default StripeRefreshPage;