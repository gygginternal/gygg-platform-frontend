import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig'; // If triggering status check automatically

function StripeReturnPage() {
    const navigate = useNavigate();

    // Optional: Automatically trigger a status check on return
    useEffect(() => {
        console.log("Returned from Stripe onboarding flow.");
        // Give Stripe webhook a moment, then navigate or trigger check
        const timer = setTimeout(() => {
            // Option 1: Just navigate to dashboard, user can refresh status there
             navigate('/dashboard');

            // Option 2: Try fetching status here (might be too soon for webhook)
            /*
            apiClient.get('/users/stripe/account-status')
                .then(response => {
                    console.log("Fetched status after return:", response.data.data);
                    navigate('/dashboard');
                })
                .catch(error => {
                    console.error("Error fetching status after return:", error);
                    navigate('/dashboard'); // Navigate anyway
                });
            */
        }, 1500); // Wait 1.5 seconds

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, [navigate]);

    return (
        <div>
            <h2>Returning from Stripe...</h2>
            <p>You will be redirected to your dashboard shortly.</p>
            <p>If redirection doesn't happen, <Link to="/dashboard">click here to go to your Dashboard</Link> and check your Stripe status.</p>
        </div>
    );
}

export default StripeReturnPage;