import React, { useState, useEffect } from 'react';
import styles from './TaskerList.module.css';
import apiClient from '../api/axiosConfig';
import GigHelperCard from './GigHelperCard';

const TaskerListSafe = ({ searchTerm = '' }) => {
  const [taskers, setTaskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchTaskers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching taskers with search term:', searchTerm);
        
        // Simple approach - try one endpoint at a time
        let response;
        
        try {
          console.log('Trying /users/top-match-taskers...');
          const params = searchTerm ? { search: searchTerm } : {};
          response = await apiClient.get('/users/top-match-taskers', { params });
          console.log('Success with top-match-taskers:', response.data);
        } catch (topMatchError) {
          console.log('top-match-taskers failed, trying match-taskers...');
          try {
            const params = { limit: 20 };
            if (searchTerm) params.search = searchTerm;
            response = await apiClient.get('/users/match-taskers', { params });
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
        
        // Debug: Log location data for first few taskers
        validTaskers.slice(0, 3).forEach((tasker, index) => {
          console.log(`Tasker ${index + 1} location data:`, {
            address: tasker.address,
            location: tasker.location,
            city: tasker.city,
            state: tasker.state,
            name: tasker.firstName || tasker.fullName
          });
        });
        
        setTaskers(validTaskers);
        
      } catch (err) {
        console.error('Error fetching taskers:', err);
        setError(err.message || 'Failed to fetch taskers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskers();
  }, [refreshKey, searchTerm]);

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
          {searchTerm ? 'No Search Results Found' : 'No Gig Helpers Available'}
        </h3>
        <p style={{ margin: '0', fontSize: '1rem', opacity: '0.8' }}>
          {searchTerm 
            ? `No helpers found matching "${searchTerm}". Try different keywords or browse all helpers.`
            : 'There are currently no helpers available. Check back later or try refreshing the page.'
          }
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
          
          // Enhanced location extraction
          let displayLocation = 'Location not specified';
          
          if (tasker.address) {
            const parts = [];
            if (tasker.address.city) parts.push(tasker.address.city);
            if (tasker.address.state) parts.push(tasker.address.state);
            if (tasker.address.country) parts.push(tasker.address.country);
            
            if (parts.length > 0) {
              displayLocation = parts.join(', ');
            }
          } else if (tasker.location) {
            // Fallback to location field if address is not available
            displayLocation = typeof tasker.location === 'string' 
              ? tasker.location 
              : tasker.location.city || tasker.location.state || 'Location not specified';
          } else if (tasker.city || tasker.state) {
            // Fallback to direct city/state fields
            const parts = [];
            if (tasker.city) parts.push(tasker.city);
            if (tasker.state) parts.push(tasker.state);
            displayLocation = parts.join(', ');
          }
          
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