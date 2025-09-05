import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  Eye,
} from 'lucide-react';
import apiClient from '../../api/axiosConfig';
import { GigApplications } from '../../components/Shared/GigApplications';
import styles from './PostedGigsPage.module.css';
import ProfileSidebar from '../../components/Shared/ProfileSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import ProviderGigDetailsModal from '../../components/Shared/ProviderGigDetailsModal';

// Utility to check for valid MongoDB ObjectId
function isValidObjectId(id) {
  return (
    typeof id === 'string' && id.length === 24 && /^[a-fA-F0-9]{24}$/.test(id)
  );
}

const PostedGigsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const gigIdFromQuery = params.get('gigId');
  const viewFromQuery = params.get('view');

  const [postedGigs, setPostedGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGigId, setSelectedGigId] = useState(
    isValidObjectId(gigIdFromQuery) && viewFromQuery === 'applications'
      ? gigIdFromQuery
      : null
  );
  const [selectedGigTitle, setSelectedGigTitle] = useState('');
  const [selectedGigForModal, setSelectedGigForModal] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Fetch provider's posted gigs
    const fetchPostedGigs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/gigs/awaiting-posted-gig');
        setPostedGigs(res.data.data.gigs || []);
      } catch (err) {
        setError('Failed to load posted gigs.');
      } finally {
        setLoading(false);
      }
    };
    fetchPostedGigs();
  }, []);

  useEffect(() => {
    // If gigId is in query and valid, show popup for that gig (but not if view=applications)
    if (
      isValidObjectId(gigIdFromQuery) &&
      postedGigs.length > 0 &&
      viewFromQuery !== 'applications'
    ) {
      const gig = postedGigs.find(g => g._id === gigIdFromQuery);
      if (gig) {
        // Fetch full gig details and show modal
        fetchGigDetails(gig._id);
      }
    }
  }, [gigIdFromQuery, postedGigs, viewFromQuery]);

  useEffect(() => {
    // Set gig title when selectedGigId is set from URL
    if (selectedGigId && postedGigs.length > 0) {
      const gig = postedGigs.find(g => g._id === selectedGigId);
      if (gig) {
        setSelectedGigTitle(gig.title);
      }
    }
  }, [selectedGigId, postedGigs]);

  const fetchGigDetails = async gigId => {
    try {
      const res = await apiClient.get(`/gigs/${gigId}`);
      setSelectedGigForModal(res.data.data.gig);
      setModalOpen(true);
    } catch (err) {
      console.error('Error fetching gig details:', err);
    }
  };

  const handleGigClick = gig => {
    if (isValidObjectId(gig._id)) {
      setSelectedGigId(gig._id);
      setSelectedGigTitle(gig.title);
      navigate(`/posted-gigs?gigId=${gig._id}&view=applications`);
    }
  };

  const handleGigCardClick = async gig => {
    await fetchGigDetails(gig._id);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedGigForModal(null);
    // Remove gigId from URL when closing modal
    navigate('/posted-gigs', { replace: true });
  };

  const handleBackToGigs = () => {
    setSelectedGigId(null);
    setSelectedGigTitle('');
    navigate('/posted-gigs');
  };

  if (user && !user.role?.includes('provider')) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.sidebarArea}>
            <ProfileSidebar />
          </div>
          <div className={styles.mainFeedArea}>
            <div className={styles.container}>
              <h2>My Posted Gigs</h2>
              <div className={styles.state}>
                This page is only available for providers.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Switch-case style rendering
  if (selectedGigId) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.sidebarArea}>
            <ProfileSidebar />
          </div>
          <div className={styles.mainFeedArea}>
            <div className={styles.applicationsHeader}>
              <button
                className={styles.backButton}
                onClick={handleBackToGigs}
                aria-label="Back to My Posted Gigs"
              >
                <ArrowLeft size={20} />
                Back to My Posted Gigs
              </button>

              <h1 className={styles.title}>Applications</h1>
              <p className={styles.subtitle}>
                Review applications for <strong>"{selectedGigTitle}"</strong>
              </p>
            </div>
            <div className={styles.applicationsContainer}>
              <GigApplications gigId={selectedGigId} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: show posted gigs list
  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.sidebarArea}>
          <ProfileSidebar />
        </div>
        <div className={styles.mainFeedArea}>
          <div className={styles.header}>
            <h1 className={styles.title}>My Posted Gigs</h1>
            <p className={styles.subtitle}>
              Manage your posted gigs and view applications from taskers
            </p>
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading your posted gigs...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <div className={styles.errorIcon}>⚠️</div>
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : postedGigs.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No gigs posted yet</h3>
              <p>
                Start by creating your first gig to find helpers for your tasks
              </p>
              <button
                className={styles.createGigButton}
                onClick={() => navigate('/gigs/create')}
              >
                Create Your First Gig
              </button>
            </div>
          ) : (
            <div className={styles.gigsGrid}>
              {postedGigs.map(gig => (
                <div
                  key={gig._id}
                  className={styles.gigCard}
                  onClick={() => handleGigCardClick(gig)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.gigCardHeader}>
                    <h3 className={styles.gigCardTitle}>{gig.title}</h3>
                    <div className={styles.gigCardStatus}>
                      <span
                        className={`${styles.statusBadge} ${styles[gig.status || 'open']}`}
                      >
                        {gig.status === 'open' ? 'Active' : gig.status}
                      </span>
                    </div>
                  </div>

                  <div className={styles.gigCardContent}>
                    <p className={styles.gigCardDescription}>
                      {gig.description?.length > 120
                        ? `${gig.description.substring(0, 120)}...`
                        : gig.description || 'No description provided'}
                    </p>

                    <div className={styles.gigCardMeta}>
                      <div className={styles.metaItem}>
                        <DollarSign size={16} />
                        <span>{gig.cost || 'N/A'}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Calendar size={16} />
                        <span>
                          {new Date(gig.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {gig.location && (
                        <div className={styles.metaItem}>
                          <MapPin size={16} />
                          <span>{gig.location}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.gigCardStats}>
                      <div className={styles.statItem}>
                        <Users size={16} />
                        <span>{gig.applicationCount || 0} applications</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.gigCardActions}>
                    <button
                      className={styles.viewApplicationsButton}
                      onClick={e => {
                        e.stopPropagation();
                        handleGigClick(gig);
                      }}
                      aria-label={`View applications for ${gig.title}`}
                    >
                      <Eye size={16} />
                      View Applications
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProviderGigDetailsModal
        gig={selectedGigForModal}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default PostedGigsPage;
