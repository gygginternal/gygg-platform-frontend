import { useState, useEffect } from 'react';
import styles from './TaskerList.module.css';
import apiClient from '../api/axiosConfig';
import GigHelperCard from './GigHelperCard';
import { useAuth } from '../contexts/AuthContext';

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

        console.log('Fetching taskers...');
        console.log('Current user:', user);
        console.log('User role:', user?.role);

        // Use the improved match-taskers endpoint with better compatibility logic
        let response;
        let endpointUsed = '';

        try {
          console.log('Fetching taskers with improved compatibility matching...');
          response = await apiClient.get('/users/match-taskers?limit=50');
          endpointUsed = 'match-taskers';
          console.log('Success with match-taskers:', response.data);
        } catch (matchError) {
          console.log(
            'match-taskers failed:',
            matchError.response?.status,
            matchError.response?.data
          );

          // Fallback to top-match-taskers if match-taskers fails
          try {
            console.log('Trying fallback /users/top-match-taskers...');
            response = await apiClient.get('/users/top-match-taskers');
            endpointUsed = 'top-match-taskers';
            console.log('Success with top-match-taskers:', response.data);
          } catch (topMatchError) {
            console.log(
              'top-match-taskers failed:',
              topMatchError.response?.status,
              topMatchError.response?.data
            );

            // Last resort: try public endpoint
            try {
              console.log('Trying public user search as last resort...');
              response = await apiClient.get('/users?role=tasker&limit=50');
              endpointUsed = 'public-users';
              console.log('Success with public users:', response.data);
            } catch (publicError) {
              console.log(
                'Public users failed:',
                publicError.response?.status,
                publicError.response?.data
              );
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
          
          // Log compatibility scores for debugging
          if (taskersData.length > 0 && taskersData[0].compatibilityScore !== undefined) {
            console.log('Compatibility scores:', taskersData.slice(0, 5).map(t => ({
              name: t.fullName || t.firstName,
              compatibilityScore: t.compatibilityScore,
              hobbyMatches: t.hobbyMatches,
              personalityMatches: t.personalityMatches
            })));
          }
        } else if (response.data?.data?.matches) {
          taskersData = response.data.data.matches;
          console.log('Found matches:', taskersData.length);
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          taskersData = response.data.data;
          console.log('Found array in data.data:', taskersData.length);
        } else if (response.data?.taskers) {
          taskersData = response.data.taskers;
          console.log('Found taskers directly:', taskersData.length);
        } else if (Array.isArray(response.data)) {
          taskersData = response.data;
          console.log('Response is direct array:', taskersData.length);
        } else if (response.data?.data) {
          // Single tasker object or other structure
          if (Array.isArray(response.data.data)) {
            taskersData = response.data.data;
          } else {
            taskersData = [response.data.data];
          }
          console.log('Single tasker or other structure found');
        }

        console.log('Final taskers data:', taskersData);

        // Ensure we have valid tasker data
        const validTaskers = taskersData.filter(
          tasker =>
            tasker && tasker._id && (tasker.firstName || tasker.fullName)
        );

        console.log('Valid taskers after filtering:', validTaskers.length);
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

  // Debug info (remove in production)
  console.log('Current taskers state:', taskers);

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
            tasker.fullName ||
            `${tasker.firstName || ''}${tasker.lastName ? ` ${tasker.lastName[0]}.` : ''}`.trim() ||
            'Anonymous User'
          }
          rate={
            tasker.ratePerHour
              ? `$${tasker.ratePerHour}/hr`
              : tasker.rateRange
                ? `$${tasker.rateRange}/hr`
                : ''
          }
          location={tasker.address?.city || tasker.address?.state || ''}
          bio={tasker.bio || 'No bio provided.'}
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
