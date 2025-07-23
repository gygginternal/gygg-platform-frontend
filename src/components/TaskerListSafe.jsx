import React, { useState, useEffect } from 'react';
import styles from './TaskerList.module.css';
import apiClient from '../api/axiosConfig';
import GigHelperCard from './GigHelperCard';

const TaskerListSafe = () => {
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
        
        // Simple approach - try one endpoint at a time
        let response;
        
        try {
          console.log('Trying /users/top-match-taskers...');
          response = await apiClient.get('/users/top-match-taskers');
          console.log('Success with top-match-taskers:', response.data);
        } catch (topMatchError) {
          console.log('top-match-taskers failed, trying match-taskers...');
          try {
            response = await apiClient.get('/users/match-taskers?limit=20');
            console.log('Success with match-taskers:', response.data);
          } catch (matchError) {
            console.error('Both endpoints failed:', matchError);
            throw new Error('Unable to fetch taskers. Please try again later.');
          }
        }
        
        // Simple response parsing
        let taskersData = [];
        
        if (response?.data?.data?.taskers && Array.isArray(response.data.data.taskers)) {
          taskersData = response.data.data.taskers;
        } else if (response?.data?.data?.matches && Array.isArray(response.data.data.matches)) {
          taskersData = response.data.data.matches;
        } else {
          console.warn('Unexpected response structure:', response?.data);
          taskersData = [];
        }
        
        console.log('Found taskers:', taskersData.length);
        
        // Filter valid taskers
        const validTaskers = taskersData.filter(tasker => {
          return tasker && 
                 typeof tasker === 'object' && 
                 tasker._id && 
                 (tasker.firstName || tasker.fullName);
        });
        
        console.log('Valid taskers:', validTaskers.length);
        setTaskers(validTaskers);
        
      } catch (err) {
        console.error('Error fetching taskers:', err);
        setError(err.message || 'Failed to fetch taskers. Please try again.');
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

  if (taskers.length === 0) {
    return (
      <div className={styles.endOfResults}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
          No Gig Helpers Available
        </h3>
        <p style={{ margin: '0', fontSize: '1rem', opacity: '0.8' }}>
          There are currently no helpers available. Check back later or try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.taskerList}>
      {taskers.map(tasker => {
        try {
          // Safe data extraction
          const displayName = tasker.fullName || 
            `${tasker.firstName || ''}${tasker.lastName ? ` ${tasker.lastName[0]}.` : ''}`.trim() ||
            'Anonymous User';
          
          const displayRate = tasker.ratePerHour 
            ? `$${tasker.ratePerHour}/hr`
            : tasker.rateRange 
              ? `$${tasker.rateRange}/hr`
              : tasker.rating 
                ? `⭐ ${Number(tasker.rating).toFixed(1)} (${tasker.ratingCount || 0} reviews)`
                : 'Rate not specified';
          
          const displayLocation = tasker.address?.city || 
            tasker.address?.state || 
            'Location not specified';
          
          return (
            <GigHelperCard
              key={tasker._id}
              userId={tasker._id}
              profileImage={tasker.profileImage || '/default.jpg'}
              name={displayName}
              rate={displayRate}
              location={displayLocation}
              bio={tasker.bio || 'No bio provided.'}
              onMessage={() => {
                console.log('Message clicked for:', tasker._id);
              }}
            />
          );
        } catch (cardError) {
          console.error('Error rendering tasker card:', cardError, tasker);
          return (
            <div key={tasker._id || Math.random()} style={{
              padding: '1rem',
              background: '#fee2e2',
              borderRadius: '8px',
              margin: '0.5rem 0'
            }}>
              Error displaying tasker data
            </div>
          );
        }
      })}
    </div>
  );
};

export default TaskerListSafe;