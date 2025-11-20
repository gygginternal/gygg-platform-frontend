import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../api/axiosConfig';
import styles from './PaymentSummaryPage.module.css';

const PaymentSummaryPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [contract, setContract] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!contractId) {
      setError('No contract specified for payment.');
      setLoading(false);
      return;
    }

    fetchContractAndPayment();
  }, [contractId]);

  const fetchContractAndPayment = async () => {
    try {
      setLoading(true);
      
      // Fetch contract details
      const contractResponse = await apiClient.get(`/contracts/${contractId}`);
      const contractData = contractResponse.data.data.contract;
      setContract(contractData);

      // Fetch payment details for this contract
      const paymentResponse = await apiClient.get(`/payments?contract=${contractId}`);
      const paymentData = paymentResponse.data.data.payments[0];
      setPayment(paymentData);

    } catch (err) {
      console.error('Error fetching contract/payment details:', err);
      setError(err.response?.data?.message || 'Failed to load payment details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayWithStripe = () => {
    navigate(`/contracts/${contractId}/pay-with-stripe`);
  };

  const handleGoBack = () => {
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
        <button onClick={handleGoBack} className={styles.backButton}>
          Go Back
        </button>
      </div>
    );
  }

  // Calculate formatted amounts
  const serviceAmount = payment?.amount ? (payment.amount / 100).toFixed(2) : '0.00';
  const platformFee = payment?.applicationFeeAmount ? (payment.applicationFeeAmount / 100).toFixed(2) : '0.00';
  const providerTax = payment?.providerTaxAmount ? (payment.providerTaxAmount / 100).toFixed(2) : '0.00';
  const totalProviderPayment = payment?.totalProviderPayment ? (payment.totalProviderPayment / 100).toFixed(2) : '0.00';

  return (
    <div className={styles.container}>
      <div className={styles.paymentCard}>
        <div className={styles.header}>
          <button
            onClick={handleGoBack}
            className={styles.backButton}
            aria-label="Back"
          >
            ← Back
          </button>
          <h1>Payment Summary</h1>
        </div>

        <div className={styles.paymentSummary}>
          <div className={styles.toWhomSection}>
            <h2>Payment To</h2>
            <div className={styles.taskerInfo}>
              <div className={styles.taskerName}>
                {contract?.tasker?.firstName} {contract?.tasker?.lastName}
              </div>
              <div className={styles.taskDescription}>
                {contract?.title || contract?.gig?.title || 'N/A'}
              </div>
            </div>
          </div>

          <div className={styles.paymentBreakdownSection}>
            <h2>Payment Breakdown</h2>
            <div className={styles.breakdownItem}>
              <span className={styles.label}>Service Amount</span>
              <span className={styles.value}>${serviceAmount}</span>
            </div>
            <div className={styles.breakdownItem}>
              <span className={styles.label}>Platform Fee</span>
              <span className={styles.value}>${platformFee}</span>
            </div>
            <div className={styles.breakdownItem}>
              <span className={styles.label}>Tax (HST/GST)</span>
              <span className={styles.value}>${providerTax}</span>
            </div>
            <div className={`${styles.breakdownItem} ${styles.total}`}>
              <span className={styles.label}>Total</span>
              <span className={styles.value}>${totalProviderPayment}</span>
            </div>
          </div>

          <div className={styles.paymentInfo}>
            <h3>Payment Information</h3>
            <p>
              This payment will be processed securely through Stripe. 
              The funds will be transferred to the service provider upon completion.
            </p>
          </div>
        </div>

        <div className={styles.actionButtonContainer}>
          <button 
            onClick={handlePayWithStripe}
            className={styles.payButton}
          >
            Pay with Stripe
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummaryPage;