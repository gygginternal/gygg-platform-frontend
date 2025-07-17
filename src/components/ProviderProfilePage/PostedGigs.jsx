import React, { useEffect, useState } from 'react';
import styles from './PostedGigs.module.css';
import apiClient from '../../api/axiosConfig';
import { Link } from 'react-router-dom';

const STATUS_LABELS = {
  active: 'Active',
  'offer waiting': 'Offer waiting',
  draft: 'Draft',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
const STATUS_COLORS = {
  active: '#1abc9c',
  'offer waiting': '#f4b400',
  draft: '#b0b8c1',
  completed: '#4caf50',
  cancelled: '#e57373',
};

function PostedGigs({ providerId, isOwnProfile }) {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPostedGigs() {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/gigs', {
          params: { postedBy: providerId, limit: 5, sort: 'recent' },
        });
        setGigs(res.data.data.gigs || []);
      } catch (err) {
        setError('Could not load posted gigs.');
      } finally {
        setLoading(false);
      }
    }
    fetchPostedGigs();
  }, [providerId]);

  if (loading)
    return <div className={styles.state}>Loading posted gigs...</div>;
  if (error) return <div className={styles.state}>{error}</div>;
  if (!gigs.length) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Posted Gigs</h2>
        </div>
        <div className={styles.emptyMessage}>
          <p>
            {isOwnProfile
              ? "You haven't posted any gigs yet."
              : "This provider hasn't posted any gigs yet."}
          </p>
          {isOwnProfile && (
            <Link to="/gigs/create" className={styles.createActionButton}>
              Post Your First Gig
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.postedGigsSection}>
      <h2 className={styles.sectionTitle}>Posted Gigs</h2>
      <div className={styles.gigsList}>
        {gigs.map(gig => (
          <div className={styles.gigCard} key={gig._id}>
            {gig._id ? (
              <a href={`/gigs/${gig._id}`} className={styles.gigTitleLink}>
                {gig.title}
              </a>
            ) : (
              <span className={styles.gigTitleLink}>{gig.title}</span>
            )}
            <div className={styles.gigStatusRow}>
              <span
                className={styles.statusBadge}
                style={{
                  background:
                    STATUS_COLORS[gig.status?.toLowerCase()] || '#b0b8c1',
                }}
              >
                {STATUS_LABELS[gig.status?.toLowerCase()] ||
                  gig.status ||
                  'Draft'}
              </span>
              <span className={styles.gigPostedDate}>
                Posted{' '}
                {gig.createdAt
                  ? new Date(gig.createdAt).toLocaleDateString('en-US', {
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostedGigs;
