// frontend/src/pages/GigDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import GigDetailComponent from '../components/GigDetail';
import apiClient from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
// DO NOT import mongoose here

function GigDetailPage() {
    const { gigId } = useParams();
    const { user } = useAuth();
    const [gigData, setGigData] = useState(null);
    const [contractData, setContractData] = useState(null);
    const [existingReview, setExistingReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        console.log("GigDetailPage - Attempting fetch with gigId:", gigId);

        // CHECK: Ensure gigId exists and looks like a valid ObjectId before proceeding
        if (!gigId || typeof gigId !== 'string' || gigId.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(gigId)) {
            console.error("GigDetailPage: Invalid Gig ID detected. Aborting fetch.", gigId);
            setError(`Invalid Gig ID found in URL: '${gigId || 'None'}'.`);
            setLoading(false);
            setGigData(null); // Clear any potentially stale data
            setContractData(null);
            setExistingReview(null);
            return; // Stop execution
        }

        setLoading(true);
        setError('');
        setExistingReview(null);

        try {
            // ... rest of your try/catch block for fetching gig, contract, and review data ...
            // (This part remains the same as the previous correct version)
            const gigResponse = await apiClient.get(`/gigs/${gigId}`);
            const currentGig = gigResponse.data.data.gig;
            setGigData(currentGig);
            console.log("Gig Data Fetched:", currentGig);

            try {
                const contractResponse = await apiClient.get(`/contracts?gigId=${gigId}`);
                const currentContract = contractResponse.data.data.contract;
                setContractData(currentContract);
                console.log("Contract Data Fetched:", currentContract);

                if (currentContract && currentContract.provider?._id === user?._id && currentGig?.assignedTo?._id) {
                    const reviewParams = { gigId: gigId, reviewer: user._id };
                    const reviewResponse = await apiClient.get('/reviews', { params: reviewParams });
                    if (reviewResponse.data.results > 0) {
                        setExistingReview(reviewResponse.data.data.reviews[0]);
                    }
                }
            } catch (contractError) {
                 if (contractError.response?.status === 404 || contractError.response?.status === 403 || (contractError.response?.data?.message && contractError.response.data.message.includes("No contract found"))) {
                    console.log("No accessible contract found for this gig, or query failed.");
                    setContractData(null);
                } else {
                    console.error("Error fetching contract:", contractError.response?.data || contractError.message);
                    setError('Error loading associated contract details.');
                }
            }

        } catch (err) {
            console.error("Error fetching gig details:", err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to load gig details.');
            setGigData(null);
            setContractData(null);
        } finally {
            setLoading(false);
        }
    }, [gigId, user]); // user dependency is for the review check logic

    useEffect(() => {
        // Ensure user object is available from context before fetching
        // as fetchData might depend on it (e.g., for checking existing reviews)
        if (user !== undefined) { // user can be null if not logged in, undefined if context still loading
           fetchData();
        }
    }, [fetchData, user]); // Re-run if fetchData or user changes

    // ... rest of GigDetailPage component (callbacks and return JSX) ...
     const handleAcceptSuccess = () => { console.log("Gig accepted, refreshing data..."); fetchData(); };
     const handlePaymentInitiated = () => { console.log("Payment initiated by user."); };
     const handlePaymentSuccess = () => { console.log("Payment successful, refreshing data..."); fetchData(); };
     const handleReviewSuccess = () => { console.log("Review submitted, refreshing data..."); fetchData(); };

    return (
        <div>
            <GigDetailComponent
                gig={gigData}
                contract={contractData}
                existingReview={existingReview}
                loading={loading}
                error={error}
                onAcceptSuccess={handleAcceptSuccess}
                onPaymentInitiated={handlePaymentInitiated}
                onPaymentSuccess={handlePaymentSuccess}
                onReviewSuccess={handleReviewSuccess}
                refreshData={fetchData}
            />
            {!loading && <button onClick={fetchData} style={{marginTop:'15px'}}>Refresh Details</button>}
        </div>
    );
}
export default GigDetailPage;