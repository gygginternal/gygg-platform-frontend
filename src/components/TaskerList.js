import { useState, useEffect } from 'react';
import styles from './TaskerList.module.css';
import apiClient from '../api/axiosConfig';
import GigHelperCard from './GigHelperCard';

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
        <GigHelperCard
          key={tasker._id}
          userId={tasker._id}
          profileImage={tasker.profileImage || '/default.jpg'}
          name={`${tasker.firstName}${tasker.lastName ? `. ${tasker.lastName[0]}` : ''}`}
          rate={
            tasker.ratePerHour
              ? `$${tasker.ratePerHour}/hr`
              : tasker.rateRange
                ? `$${tasker.rateRange}/hr`
                : ''
          }
          location={tasker.address?.city || tasker.address?.state || ''}
          bio={tasker.bio || 'No bio provided.'}
          onMessage={() => {
            /* TODO: handle message */
          }}
        />
      ))}
    </div>
  );
};

export default TaskerList;
