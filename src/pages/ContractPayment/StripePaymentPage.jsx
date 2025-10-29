import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../api/axiosConfig';
import StripePayment from '../../components/common/StripePayment';
import styles from './StripePaymentPage.module.css';

const StripePaymentPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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
  
  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // Confirm payment success with backend
      await apiClient.post('/payments/confirm-payment-success', {
        paymentIntentId: paymentResult.id,
        contractId: contract._id || contract.id
      });
      
      showToast(
        'Payment completed successfully! Contract has been completed.',
        'success'
      );
      
      // Redirect to contracts page or show success message
      setTimeout(() => {
        navigate('/contracts');
      }, 2000);
      
    } catch (err) {
      console.error('Error confirming Stripe payment:', err);
      showToast(
        'Payment succeeded but there was an issue updating the contract. Please contact support.',
        'warning'
      );
    }
  };
  
  const handlePaymentError = (error) => {
    console.error('Stripe payment error:', error);
    showToast(`Payment failed: ${error.message || 'Unknown error'}`, 'error');
  };
  
  const handleCancel = () => {
    navigate(-1);
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
          <h1>Pay with Credit Card (Stripe)</h1>
          <button 
            onClick={handleCancel} 
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
        
        <div className={styles.stripePaymentSection}>
          <StripePayment
            contract={contract}
            amount={parseFloat(contract?.agreedCost || contract?.rate || 0)}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default StripePaymentPage;