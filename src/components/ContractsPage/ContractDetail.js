import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, MapPin, DollarSign, Clock } from 'lucide-react';
import apiClient from '../../api/axiosConfig';
import styles from '../../pages/ContractDetailPage/ContractDetailPage.module.css';
import PropTypes from 'prop-types';

function ContractDetail({ contract, onBack }) {
  const [contractData, setContractData] = useState(contract);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch detailed contract data when component mounts
  useEffect(() => {
    if (contract?.id) {
      fetchContractDetails();
    }
  }, [contract?.id, fetchContractDetails]);

  const fetchContractDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/contracts/${contract.id}`);
      setContractData(res.data.data.contract);
    } catch (err) {
      setError('Failed to load contract details.');
    } finally {
      setLoading(false);
    }
  }, [contract?.id]);

  const handleContractAction = async action => {
    setLoading(true);
    try {
      switch (action) {
        case 'submit':
          await apiClient.patch(`/contracts/${contract.id}/submit-work`);
          break;
        case 'approve':
          await apiClient.patch(`/contracts/${contract.id}/approve-completion`);
          break;
        case 'cancel':
          await apiClient.patch(`/contracts/${contract.id}/cancel`);
          break;
        default:
          // console.warn('Unknown action:', action);
          return;
      }

      // Refresh contract data after action
      await fetchContractDetails();
    } catch (err) {
      setError(`Failed to ${action} contract.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.contractDetailWrapper}>
        <div className={styles.loadingState}>
          <p>Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.contractDetailWrapper}>
        <div className={styles.errorState}>
          <p>{error}</p>
          <button onClick={onBack} className={styles.backButton}>
            <ArrowLeft className={styles.backIcon} />
            Back to Contracts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.contractDetailWrapper}>
      <div className={styles.headerSection}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft className={styles.backIcon} />
          Back to Contracts
        </button>
        <h2 className={styles.title}>
          {contractData?.title || 'Contract Details'}
        </h2>
      </div>

      <div className={styles.detailsBody}>
        <div className={styles.metaGrid}>
          <div>
            <span className={styles.metaLabel}>Contract ID</span>
            <p className={styles.metaValue}>
              {contractData?.id || contract?.contractId}
            </p>
          </div>
          <div>
            <span className={styles.metaLabel}>Started</span>
            <p className={styles.metaValue}>
              {contractData?.createdAt
                ? new Date(contractData.createdAt).toLocaleDateString()
                : contract?.startDate}
            </p>
          </div>
          <div>
            <span className={styles.metaLabel}>Status</span>
            <p className={styles.metaValue}>
              {contractData?.status || contract?.status}
            </p>
          </div>
        </div>

        {contractData?.description && (
          <div className={styles.descriptionBlock}>
            <h3 className={styles.descriptionTitle}>Description</h3>
            <p className={styles.descriptionText}>{contractData.description}</p>
          </div>
        )}

        <div className={styles.infoCards}>
          {contractData?.location && (
            <div className={styles.infoCard}>
              <MapPin className={styles.cardIcon} />
              <div>
                <span className={styles.cardLabel}>Location</span>
                <span className={styles.cardValue}>
                  {contractData.location}
                </span>
              </div>
            </div>
          )}

          <div className={styles.infoCard}>
            <DollarSign className={styles.cardIcon} />
            <div>
              <span className={styles.cardLabel}>Rate</span>
              <span className={styles.cardRate}>
                ${contractData?.agreedCost || contract?.rate || 0}
              </span>
            </div>
          </div>

          {contractData?.duration && (
            <div className={styles.infoCard}>
              <Clock className={styles.cardIcon} />
              <div>
                <span className={styles.cardLabel}>Duration</span>
                <span className={styles.cardValue}>
                  {contractData.duration} hours
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.earnedBox}>
          <div className={styles.earnedRow}>
            <span className={styles.earnedLabel}>Earned so far</span>
            <span className={styles.earnedValue}>
              $
              {contractData?.payoutToTasker
                ? (contractData.payoutToTasker / 100).toFixed(2)
                : contract?.earnedSoFar || 0}
            </span>
          </div>
        </div>

        <div className={styles.actionButtons}>
          {contractData?.status === 'active' && (
            <>
              <button
                onClick={() => handleContractAction('submit')}
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit as Complete'}
              </button>
              <button
                onClick={() => handleContractAction('cancel')}
                className={styles.endButton}
                disabled={loading}
              >
                {loading ? 'Canceling...' : 'Cancel Contract'}
              </button>
            </>
          )}

          {contractData?.status === 'pending_approval' && (
            <button
              onClick={() => handleContractAction('approve')}
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Approving...' : 'Approve Completion'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

ContractDetail.propTypes = {
  contract: PropTypes.shape({
    id: PropTypes.string,
    contractId: PropTypes.string,
    startDate: PropTypes.string,
    status: PropTypes.string,
    rate: PropTypes.number,
    earnedSoFar: PropTypes.number,
  }),
  onBack: PropTypes.func,
};

export default ContractDetail;
