import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';
import { GigApplications } from '../../components/Shared/GigApplications';
import styles from './PostedGigsPage.module.css';
import ProfileSidebar from '../../components/Shared/ProfileSidebar';
import { useAuth } from '../../contexts/AuthContext';

// Utility to check for valid MongoDB ObjectId
function isValidObjectId(id) {
  return (
    typeof id === 'string' && id.length === 24 && /^[a-fA-F0-9]{24}$/.test(id)
  );
}

const PostedGigsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const gigIdFromQuery = params.get('gigId');

  const [postedGigs, setPostedGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGigId, setSelectedGigId] = useState(
    isValidObjectId(gigIdFromQuery) ? gigIdFromQuery : null
  );
  const [selectedGigTitle, setSelectedGigTitle] = useState('');

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
    // If gigId is in query and valid, show applications for that gig
    if (isValidObjectId(gigIdFromQuery)) {
      setSelectedGigId(gigIdFromQuery);
      // Find gig title for display
      const gig = postedGigs.find(g => g._id === gigIdFromQuery);
      setSelectedGigTitle(gig ? gig.title : '');
    } else {
      setSelectedGigId(null);
      setSelectedGigTitle('');
    }
  }, [gigIdFromQuery, postedGigs]);

  const handleGigClick = gig => {
    if (isValidObjectId(gig._id)) {
      setSelectedGigId(gig._id);
      setSelectedGigTitle(gig.title);
      navigate(`/posted-gigs?gigId=${gig._id}`);
    }
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
            <div className={styles.container}>
              <button
                className={styles.backBtn}
                onClick={handleBackToGigs}
                aria-label="Back to My Posted Gigs"
              >
                &larr; Back to My Posted Gigs
              </button>
              <h2>Applications for &quot;{selectedGigTitle}&quot;</h2>
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
          <div className={styles.container}>
            <h2>My Posted Gigs</h2>
            {loading ? (
              <div className={styles.state}>Loading your posted gigs...</div>
            ) : error ? (
              <div className={styles.state}>{error}</div>
            ) : postedGigs.length === 0 ? (
              <div className={styles.state}>
                You haven&apos;t posted any gigs yet. Start by creating your
                first gig!
              </div>
            ) : (
              <ul className={styles.gigList} aria-label="List of posted gigs">
                {postedGigs.map(gig => (
                  <li key={gig._id} className={styles.gigListItem}>
                    <span className={styles.gigTitle}>{gig.title}</span>
                    <button
                      className={`${styles.viewApplicationsBtn} ${styles.viewApplicationsBtnWhite}`}
                      onClick={() => handleGigClick(gig)}
                      aria-label={`View applications for ${gig.title}`}
                    >
                      View Applications
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostedGigsPage;
