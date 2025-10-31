import React, { useState, useEffect } from 'react';
import styles from './TaskerList.module.css';
import apiClient from '../../api/axiosConfig';
import GigHelperCard from './GigHelperCard';

// Helper function to decode HTML entities
const decodeHTMLEntities = text => {
  if (typeof text !== 'string' || !text) return '';
  try {
    const element = document.createElement('div');
    element.innerHTML = text;
    return element.textContent || element.innerText || '';
  } catch (e) {
    console.error('Error decoding HTML entities:', e);
    return text;
  }
};

const TaskerListSafe = ({ searchTerm = '' }) => {
  const [taskers, setTaskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchTaskers = async (pageToFetch = 1) => {
    try {
      const isFirstPage = pageToFetch === 1;
      if (isFirstPage) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      // Try the new public search endpoint first, then fallback to provider-specific endpoints
      let response;

      try {
        const params = { page: pageToFetch, limit: 10 }; // Using limit of 10 like Contracts page
        if (searchTerm) params.search = searchTerm;
        response = await apiClient.get('/users/search-taskers', { params });
      } catch (searchError) {
        console.log('search-taskers failed, trying fallback endpoints...');
        try {
          // Only send search param to top-match-taskers (doesn't support pagination)
          const params = searchTerm ? { search: searchTerm } : {};
          response = await apiClient.get('/users/top-match-taskers', {
            params,
          });
        } catch (topMatchError) {
          try {
            // match-taskers supports pagination
            const params = { page: pageToFetch, limit: 10 };
            if (searchTerm) params.search = searchTerm;
            response = await apiClient.get('/users/match-taskers', {
              params,
            });
          } catch (matchError) {
            console.error('All endpoints failed:', matchError);
            throw new Error(
              'Unable to fetch taskers. Please try again later.'
            );
          }
        }
      }

      // Extract pagination data based on which endpoint responded
      let totalPages = 1;
      let responseCurrentPage = 1;
      let supportsPagination = false;
      
      if (response.config.url.includes('/search-taskers')) {
        // search-taskers endpoint supports pagination
        totalPages = response.data.totalPages || 1;
        responseCurrentPage = response.data.page || response.data.currentPage || 1;
        supportsPagination = true;
      } else if (response.config.url.includes('/match-taskers')) {
        // match-taskers endpoint supports pagination
        totalPages = response.data.totalPages || Math.ceil(response.data.totalResults / 10) || 1;
        responseCurrentPage = response.data.page || 1;
        supportsPagination = true;
      } else if (response.config.url.includes('/top-match-taskers')) {
        // top-match-taskers endpoint doesn't support pagination
        totalPages = 1;
        responseCurrentPage = 1;
        // For top-match-taskers, only show load more if we got the max results
        supportsPagination = false;
      }
      
      setTotalPages(totalPages);
      setCurrentPage(responseCurrentPage);
      setHasMore(supportsPagination ? (responseCurrentPage < totalPages) : false);

      // Simple response parsing
      let taskersData = [];

      if (
        response?.data?.data?.taskers &&
        Array.isArray(response.data.data.taskers)
      ) {
        taskersData = response.data.data.taskers;
      } else if (
        response?.data?.data?.matches &&
        Array.isArray(response.data.data.matches)
      ) {
        taskersData = response.data.data.matches;
      } else {
        console.warn('Unexpected response structure:', response?.data);
        taskersData = [];
      }

      // Filter valid taskers
      const validTaskers = taskersData.filter(tasker => {
        return (
          tasker &&
          typeof tasker === 'object' &&
          tasker._id &&
          (tasker.firstName || tasker.fullName)
        );
      });

      if (isFirstPage) {
        setTaskers(validTaskers);
      } else {
        setTaskers(prev => [...prev, ...validTaskers]);
      }
    } catch (err) {
      console.error('Error fetching taskers:', err);
      setError(err.message || 'Failed to fetch taskers. Please try again.');
      if (pageToFetch === 1) setTaskers([]);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setTaskers([]);
    setTotalPages(1);
    setHasMore(false);
    fetchTaskers(1);
  }, [refreshKey, searchTerm]);

  const handleRetry = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Load more taskers
  const loadMoreTaskers = () => {
    if (hasMore && !isLoadingMore) {
      const nextPage = currentPage + 1;
      fetchTaskers(nextPage);
    }
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

  if (loading && taskers.length === 0) {
    return <div className={styles.loadingMessage}>Loading taskers...</div>;
  }

  if (taskers.length === 0) {
    return (
      <div className={styles.noResults}>
        <h3
          style={{
            margin: '0 0 1rem 0',
            fontSize: '1.25rem',
            fontWeight: '600',
          }}
        >
          {searchTerm ? 'No Search Results Found' : 'No Gig Helpers Available'}
        </h3>
        <p style={{ margin: '0', fontSize: '1rem', opacity: '0.8' }}>
          {searchTerm
            ? `No helpers found matching "${searchTerm}". Try different keywords or browse all helpers.`
            : 'There are currently no helpers available. Check back later or try refreshing the page.'}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.taskerList}>
      {taskers.map(tasker => {
        try {
          // Safe data extraction
          const displayName =
            decodeHTMLEntities(tasker.fullName) ||
            decodeHTMLEntities(
              `${tasker.firstName || ''}${tasker.lastName ? ` ${tasker.lastName}` : ''}`.trim()
            ) ||
            'Anonymous User';

          const displayRate = tasker.ratePerHour
            ? `${tasker.ratePerHour}/hr`
            : tasker.rateRange
              ? `${tasker.rateRange}/hr`
              : tasker.rating
                ? `⭐ ${Number(tasker.rating).toFixed(1)} (${tasker.ratingCount || 0} reviews)`
                : 'Rate not specified';

          // Enhanced location extraction - exclude country from display
          let displayLocation = 'Location not specified';

          if (tasker.address) {
            const parts = [];
            if (tasker.address.city)
              parts.push(decodeHTMLEntities(tasker.address.city));
            if (tasker.address.state)
              parts.push(decodeHTMLEntities(tasker.address.state));
            // Note: Country is not included in the display to keep it concise

            if (parts.length > 0) {
              displayLocation = parts.join(', ');
            }
          } else if (tasker.location) {
            // Fallback to location field if address is not available
            displayLocation =
              typeof tasker.location === 'string'
                ? decodeHTMLEntities(tasker.location)
                : decodeHTMLEntities(tasker.location.city) ||
                  decodeHTMLEntities(tasker.location.state) ||
                  'Location not specified';
          } else if (tasker.city || tasker.state) {
            // Fallback to direct city/state fields
            const parts = [];
            if (tasker.city) parts.push(decodeHTMLEntities(tasker.city));
            if (tasker.state) parts.push(decodeHTMLEntities(tasker.state));
            displayLocation = parts.join(', ');
          }

          return (
            <GigHelperCard
              key={tasker._id}
              userId={tasker._id}
              profileImage={tasker.profileImage || '/default.jpg'}
              name={decodeHTMLEntities(displayName)}
              rate={decodeHTMLEntities(displayRate)}
              location={decodeHTMLEntities(displayLocation)}
              bio={decodeHTMLEntities(tasker.bio || 'No bio provided.')}
            />
          );
        } catch (cardError) {
          console.error('Error rendering tasker card:', cardError, tasker);
          return (
            <div
              key={tasker._id || Math.random()}
              style={{
                padding: '1rem',
                background: '#fee2e2',
                borderRadius: '8px',
                margin: '0.5rem 0',
              }}
            >
              Error displaying tasker data
            </div>
          );
        }
      })}
      
      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className={styles.loadingMore}>
          <div className={styles.loadingSpinnerSmall}></div>
          <p>Loading more taskers...</p>
        </div>
      )}
      
      {/* Load More Button */}
      {hasMore && !isLoadingMore && (
        <button 
          onClick={loadMoreTaskers}
          className={styles.loadMoreButton}
        >
          Load More Taskers
        </button>
      )}
      
      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className={styles.loadingMore}>
          <div className={styles.loadingSpinnerSmall}></div>
          <p>Loading more taskers...</p>
        </div>
      )}
      
      {/* Load More Button */}
      {hasMore && !isLoadingMore && (
        <button 
          onClick={loadMoreTaskers}
          className={styles.loadMoreButton}
        >
          Load More Taskers
        </button>
      )}
      
      {!hasMore && taskers.length > 0 && (
        <p className={styles.endOfResults}>
          You've reached the end of the results.
        </p>
      )}
    </div>
  );
};

export default TaskerListSafe;
