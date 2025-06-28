import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';
import styles from './ContractDetailPage.module.css';

function ContractDetailPage() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');

  const fetchContract = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/contracts/${id}`);
      setContract(res.data.data.contract);
    } catch (err) {
      setError('Failed to load contract.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContract();
    // eslint-disable-next-line
  }, [id]);

  const handleAction = async type => {
    setActionLoading(true);
    try {
      if (type === 'submit') {
        await apiClient.patch(`/contracts/${id}/submit-work`);
      } else if (type === 'approve') {
        await apiClient.patch(`/contracts/${id}/approve-completion`);
      } else if (type === 'cancel') {
        await apiClient.patch(`/contracts/${id}/cancel`);
      } else if (type === 'revision') {
        await apiClient.patch(`/contracts/${id}/request-revision`, {
          reason: revisionReason,
        });
        setRevisionReason('');
      }
      await fetchContract();
    } catch (err) {
      // Handle error silently or log it
    }
    setActionLoading(false);
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!contract) return null;

  return (
    <div className={styles.container}>
      <h2>Contract Details</h2>
      <div className={styles.info}>
        <div>Title: {contract.title || contract.gig?.title}</div>
        <div>Status: {contract.status}</div>
        {/* Add more contract fields as needed */}
      </div>
      <div className={styles.actions}>
        <button onClick={() => handleAction('submit')} disabled={actionLoading}>
          Submit Work
        </button>
        <button
          onClick={() => handleAction('approve')}
          disabled={actionLoading}
        >
          Approve Completion
        </button>
        <button onClick={() => handleAction('cancel')} disabled={actionLoading}>
          Cancel Contract
        </button>
        <input
          type="text"
          placeholder="Revision reason"
          value={revisionReason}
          onChange={e => setRevisionReason(e.target.value)}
        />
        <button
          onClick={() => handleAction('revision')}
          disabled={actionLoading || !revisionReason}
        >
          Request Revision
        </button>
      </div>
    </div>
  );
}

export default ContractDetailPage;
