import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../api/axiosConfig';
import styles from './ContractPaymentPage.module.css';

const ContractPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe'); // Default to Stripe
  const [error, setError] = useState('');
  
  // Parse contract ID from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const contractId = queryParams.get('contractId');
  
  useEffect(() => {
    if (!contractId) {
      setError('No contract specified for payment.');
      setLoading(false);
      return;
    }
    
    fetchContractDetails();
  }, [contractId]);
  
  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/contracts/${contractId}`);
      setContract(response.data.data.contract);
    } catch (err) {
      console.error('Error fetching contract:', err);
      setError('Failed to load contract details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStripePayment = async () => {
    try {
      // Navigate to the Stripe payment page
      navigate(`/contracts/${contract._id || contract.id}/pay-with-stripe`);
    } catch (err) {
      console.error('Error processing Stripe payment:', err);
      showToast(
        err.response?.data?.message || 'Failed to process Stripe payment. Please try again.',
        'error'
      );
    }
  };
  
  const handleNuveiPayment = async () => {
    try {
      // Navigate to the Nuvei payment page (Simply Connect)
      navigate(`/contracts/${contract._id || contract.id}/pay-with-nuvei`);
    } catch (err) {
      console.error('Error processing Nuvei payment:', err);
      showToast(
        err.response?.data?.message || 'Failed to process Nuvei payment. Please try again.',
        'error'
      );
    }
  };
  
  const handlePayment = async () => {
    if (selectedPaymentMethod === 'stripe') {
      // For Stripe, we need to create a payment intent and then redirect to the payment page
      await handleStripePayment();
    } else if (selectedPaymentMethod === 'nuvei') {
      // For Nuvei Simply Connect, we can directly process the payment without account setup
      await handleNuveiPayment();
    }
  };
  
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading payment details...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          Go Back
        </button>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.paymentCard}>
        <div className={styles.header}>
          <h1>Complete Payment</h1>
          <button 
            onClick={() => navigate(-1)} 
            className={styles.closeButton}
            aria-label="Close"
          >
            ✖
          </button>
        </div>
        
        <div className={styles.contractDetails}>
          <h2>Contract Details</h2>
          <div className={styles.detailRow}>
            <span className={styles.label}>Task:</span>
            <span className={styles.value}>{contract?.title || contract?.gig?.title || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Tasker:</span>
            <span className={styles.value}>
              {contract?.tasker?.firstName || ''} {contract?.tasker?.lastName || ''}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Amount:</span>
            <span className={styles.value}>${contract?.agreedCost || contract?.rate || '0.00'}</span>
          </div>
        </div>
        
        <div className={styles.paymentMethodSelection}>
          <h2>Select Payment Method</h2>
          <div className={styles.methodTabs}>
            <button
              className={`${styles.tabButton} ${selectedPaymentMethod === 'stripe' ? styles.activeTab : ''}`}
              onClick={() => setSelectedPaymentMethod('stripe')}
            >
              Credit Card (Stripe)
            </button>
            <button
              className={`${styles.tabButton} ${selectedPaymentMethod === 'nuvei' ? styles.activeTab : ''}`}
              onClick={() => setSelectedPaymentMethod('nuvei')}
            >
              Nuvei (Cards/InstaDebit)
            </button>
          </div>
          
          <div className={styles.methodDescription}>
            {selectedPaymentMethod === 'stripe' ? (
              <div>
                <h3>Pay with Credit Card</h3>
                <p>Securely pay using your credit or debit card through Stripe.</p>
                {!user.stripeAccountId && (
                  <div className={styles.setupNotice}>
                    <p>You need to set up your Stripe account to use this payment method.</p>
                    <button 
                      onClick={() => navigate('/settings?tab=payment&setup=stripe')}
                      className={styles.setupButton}
                    >
                      Set Up Stripe Account
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3>Pay with Nuvei</h3>
                <p>Pay using credit cards or InstaDebit through Nuvei's secure payment system.</p>
                <p><strong>No account setup required</strong> - Pay directly through the secure payment form.</p>
                <div className={styles.setupNotice}>
                  <p>Nuvei Simply Connect allows you to pay directly without pre-setting up an account.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.actions}>
          <button 
            onClick={handlePayment}
            disabled={(selectedPaymentMethod === 'stripe' && !user.stripeAccountId)}
            className={styles.payButton}
          >
            {selectedPaymentMethod === 'stripe' && !user.stripeAccountId ? 'Set Up Stripe Account' : 
             `Pay ${contract?.agreedCost || contract?.rate || '0.00'}`}
          </button>
          <button onClick={() => navigate(-1)} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractPaymentPage;