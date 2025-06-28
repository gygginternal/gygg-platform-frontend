// import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AwaitedPostedGigs.module.css'; // Single CSS module
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axiosConfig';
import logger from '../../utils/logger';

const AwaitedPostedGigs = () => {
  const {
    data: awaitedGigs,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['awaitedPostedGigs'],
    queryFn: async () => {
      const response = await apiClient.get('/gigs/awaiting-posted-gig');
      return response.data.data.gigs;
    },
    onError: err => {
      logger.error('Error fetching awaited posted gigs:', err);
    },
  });

  return (
    <section className={`${styles.awaitedSection} ${styles.container}`}>
      <div className={styles.sectionHeader}>
        <h4 className={styles.sectionTitleUnderlined}>Awaited Posted Gigs</h4>
      </div>
      <div className={styles.awaitedList}>
        {isLoading ? (
          <p>Loading awaited posted gigs...</p>
        ) : isError ? (
          <p className={styles.errorMessage}>
            {error?.message || 'Failed to load awaited posted gigs.'}
          </p>
        ) : awaitedGigs?.length > 0 ? (
          awaitedGigs.map(gig => (
            <div key={gig.id} className={styles.awaitedItem}>
              <div>
                <Link
                  to={`/gigs/${gig._id}`}
                  className={`${styles.viewGigLink} ${styles.underline}`}
                >
                  <p className={styles.awaitedDescription}>{gig.title}</p>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.errorMessage}>
            No awaited posted gigs found right now.
          </p>
        )}
      </div>
    </section>
  );
};

export default AwaitedPostedGigs;
