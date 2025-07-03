import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import { GigApplications } from '../components/GigApplications';
import styles from './PostedGigsPage.module.css';
import ProfileSidebar from '../components/ProfileSidebar';
import { useAuth } from '../context/AuthContext';

const PostedGigsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const gigIdFromQuery = params.get('gigId');

  const [postedGigs, setPostedGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGigId, setSelectedGigId] = useState(gigIdFromQuery || null);
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
    // If gigId is in query, show applications for that gig
    if (gigIdFromQuery) {
      setSelectedGigId(gigIdFromQuery);
      // Find gig title for display
      const gig = postedGigs.find(g => g._id === gigIdFromQuery);
      setSelectedGigTitle(gig ? gig.title : '');
    }
  }, [gigIdFromQuery, postedGigs]);

  const handleGigClick = gig => {
    setSelectedGigId(gig._id);
    setSelectedGigTitle(gig.title);
    navigate(`/posted-gigs?gigId=${gig._id}`);
  };

  const handleBackToGigs = () => {
    setSelectedGigId(null);
    setSelectedGigTitle('');
    navigate('/posted-gigs');
  };

  if (user && !user.role?.includes('provider')) {
    return (
      <div style={{ display: 'flex', gap: '32px' }}>
        <aside style={{ flex: '0 0 260px' }}>
          <ProfileSidebar />
        </aside>
        <main style={{ flex: 1 }}>
          <div className={styles.container}>
            <h2>My Posted Gigs</h2>
            <p>This page is only available for providers.</p>
          </div>
        </main>
      </div>
    );
  }

  // Switch-case style rendering
  if (selectedGigId) {
    return (
      <div style={{ display: 'flex', gap: '32px' }}>
        <aside style={{ flex: '0 0 260px' }}>
          <ProfileSidebar />
        </aside>
        <main style={{ flex: 1 }}>
          <div className={styles.container}>
            <button className={styles.backBtn} onClick={handleBackToGigs}>
              ← Back to My Posted Gigs
            </button>
            <h2>Applications for &quot;{selectedGigTitle}&quot;</h2>
            <GigApplications gigId={selectedGigId} />
          </div>
        </main>
      </div>
    );
  }

  // Default: show posted gigs list
  return (
    <div style={{ display: 'flex', gap: '32px' }}>
      <aside style={{ flex: '0 0 260px' }}>
        <ProfileSidebar />
      </aside>
      <main style={{ flex: 1 }}>
        <div className={styles.container}>
          <h2>My Posted Gigs</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : postedGigs.length === 0 ? (
            <p>No gigs posted yet.</p>
          ) : (
            <ul className={styles.gigList}>
              {postedGigs.map(gig => (
                <li key={gig._id} className={styles.gigListItem}>
                  <span>{gig.title}</span>
                  <button
                    className={styles.viewApplicationsBtn}
                    onClick={() => handleGigClick(gig)}
                  >
                    View Applications
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default PostedGigsPage;
