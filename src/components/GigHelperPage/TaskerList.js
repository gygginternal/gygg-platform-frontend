import { useState, useEffect } from 'react';
import styles from './TaskerList.module.css';
import apiClient from '../../api/axiosConfig';

const TaskerList = () => {
  const [taskers, setTaskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get('/applicances/top-match');
        if (
          !response.data ||
          !response.data.data ||
          !response.data.data.matches
        ) {
          throw new Error('Invalid response from server');
        }
        setTaskers(response.data.data.matches);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Failed to fetch taskers. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTaskers();
  }, []);

  if (error) {
    return (
      <div className={styles.errorMessage}>
        <p>{error}</p>
        <button
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className={styles.loadingMessage}>Loading taskers...</div>;
  }

  if (taskers.length === 0) {
    return <div className={styles.endOfResults}>No taskers found.</div>;
  }

  return (
    <div className={styles.taskerList}>
      {taskers.map(tasker => (
        <div
          key={tasker._id}
          style={{
            border: '1px solid #ccc',
            margin: '8px',
            padding: '8px',
            borderRadius: '8px',
          }}
        >
          <img
            src={tasker.profileImage || '/default.jpg'}
            alt={tasker.firstName}
            style={{ width: 48, height: 48, borderRadius: '50%' }}
          />
          <div>
            <strong>
              {tasker.firstName}
              {tasker.lastName ? `. ${tasker.lastName[0]}` : ''}
            </strong>
          </div>
          <div>
            {tasker.ratePerHour
              ? `$${tasker.ratePerHour}/hr`
              : tasker.rateRange
                ? `$${tasker.rateRange}/hr`
                : ''}
          </div>
          <div>{tasker.address?.city || tasker.address?.state || ''}</div>
          <div>{tasker.bio || 'No bio provided.'}</div>
        </div>
      ))}
    </div>
  );
};

export default TaskerList;
