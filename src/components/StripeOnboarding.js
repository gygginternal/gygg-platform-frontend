import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';

function StripeOnboarding() {
    // Initialize status as potentially null, and add a specific 'notFound' state
    const [status, setStatus] = useState(null); // null = unknown, object = found, false = confirmed not found
    const [loading, setLoading] = useState(true); // Start loading immediately on mount
    const [error, setError] = useState('');

    const fetchStatus = async () => {
        setLoading(true);
        setError('');
        setStatus(null); // Reset status while fetching
        try {
            console.log("StripeOnboarding: Fetching account status...");
            const response = await apiClient.get('/users/stripe/account-status');
            // Check if backend might return null data even on success
            if (response.data.data && response.data.data.stripeAccountId) {
                 setStatus(response.data.data);
                 console.log("StripeOnboarding: Status received:", response.data.data);
            } else {
                 // Explicitly set status to indicate account not found after successful check
                 setStatus(false); // Use 'false' to differentiate from initial 'null' state
                 console.log("StripeOnboarding: Account status check returned no account ID.");
            }
        } catch (err) {
            console.error("StripeOnboarding: Error fetching status:", err.response?.data || err.message);
            // If backend returns 400/404 specifically because account doesn't exist
            if (err.response?.status === 404 || err.response?.status === 400) {
                setStatus(false); // Explicitly set status to indicate account not found
                console.log("StripeOnboarding: Backend confirmed no account found.");
            } else {
                setError('Failed to fetch Stripe account status.');
                setStatus(null); // Reset to unknown on other errors
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch status on initial component mount
    useEffect(() => {
        fetchStatus();
    }, []);

    // Handler for initiating the connection (creates account IF needed, then gets link)
    const handleConnect = async () => {
        setLoading(true);
        setError('');
        try {
            // Backend POST /users/stripe/create-account should handle creation OR getting link if exists
            console.log("StripeOnboarding: Calling create-account endpoint...");
            const response = await apiClient.post('/users/stripe/create-account');
            if (response.data.url) {
                console.log("StripeOnboarding: Redirecting to Stripe URL:", response.data.url);
                window.location.href = response.data.url;
                // No setLoading(false) needed due to redirect
            } else {
                setError('Could not get onboarding link from server.');
                setLoading(false);
            }
        } catch (err) {
            console.error("StripeOnboarding: Error creating/linking account:", err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to initiate Stripe connection.');
            setLoading(false);
        }
    };

    // Handler specifically for getting an update link WHEN AN ACCOUNT ALREADY EXISTS
     const handleUpdateLink = async () => {
         // Double-check that we actually have an account ID before calling this
         if (!status || !status.stripeAccountId) {
              setError("Cannot get update link: No Stripe account ID found.");
              return;
         }
         setLoading(true);
         setError('');
         try {
             console.log("StripeOnboarding: Calling create-account-link endpoint...");
             // This endpoint EXPECTS an account to exist
             const response = await apiClient.get('/users/stripe/create-account-link');
             if (response.data.url) {
                 console.log("StripeOnboarding: Redirecting to Stripe URL:", response.data.url);
                 window.location.href = response.data.url;
                 // No setLoading(false) needed due to redirect
             } else {
                 setError('Could not get update link from server.');
                 setLoading(false);
             }
         } catch (err) {
             console.error("StripeOnboarding: Error getting update link:", err.response?.data || err.message);
             setError(err.response?.data?.message || 'Failed to get update link.');
             setLoading(false);
         }
     };

    // --- Render Logic ---

    const renderContent = () => {
        if (loading && status === null) { // Initial loading state
            return <p>Loading Stripe status...</p>;
        }

        if (error) {
            return (
                <>
                    <p className="error-message">Error: {error}</p>
                    {/* Offer retry options */}
                    <button onClick={fetchStatus} disabled={loading} style={{ marginRight: '10px' }}>Retry Status Check</button>
                    {status === false && <button onClick={handleConnect} disabled={loading}>Retry Connection</button>}
                </>
            );
        }

        if (status === false) { // Explicitly confirmed no account exists
            return (
                 <div>
                     <p>Connect bank account via Stripe to receive payouts.</p>
                     <button onClick={handleConnect} disabled={loading}>
                         {loading ? 'Connecting...' : 'Connect with Stripe'}
                     </button>
                 </div>
             );
        }

        if (status && status.stripeAccountId) { // Account exists, show details
            const isOnboardingComplete = status.payoutsEnabled && status.detailsSubmitted;
            return (
                <div>
                    <p>Account ID: <code style={{ fontSize: '0.85em' }}>{status.stripeAccountId}</code></p>
                    <p>Payouts Enabled: {status.payoutsEnabled ? <span style={{ color: 'green' }}>Yes</span> : <span style={{ color: 'orange' }}>No</span>}</p>
                    <p>Details Submitted: {status.detailsSubmitted ? <span style={{ color: 'green' }}>Yes</span> : <span style={{ color: 'orange' }}>No</span>}</p>

                    {!isOnboardingComplete ? (
                        <button onClick={handleUpdateLink} disabled={loading}>
                            {loading ? 'Getting Link...' : 'Complete/Update Onboarding'}
                        </button>
                    ) : (
                        <p className="success-message">✓ Stripe setup complete!</p>
                    )}
                    <button onClick={fetchStatus} disabled={loading} style={{ marginLeft: '10px' }}>
                        {loading ? 'Refreshing...' : 'Refresh Status'}
                    </button>
                </div>
            );
        }

        // Fallback if status is still null after initial load (shouldn't happen ideally)
        return <p>Could not determine Stripe status.</p>;
    };


    return (
        <div className="card">
            <h3>Stripe Payout Setup</h3>
            {renderContent()}
        </div>
    );
}
export default StripeOnboarding;