import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GigDetail from '../../components/GigDetail'; // The component rendering details and actions
import apiClient from '../../api/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ContractDetailsPage from '../ContractDetailsPage/ContractDetailsPage';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function GigDetailPage() {
  const { gigId } = useParams(); // Get gigId from URL
  const { user } = useAuth(); // Get current user for potential checks
  const navigate = useNavigate();
  const [gigData, setGigData] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Use useCallback to memoize fetch function if passed down
  const fetchData = useCallback(async () => {
    if (!gigId) return;
    setLoading(true);
    setError('');
    try {
      // Fetch Gig Details
      const gigResponse = await apiClient.get(`/gigs/${gigId}`);
      const gig = gigResponse.data.data.gig;
      setGigData(gig);

      // Check if user is a provider and owns this gig
      if (user && user.role?.includes('provider') && gig.postedBy?._id === user._id) {
        // Redirect to posted gigs page with this gig selected
        navigate(`/posted-gigs?gigId=${gigId}`, { replace: true });
        return;
      }

      // Fetch Associated Contract (if one exists for this gig)
      try {
        const contractResponse = await apiClient.get(
          `/contracts?gigId=${gigId}`
        );
        setContractData(contractResponse.data.data.contract); // Will be null if no contract found
      } catch (contractError) {
        // Handle cases where the contract endpoint might 404 or 403 specifically
        if (
          contractError.response?.status === 404 ||
          contractError.response?.status === 403
        ) {
          setContractData(null); // Explicitly set to null
        } else {
          // You might set a general error or ignore contract error if gig loaded
          setError('Error loading associated contract details.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load gig details.');
      setGigData(null); // Clear gig data on error
      setContractData(null); // Clear contract data on error
    } finally {
      setLoading(false);
    }
  }, []); // Dependency array includes gigId

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Fetch data when component mounts or fetchData changes

  // Callback function to update state after successful gig acceptance
  const handleAcceptSuccess = data => {
    // Refetch data to get the latest gig and contract status
    fetchData();
    // Or update state directly if response contains enough info
    // setGigData(data.gig);
    // setContractData({ _id: data.contractId, status: 'pending_payment', /* other potential fields */ });
  };

  // Callback for when payment is initiated (to potentially show loading or message)
  const handlePaymentInitiated = () => {
    // Maybe disable other actions while payment form is shown
  };

  return (
    <div>
      <h2>Gig Details</h2>
      <Elements stripe={stripePromise}>
        <ContractDetailsPage
          gig={gigData}
          contract={contractData}
          loading={loading}
          error={error}
          onAcceptSuccess={handleAcceptSuccess} // Pass callback
          onPaymentInitiated={handlePaymentInitiated} // Pass callback
        >
          <GigDetail
            gig={gigData}
            contract={contractData}
            loading={loading}
            error={error}
            onAcceptSuccess={handleAcceptSuccess} // Pass callback
            onPaymentInitiated={handlePaymentInitiated} // Pass callback
          />
        </ContractDetailsPage>
      </Elements>

      {/* You might add a button to refresh data */}
      {/* <button onClick={fetchData} disabled={loading}>Refresh Data</button> */}
    </div>
  );
}

export default GigDetailPage;
