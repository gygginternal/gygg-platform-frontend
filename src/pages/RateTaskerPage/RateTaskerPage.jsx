import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../api/axiosConfig';
import styles from './RateTaskerPage.module.css';
import ProfileSidebar from '../../components/Shared/ProfileSidebar';
import ReviewForm from '../../components/ReviewForm';

const RateTaskerPage = () => {
  const { contractId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await apiClient.get(`/contracts/${contractId}`);
        const contractData = response.data.data.contract;
        
        // Check if contract exists and is completed
        if (!contractData) {
          setError('Contract not found');
          return;
        }
        
        if (contractData.status !== 'completed') {
          setError('Contract must be completed to rate the tasker');
          return;
        }
        
        // Check if user is the provider
        if (contractData.provider._id !== user._id) {
          setError('Only the provider can rate the tasker');
          return;
        }
        
        setContract(contractData);
      } catch (err) {
        setError('Failed to load contract details');
        showToast('Failed to load contract details', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (contractId && user) {
      fetchContract();
    }
  }, [contractId, user, showToast]);

  const handleRatingSuccess = () => {
    showToast('Review submitted successfully!', 'success');
    // Navigate back to contracts page
    navigate('/contracts');
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <aside className={styles.sidebarArea}>
            <ProfileSidebar />
          </aside>
          <main className={styles.mainContent}>
            <div className={styles.loading}>Loading...</div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <aside className={styles.sidebarArea}>
            <ProfileSidebar />
          </aside>
          <main className={styles.mainContent}>
            <div className={styles.errorContainer}>
              <h2>Error</h2>
              <p>{error}</p>
              <a 
                className={styles.backButton}
                onClick={() => navigate('/contracts')}
              >
                Back to Contracts
              </a>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <aside className={styles.sidebarArea}>
          <ProfileSidebar />
        </aside>
        <main className={styles.mainContent}>
          <div className={styles.rateTaskerCard}>
            <div className={styles.header}>
              <h1>Rate Your Tasker</h1>
              <p>Please share your experience with the tasker for this contract</p>
            </div>
            
            {contract && (
              <div className={styles.combinedInfo}>
                <div className={styles.taskerInfo}>
                  {contract.tasker?.profileImage ? (
                    <img 
                      src={contract.tasker.profileImage} 
                      alt={contract.tasker.firstName}
                      className={styles.taskerImage}
                    />
                  ) : (
                    <div className={styles.taskerImage}>
                      {contract.tasker?.firstName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3>{contract.tasker?.firstName} {contract.tasker?.lastName}</h3>
                    <p>{contract.gig?.title}</p>
                  </div>
                </div>
                
                <div className={styles.reviewFormContainer}>
                  <ReviewForm 
                    contractId={contractId}
                    onSuccess={handleRatingSuccess}
                  />
                </div>
              </div>
            )}
            
            <div className={styles.actions}>
              <a 
                className={styles.backButton}
                onClick={() => navigate('/contracts')}
              >
                Back
              </a>
              <button 
                type="submit" 
                form="review-form"
                className={styles.submitButton}
              >
                Submit Review
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RateTaskerPage;