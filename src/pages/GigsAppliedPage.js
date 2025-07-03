import React, { useEffect, useState } from 'react';
import apiClient from '../api/axiosConfig';
import styles from './GigsAppliedPage.module.css';
import ProfileSidebar from '../components/ProfileSidebar';
import { useAuth } from '../context/AuthContext';
import {
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from 'react-icons/fa';
import GigDetailsModal from '../components/GigDetailsModal';

const statusColors = {
  pending: '#ff9800',
  accepted: '#4caf50',
  rejected: '#f44336',
  cancelled: '#bdbdbd',
  completed: '#2196f3',
};

const statusIcons = {
  pending: <FaHourglassHalf />,
  accepted: <FaCheckCircle />,
  rejected: <FaTimesCircle />,
  cancelled: <FaTimesCircle />,
  completed: <FaCheckCircle />,
};

const GigsAppliedPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGig, setSelectedGig] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  useEffect(() => {
    if (user && user.role?.includes('tasker')) {
      const fetchGigs = async () => {
        setLoading(true);
        setError('');
        try {
          const res = await apiClient.get('/applications/my-gigs');
          setApplications(res.data.data || []);
        } catch (err) {
          setError('Failed to load applied gigs.');
        } finally {
          setLoading(false);
        }
      };
      fetchGigs();
    }
  }, [user]);

  const handleCardClick = async gig => {
    try {
      const res = await apiClient.get(`/gigs/${gig._id}`);
      setSelectedGig(res.data.data.gig);
      setSelectedApplicationId(gig.applicationId);
      setModalOpen(true);
    } catch (err) {
      setError('Failed to load gig details.');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedGig(null);
  };

  const handleApplicationUpdate = () => {
    // Refresh the applications list
    if (user && user.role?.includes('tasker')) {
      const fetchGigs = async () => {
        setLoading(true);
        setError('');
        try {
          const res = await apiClient.get('/applications/my-gigs');
          setApplications(res.data.data || []);
        } catch (err) {
          setError('Failed to load applied gigs.');
        } finally {
          setLoading(false);
        }
      };
      fetchGigs();
    }
  };

  if (user && !user.role?.includes('tasker')) {
    return (
      <div style={{ display: 'flex', gap: '32px' }}>
        <aside style={{ flex: '0 0 260px' }}>
          <ProfileSidebar />
        </aside>
        <main style={{ flex: 1 }}>
          <div className={styles.container}>
            <h2>Gigs You&apos;ve Applied To</h2>
            <p>This page is only available for taskers.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <aside className={styles.sidebarArea}>
          <ProfileSidebar />
        </aside>
        <main className={styles.mainFeedArea}>
          <div>
            <h2 className={styles.pageTitle}>
              <FaClipboardList style={{ marginRight: 8 }} />
              Gigs You&apos;ve Applied To
            </h2>
            {loading ? (
              <div className={styles.spinnerWrapper}>
                <div className={styles.spinner}></div>
              </div>
            ) : error ? (
              <p className={styles.error}>{error}</p>
            ) : applications.length === 0 ? (
              <div className={styles.emptyState}>
                <img
                  src="/assets/empty-state.svg"
                  alt="No gigs"
                  className={styles.emptyImg}
                />
                <h3>No Applications Yet</h3>
                <p>
                  You haven&apos;t applied to any gigs yet. Browse gigs and
                  start applying!
                </p>
              </div>
            ) : (
              <div className={styles.gigCardList}>
                {applications.map(gig => (
                  <div
                    key={gig._id}
                    className={styles.gigCard}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCardClick(gig)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ')
                        handleCardClick(gig);
                    }}
                    style={{
                      cursor: 'pointer',
                      background:
                        statusColors[gig.applicationStatus] || '#bdbdbd',
                    }}
                  >
                    <div className={styles.gigCardHeader}>
                      <span className={styles.gigTitle}>{gig.title}</span>
                      <span
                        className={styles.statusBadge}
                        style={{
                          background:
                            statusColors[gig.applicationStatus] || '#bdbdbd',
                        }}
                      >
                        {statusIcons[gig.applicationStatus] || (
                          <FaHourglassHalf />
                        )}{' '}
                        {gig.applicationStatus?.charAt(0).toUpperCase() +
                          gig.applicationStatus?.slice(1)}
                      </span>
                    </div>
                    <div className={styles.gigCardFooter}>
                      <span className={styles.categoryChip}>
                        {gig.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <GigDetailsModal
              gig={selectedGig}
              open={modalOpen}
              onClose={handleModalClose}
              onApply={handleApplicationUpdate}
              showRetract
              applicationId={selectedApplicationId}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default GigsAppliedPage;
