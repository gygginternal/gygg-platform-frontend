import { Link } from 'react-router-dom';
import styles from './RecommendedGigs.module.css'; // NEW CSS MODULE
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axiosConfig';
import logger from '../../utils/logger';

const RecommendedGigs = () => {
  const {
    data: recommendedGigs,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['recommendedGigs'],
    queryFn: async () => {
      const response = await apiClient.get('/gigs/top-match');
      return response.data.data;
    },
    onError: err => {
      // Check if it's a rate limiting error (either server-side 429 or client-side isClientThrottled)
      if (err.response?.status === 429) {
        logger.warn('Rate limited when fetching recommended gigs:', err.response.data);
      } else if (err.isClientThrottled) {
        logger.warn('Client-side rate limited when fetching recommended gigs');
      } else {
        logger.error('Error fetching recommended gigs:', err);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - don't refetch within 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes - cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnReconnect: false, // Don't refetch on reconnection
    retry: (failureCount, error) => {
      // Don't retry if it's a 429 (rate limit) error or client-side throttling, as retrying will just cause more rate limiting
      if (error?.response?.status === 429 || error?.isClientThrottled) return false;
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: 1000, // Wait 1 second before retrying
  });

  const formatGigDescription = gig => {
    const posterName = [gig.poster?.firstName, gig.poster?.lastName]
      .filter(Boolean)
      .join(' ');
    const location =
      gig.poster?.address?.city || gig.poster?.address?.state || '';
    return `${posterName}${
      location ? ` from ${location}` : ''
    } needs help with "${gig.title}"`;
  };

  return (
    <section className={styles.gigsSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>
          <img
            src="/assets/profile-2user.svg"
            alt="Profile"
            width={20}
            height={20}
          />
        </div>
        <h4 className={styles.sectionTitle}>Open Gigs You Might Like</h4>
      </div>
      <div className={styles.gigsList}>
        {isLoading ? (
          <p>Loading recommended gigs...</p>
        ) : isError ? (
          <p className={styles.errorMessage}>
            {error?.message || 'Failed to load recommended gigs.'}
          </p>
        ) : recommendedGigs &&
          recommendedGigs.gigs &&
          recommendedGigs.gigs.length > 0 ? (
          recommendedGigs.gigs.slice(0, 3).map(gig => {
            const poster = gig.poster || {};
            const profileImage = poster.profileImage || '/default.jpg';
            return (
              <div key={gig._id} className={styles.gigItem}>
                <img
                  src={profileImage}
                  alt={`${poster.firstName || ''} ${poster.lastName || ''}`}
                  className={styles.gigAvatar}
                  width={64}
                  height={64}
                />
                <div className={styles.gigContent}>
                  <div className={styles.gigDescription}>
                    <strong>
                      {poster.firstName || ''} {poster.lastName || ''}
                    </strong>{' '}
                    needs help with {gig.title}
                  </div>
                  <Link
                    to={{ pathname: '/gigs', search: `?gigId=${gig._id}` }}
                    state={{ gigId: gig._id }}
                    className={styles.viewGigLink}
                  >
                    <u>View gig detail</u>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <p className={styles.errorMessage}>
            No recommended gigs found right now.
          </p>
        )}
      </div>
    </section>
  );
};

export default RecommendedGigs;
