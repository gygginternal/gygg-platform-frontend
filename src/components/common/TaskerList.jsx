import { useState, useEffect } from 'react';
import styles from './TaskerList.module.css';
import apiClient from '../../api/axiosConfig';
import GigHelperCard from './GigHelperCard';
import { useAuth } from '../../contexts/AuthContext';
import { decodeHTMLEntities } from '../utils/htmlEntityDecoder';

const TaskerList = () => {
  const { user } = useAuth();
  const [taskers, setTaskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchTaskers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the improved match-taskers endpoint with better compatibility logic
        let response;
        let endpointUsed = '';

        try {
          response = await apiClient.get('/users/match-taskers?limit=50');
          endpointUsed = 'match-taskers';
        } catch (matchError) {
          // Fallback to top-match-taskers if match-taskers fails
          try {
            response = await apiClient.get('/users/top-match-taskers');
            endpointUsed = 'top-match-taskers';
          } catch (topMatchError) {
            console.error(
              'Top match endpoint failed:',
              topMatchError.response?.data
            );

            // Last resort: try public endpoint
            try {
              response = await apiClient.get('/users?role=tasker&limit=50');
              endpointUsed = 'public-users';
            } catch (publicError) {
              throw matchError; // Throw the original match error
            }
          }
        }

        // Handle response structure (now standardized)
        let taskersData = [];
        console.log('Processing response from:', endpointUsed);
        console.log('Response structure:', response.data);

        if (response.data?.data?.taskers) {
          // Standard structure for both endpoints
          taskersData = response.data.data.taskers;
          console.log('Found taskers in data.taskers:', taskersData.length);

          // Log compatibility scores for debugging (removed for production)
        } else if (response.data?.data?.matches) {
          taskersData = response.data.data.matches;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          taskersData = response.data.data;
        } else if (response.data?.taskers) {
          taskersData = response.data.taskers;
        } else if (Array.isArray(response.data)) {
          taskersData = response.data;
        } else if (response.data?.data) {
          // Single tasker object or other structure
          if (Array.isArray(response.data.data)) {
            taskersData = response.data.data;
          } else {
            taskersData = [response.data.data];
          }
        }

        // Ensure we have valid tasker data
        const validTaskers = taskersData.filter(
          tasker =>
            tasker && tasker._id && (tasker.firstName || tasker.fullName)
        );
        setTaskers(validTaskers);
      } catch (err) {
        console.error('Error fetching taskers:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);

        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to fetch taskers. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTaskers();
  }, [refreshKey]);

  const handleRetry = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (error) {
    return (
      <div className={styles.errorMessage}>
        <p>{error}</p>
        <button
          className={styles.retryButton}
          onClick={handleRetry}
          disabled={loading}
        >
          {loading ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className={styles.loadingMessage}>Loading taskers...</div>;
  }

  // Debug info (removed for production)

  if (taskers.length === 0) {
    return (
      <div className={styles.endOfResults}>
        <h3
          style={{
            margin: '0 0 1rem 0',
            fontSize: '1.25rem',
            fontWeight: '600',
          }}
        >
          No Gig Helpers Available
        </h3>
        <p style={{ margin: '0', fontSize: '1rem', opacity: '0.8' }}>
          There are currently no helpers available in your area. Check back
          later or try expanding your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.taskerList}>
      {taskers.map(tasker => (
        <GigHelperCard
          key={tasker._id}
          userId={tasker._id}
          profileImage={tasker.profileImage || '/default.jpg'}
          name={
            decodeHTMLEntities(tasker.fullName) ||
            decodeHTMLEntities(
              `${tasker.firstName || ''}${tasker.lastName ? ` ${tasker.lastName[0]}.` : ''}`.trim()
            ) ||
            'Anonymous User'
          }
          rate={
            tasker.ratePerHour
              ? `${tasker.ratePerHour}/hr`
              : tasker.rateRange
                ? `${tasker.rateRange}/hr`
                : ''
          }
          location={
            decodeHTMLEntities(tasker.address?.city) ||
            decodeHTMLEntities(tasker.address?.state) ||
            ''
          }
          bio={decodeHTMLEntities(tasker.bio) || 'No bio provided.'}
          compatibilityScore={tasker.compatibilityScore}
          hobbyMatches={tasker.hobbyMatches}
          personalityMatches={tasker.personalityMatches}
          onMessage={() => {
            /* TODO: handle message */
          }}
        />
      ))}
    </div>
  );
};

export default TaskerList;
