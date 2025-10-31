import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Users,
  Eye,
} from 'lucide-react';
import apiClient from '../../api/axiosConfig';
import { GigApplications } from '../../components/common/GigApplications';
import styles from './PostedGigsPage.module.css';
import ProfileSidebar from '../../components/common/ProfileSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import ProviderGigDetailsModal from '../../components/common/ProviderGigDetailsModal';
import Button from '../../components/common/Button';

// Utility to check for valid MongoDB ObjectId
function isValidObjectId(id) {
  return (
    typeof id === 'string' && id.length === 24 && /^[a-fA-F0-9]{24}$/.test(id)
  );
}

// Utility to format "time ago"
const timeAgo = date => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `Posted ${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `Posted ${Math.floor(diff / 3600)} hours ago`;
  return `Posted ${Math.floor(diff / 86400)} days ago`;
};

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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPostedGigs = async (pageToFetch = 1) => {
    try {
      const isFirstPage = pageToFetch === 1;
      if (isFirstPage) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const res = await apiClient.get('/gigs/awaiting-posted-gig', {
        params: {
          page: pageToFetch,
          limit: 10 // Load 10 gigs per page
        }
      });
      
      // Extract pagination data
      const totalPages = res.data.totalPages || 1;
      const currentPage = res.data.page || 1;
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
      setHasMore(res.data.hasMore || (currentPage < totalPages));
      
      const gigsData = res.data.data.gigs || [];
      
      if (isFirstPage) {
        setPostedGigs(gigsData);
      } else {
        setPostedGigs(prev => [...prev, ...gigsData]);
      }
    } catch (err) {
      setError('Failed to load posted gigs.');
      if (currentPage === 1) setPostedGigs([]);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    // Fetch provider's posted gigs
    setCurrentPage(1);
    setPostedGigs([]);
    setTotalPages(1);
    setHasMore(false);
    fetchPostedGigs(1);
  }, []);

  // Load more gigs
  const loadMoreGigs = () => {
    if (hasMore && !isLoadingMore) {
      const nextPage = currentPage + 1;
      fetchPostedGigs(nextPage);
    }
  };

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
            <button
              className={styles.backButton}
              onClick={handleBackToGigs}
              aria-label="Back to My Posted Gigs"
            >
              <ArrowLeft size={20} />
              Back to My Posted Gigs
            </button>
            
            <div className={styles.header}>
              <h1 className={styles.title}>Applications</h1>
              <p className={styles.subtitle}>
                Review applications for <strong>"{selectedGigTitle}"</strong>
              </p>
            </div>
            
            <GigApplications gigId={selectedGigId} />
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
          {user && user.role?.includes('provider') && (
            <div className={styles.buttonContainer}>
              <Button
                onClick={() => navigate('/gigs/create')}
                className={styles.postGigButton}
              >
                + Post a Gig
              </Button>
            </div>
          )}

          {loading && postedGigs.length === 0 ? (
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
                onClick={() => {
                  setCurrentPage(1);
                  setPostedGigs([]);
                  setTotalPages(1);
                  setHasMore(false);
                  fetchPostedGigs(1);
                }}
              >
                Try Again
              </button>
            </div>
          ) : postedGigs.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No gigs posted yet</h3>
              <p>
                Create a gig to find taskers to help
              </p>
              <button
                className={styles.createGigButton}
                onClick={() => navigate('/gigs/create')}
              >
                Create a gig
              </button>
            </div>
          ) : (
            <>
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
                      <div className={styles.gigCardBadges}>
                        {gig.status === 'open' ? (
                          <span className={`${styles.statusBadge} ${styles.open}`}>Open</span>
                        ) : (
                          <span
                            className={`${styles.statusBadge} ${styles[gig.status || 'open']}`}
                          >
                            {gig.status || 'Open'}
                          </span>
                        )}
                        <span
                          className={`${styles.paymentTypeBadge} ${gig.isHourly ? styles.hourly : styles.fixed}`}
                        >
                          {gig.isHourly ? 'Hourly' : 'Fixed'}
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
                          <MapPin size={16} />
                          <span>
                            {gig.location && typeof gig.location === 'object' 
                              ? `${gig.location.city || ''}${gig.location.city && gig.location.state ? ', ' : ''}${gig.location.state || ''}`.trim()
                              : gig.location || 'Location not specified'}
                          </span>
                        </div>
                        <div className={styles.metaItem}>
                          <Clock size={16} />
                          <span>
                            {timeAgo(gig.createdAt)}
                          </span>
                        </div>
                        <div className={styles.metaItem}>
                          <span>
                            {gig.isHourly
                              ? `$${gig.ratePerHour || 0}/hr${gig.estimatedHours ? ` (Est. ${gig.estimatedHours}h)` : ''}`
                              : `$${gig.cost || 0}`}
                          </span>
                        </div>
                      </div>

                      <div className={styles.gigCardFooter}>
                        <div className={styles.gigCardStats}>
                          <div className={styles.statItem}>
                            <Users size={16} />
                            <span>{gig.applicationCount || 0} applications</span>
                          </div>
                        </div>
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
                  </div>
                ))}
              </div>
              
              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className={styles.loadingMore}>
                  <div className={styles.loadingSpinnerSmall}></div>
                  <p>Loading more gigs...</p>
                </div>
              )}
              
              {/* Load More Button */}
              {hasMore && !isLoadingMore && (
                <button 
                  onClick={loadMoreGigs}
                  className={styles.loadMoreButton}
                >
                  Load More Gigs
                </button>
              )}
              
              {!hasMore && postedGigs.length > 0 && (
                <p className={styles.endOfResults}>
                  You've reached the end of the results.
                </p>
              )}
            </>
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
