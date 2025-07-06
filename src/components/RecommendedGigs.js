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
          recommendedGigs.slice(0, 3).map(gig => {
            console.log('Recommended gig:', gig);
            const poster = gig.poster || {};
            const profileImage = poster.profileImage || '/default.jpg';
            const posterName =
              poster.firstName && poster.lastName
                ? `${poster.firstName.charAt(0).toUpperCase() + poster.firstName.slice(1)}. ${poster.lastName.charAt(0).toUpperCase()}`
                : poster.firstName || 'Anonymous';
            const location =
              poster.address?.city || poster.address?.state || '';
            return (
              <div key={gig._id} className={styles.gigItem}>
                <img
                  src={profileImage}
                  alt={posterName}
                  className={styles.gigAvatar}
                  width={56}
                  height={56}
                />
                <div className={styles.gigContent}>
                  <div className={styles.gigDescription}>
                    <strong>{posterName}</strong>
                    {location && ` from ${location}`} needs a {gig.title}
                  </div>
                  <Link
                    to={{ pathname: '/gigs', search: `?gigId=${gig._id}` }}
                    state={{ gigId: gig._id }}
                    className={styles.viewGigLink}
                  >
                    <b>
                      <u>View gig detail</u>
                    </b>
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
