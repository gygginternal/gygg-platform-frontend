import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './AwaitedPostedGigs.module.css'; // Single CSS module
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axiosConfig';
import logger from '../../utils/logger';
import PropTypes from 'prop-types';
import ProviderGigDetailsModal from './ProviderGigDetailsModal';

const AwaitedPostedGigs = () => {
  const [selectedGig, setSelectedGig] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  // Limit to 3 most recent gigs
  const recentGigs = awaitedGigs?.slice(0, 3) || [];

  const handleGigClick = async (gig, e) => {
    e.preventDefault();
    try {
      // Fetch full gig details for the modal
      const res = await apiClient.get(`/gigs/${gig._id}`);
      setSelectedGig(res.data.data.gig);
      setModalOpen(true);
    } catch (err) {
      logger.error('Error fetching gig details:', err);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedGig(null);
  };

  return (
    <section className={`${styles.awaitedSection} ${styles.container}`}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>
          <img src="/assets/lamp-on.svg" alt="Lamp" width={20} height={20} />
        </div>
        <h4 className={styles.sectionTitle}>Posted Gigs</h4>
      </div>
      <div className={styles.awaitedList}>
        {isLoading ? (
          <p>Loading awaited posted gigs...</p>
        ) : isError ? (
          <p className={styles.errorMessage}>
            {error?.message || 'Failed to load awaited posted gigs.'}
          </p>
        ) : recentGigs?.length > 0 ? (
          recentGigs.map(gig => (
            <div key={gig._id} className={styles.awaitedItem}>
              <div>
                <Link
                  to={`/gigs/${gig._id}`}
                  className={`${styles.viewGigLink}`}
                  onClick={e => handleGigClick(gig, e)}
                >
                  <p className={styles.awaitedDescription}>{gig.title}</p>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.errorMessage}>
            You haven't posted a gig. Post a gig to hire someone for help.
          </p>
        )}
      </div>

      <ProviderGigDetailsModal
        gig={selectedGig}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
};

AwaitedPostedGigs.propTypes = {
  // No props to add PropTypes for, but ensure accessibility and remove unused imports if any.
};

export default AwaitedPostedGigs;
