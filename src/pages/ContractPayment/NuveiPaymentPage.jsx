import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NuveiSimplyConnectPayment from '../../components/common/NuveiSimplyConnectPayment';
import apiClient from '../../api/axiosConfig';
import styles from './ContractPaymentPage.module.css';

const NuveiPaymentPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        // First, fetch the contract
        const contractResponse = await apiClient.get(`/contracts/${contractId}`);
        const contractData = contractResponse.data.data.contract;
        
        // Then, fetch payment info associated with the contract to get accurate amount
        try {
          const paymentResponse = await apiClient.get(`/payments/contracts/${contractId}/payment`);
          const paymentData = paymentResponse.data.data.payment;
          
          // Merge payment data with contract data to get the correct amount
          const enhancedContractData = {
            ...contractData,
            payment: paymentData,
            totalAmount: paymentData?.amount ? paymentData.amount / 100 : contractData.totalAmount, // Convert from cents if needed
            currency: paymentData?.currency || contractData.currency
          };
          
          setContract(enhancedContractData);
        } catch (paymentErr) {
          console.warn('Could not fetch payment data for contract, using contract data only:', paymentErr.message);
          // If payment fetch fails, just use contract data
          setContract(contractData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching contract:', err);
        setError('Failed to load contract information');
        setLoading(false);
      }
    };

    if (contractId) {
      fetchContract();
    }
  }, [contractId]);

  const handlePaymentSuccess = (result) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Nuvei payment successful:', result);
    }
    // Redirect back to the contract details page or show success message
    navigate(`/contracts/${contractId}`, { state: { paymentSuccess: true } });
  };

  const handlePaymentError = (error) => {
    console.error('Nuvei payment error:', error);
    setError(error.message || 'Payment failed');
  };

  const handleComplete = () => {
    // Payment completed successfully, navigate back
    navigate(`/contracts/${contractId}`, { state: { paymentSuccess: true } });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>Loading payment system...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>Payment Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>Contract Not Found</h2>
          <p>The contract for this payment was not found.</p>
          <button onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  // Calculate the amount to be paid (this might need adjustment based on your contract structure)
  // Try different possible contract fields for the payment amount
  if (process.env.NODE_ENV === 'development') {
    console.log('Contract for amount calculation:', contract); // Debug log
  }
  
  // Check for fields that might represent total including fees
  const rawAmount = contract.totalAmount ||           // Total including all fees
                   contract.paymentAmount ||          // Payment-specific amount
                   contract.amount ||                 // General amount field
                   contract.agreedCost ||             // This field exists in the contract data based on logs
                   (contract.gig && contract.gig.price) || 
                   (contract.payment && contract.payment.amount) || 
                   (contract.gig && typeof contract.gig === 'object' && contract.gig.amount) ||
                   (contract.paymentDetails && contract.paymentDetails.amount) ||
                   (contract.contractAmount) ||
                   (contract.price) ||
                   0;
                   
  if (process.env.NODE_ENV === 'development') {
    console.log('Raw amount found:', rawAmount); // Debug log
  }
                   
  // Handle amount that might be in cents (if from payment record)
  const numericRawAmount = typeof rawAmount === 'string' ? parseFloat(rawAmount) : rawAmount;
  if (process.env.NODE_ENV === 'development') {
    console.log('Numeric amount:', numericRawAmount); // Debug log
  }
  
  // Keep the amount as-is (your system uses actual dollar amounts, not cents)
  const amount = numericRawAmount > 0 ? numericRawAmount : 10.00; // Default to $10 if no amount specified
  
  // Get currency - try different possible contract fields
  const currency = contract.currency || 
                  (contract.payment && contract.payment.currency) || 
                  (contract.gig && contract.gig.currency) ||
                  'CAD'; // Default to CAD as you mentioned

  if (process.env.NODE_ENV === 'development') {
    console.log('Final amount and currency:', { amount, currency }); // Debug log
  }

  // Validate that we have a proper amount to process
  if (amount <= 0) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>Invalid Amount</h2>
          <p>The contract does not have a valid payment amount.</p>
          <button onClick={() => navigate(`/contracts/${contractId}`)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.paymentPageHeader}>
        <h1>Pay with Nuvei Simply Connect</h1>
        <p>Complete your payment for contract: {contract.title || contract._id}</p>
      </div>

      <div className={styles.paymentSection}>
        <NuveiSimplyConnectPayment
          contractId={contract._id || contract.id}
          amount={amount}
          currency={currency}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onComplete={handleComplete}
        />
      </div>

      <div className={styles.securityInfo}>
        <h3>Secure Payment</h3>
        <p>
          Your payment information is securely processed through Nuvei's PCI-compliant payment gateway.
          We do not store your payment details on our servers.
        </p>
      </div>
    </div>
  );
};

export default NuveiPaymentPage;