import { Link } from 'react-router-dom';
import styles from './RecommendedGigs.module.css'; // NEW CSS MODULE
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosConfig';
import logger from '../utils/logger';

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
      logger.error('Error fetching recommended gigs:', err);
    },
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
        ) : recommendedGigs && recommendedGigs.length > 0 ? (
          recommendedGigs.slice(0, 3).map(gig => (
            <div key={gig._id} className={styles.gigItem}>
              <div className={styles.gigContent}>
                <p className={styles.gigDescription}>
                  {formatGigDescription(gig)}
                </p>
                <Link to={`/gigs/${gig._id}`} className={styles.viewGigLink}>
                  View gig detail
                </Link>
              </div>
            </div>
          ))
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
