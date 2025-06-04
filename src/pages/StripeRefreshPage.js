import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function StripeRefreshPage() {
    const navigate = useNavigate();

    // This page is hit if the AccountLink expires.
    // We just guide the user back to the dashboard to generate a new link.

    return (
        <div>
            <h2>Stripe connection link expired</h2>
            <p>Your secure connection link to Stripe has expired.</p>
            <button onClick={() => navigate('/profile')}>
                Go back to Dashboard to generate a new link
            </button>
        </div>
    );
}

export default StripeRefreshPage;