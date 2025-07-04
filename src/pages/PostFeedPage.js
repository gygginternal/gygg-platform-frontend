import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import PostCard from '../components/PostCard'; // Assuming you have this component
import styles from './PostFeedPage.module.css'; // Import CSS Modules

function PostFeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('recents'); // Default sort
  const [userLocation, setUserLocation] = useState(null); // { lat: number, lng: number }
  const [locationError, setLocationError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  // Function to fetch posts based on current state
  const fetchPosts = useCallback(
    async (page = 1, sort = sortOrder, location = userLocation) => {
      const isFirstPage = page === 1;
      // Set appropriate loading state
      if (isFirstPage) {
        setPosts([]); // Clear posts when changing sort or loading first page
        setLoading(true);
        setHasMore(true); // Assume there might be more initially
      } else {
        setIsLoadingMore(true); // Indicate loading more specifically
      }
      setError('');
      setLocationError(''); // Clear location error on new fetch attempt

      const params = {
        page,
        limit: 10, // Adjust limit as needed
        sort,
      };

      // Handle "Near Me" sorting requirements
      if (sort === 'near_me') {
        if (!location) {
          setError(
            'Location is required for "Near Me" sort. Please enable location access.'
          );
          setLoading(false);
          setIsLoadingMore(false);
          setHasMore(false);
          return; // Stop fetching if location is needed but not available
        }
        params.lat = location.lat;
        params.lng = location.lng;
        // params.distance = 20; // Example: Optional distance in km
      }

      try {
        const response = await apiClient.get('/posts', { params });
        const newPosts = response.data.data.posts;

        setPosts(prev => (isFirstPage ? newPosts : [...prev, ...newPosts]));
        setHasMore(newPosts.length === params.limit); // Check if more might exist
        setCurrentPage(page);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load posts.');
        setHasMore(false); // Stop pagination on error
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [sortOrder, userLocation]
  ); // Include dependencies that trigger refetch logic

  // Function to get user's location
  const getUserLocation = () => {
    setLocationError(''); // Clear previous errors
    setLoading(true); // Show loading indicator while getting location
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        // Fetch posts immediately with the obtained location for 'near_me'
        fetchPosts(1, 'near_me', location);
      },
      error => {
        let message = 'An unknown error occurred while getting location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              "Location permission denied. Enable location in browser settings for 'Near Me'.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Request to get user location timed out.';
            break;
          default:
            break;
        }
        setLocationError(message);
        setLoading(false); // Stop loading as location failed
        setHasMore(false); // Cannot paginate near_me without location
      },
      { timeout: 10000 } // Add a timeout for the request
    );
  };

  // Handle initial fetch and sort changes
  useEffect(() => {
    setCurrentPage(1); // Reset page when sort changes
    if (sortOrder === 'near_me') {
      // If location already known, fetch. Otherwise, try to get it.
      if (userLocation) {
        fetchPosts(1, 'near_me', userLocation);
      } else {
        getUserLocation(); // This will trigger fetch on success
      }
    } else {
      // Fetch for 'recents' or 'trending'
      fetchPosts(1, sortOrder, null);
    }
    // We only want this effect to run when sortOrder changes.
    // Location changes are handled separately or trigger fetch within getUserLocation.
  }, [sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handler for sort button clicks
  const handleSortChange = newSortOrder => {
    if (newSortOrder !== sortOrder) {
      setSortOrder(newSortOrder); // Changing sortOrder triggers useEffect
    }
  };

  // Callback to update a single post in the local 'posts' state
  const handleSinglePostUpdate = updatedPostData => {
    setPosts(currentPosts =>
      currentPosts.map(p =>
        p._id === updatedPostData._id ? updatedPostData : p
      )
    );
  };

  // Handler for loading more posts
  const loadMore = () => {
    if (!loading && !isLoadingMore && hasMore) {
      // Use the current sortOrder and userLocation state
      fetchPosts(currentPage + 1, sortOrder, userLocation);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Social Feed</h2>
      {/* Sorting Controls */}
      <div className={styles.sortControls}>
        <span className={styles.sortLabel}>Sort by: </span>
        <button
          onClick={() => handleSortChange('recents')}
          disabled={loading || sortOrder === 'recents'}
          className={`${styles.sortButton} ${sortOrder === 'recents' ? styles.sortButtonActive : ''}`}
        >
          Recents
        </button>
        <button
          onClick={() => handleSortChange('trending')}
          disabled={loading || sortOrder === 'trending'}
          className={`${styles.sortButton} ${sortOrder === 'trending' ? styles.sortButtonActive : ''}`}
        >
          Trending
        </button>
        <button
          onClick={() => handleSortChange('near_me')}
          disabled={loading || sortOrder === 'near_me'}
          className={`${styles.sortButton} ${sortOrder === 'near_me' ? styles.sortButtonActive : ''}`}
        >
          Near Me
        </button>
        {/* Show location error specific to Near Me */}
        {sortOrder === 'near_me' && locationError && (
          <span className={styles.errorMessageLocation}>{locationError}</span>
        )}
      </div>
      {/* General Error Display */}
      {error && <p className={styles.errorMessage}>{error}</p>}
      {/* Post List */}
      {posts.length > 0
        ? posts.map(post => (
            <PostCard
              key={post._id || post.id}
              post={post}
              onPostUpdate={handleSinglePostUpdate}
            />
          ))
        : !loading && (
            <p className={styles.noPostsMessage}>
              No posts found matching the criteria.
            </p>
          )}
      {/* Show only if not loading */}
      {/* Loading Indicators */}
      {loading && <p className={styles.loadingMessage}>Loading posts...</p>}
      {isLoadingMore && (
        <p className={styles.loadingMoreMessage}>Loading more...</p>
      )}
      {/* Load More Button */}
      {hasMore && !loading && !isLoadingMore && (
        <button onClick={loadMore} className={styles.loadMoreButton}>
          Load More Posts
        </button>
      )}
      {!hasMore && posts.length > 0 && (
        <p className={styles.endMessage}>You&apos;ve reached the end!</p>
      )}
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label htmlFor="categoryFilter">Category:</label>
          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default PostFeedPage;
