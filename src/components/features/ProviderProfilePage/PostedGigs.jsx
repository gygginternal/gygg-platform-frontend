import React, { useEffect, useState } from 'react';
import styles from './PostedGigs.module.css';
import apiClient from '@api/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { decodeHTMLEntities } from '@utils/htmlEntityDecoder';

// Utility to format "time ago"
const timeAgo = date => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `Posted ${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `Posted ${Math.floor(diff / 3600)} hours ago`;
  return `Posted ${Math.floor(diff / 86400)} days ago`;
};

const STATUS_LABELS = {
  active: 'Active',
  open: 'Active',
  'offer waiting': 'Offer waiting',
  draft: 'Draft',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_STYLES = {
  active: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
    border: '1px solid #4caf50',
  },
  open: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
    border: '1px solid #4caf50',
  },
  'offer waiting': {
    backgroundColor: '#fff3cd',
    color: '#856404',
    border: '1px solid #ffc107',
  },
  draft: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    border: '1px solid #dee2e6',
  },
  completed: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #28a745',
  },
  cancelled: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #dc3545',
  },
};

function PostedGigs({ providerId, isOwnProfile }) {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const GIGS_PER_PAGE = 3;

  useEffect(() => {
    async function fetchPostedGigs() {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/gigs/awaiting-posted-gig');
        const allGigs = res.data.data.gigs || [];
        setGigs(allGigs);
        setPage(0);
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
              Post a Gig
            </Link>
          )}
        </div>
      </div>
    );
  }

  const handleGigClick = gigId => {
    // Navigate to posted gigs page with the specific gig ID to open the modal
    navigate(`/posted-gigs?gigId=${gigId}`);
  };

  const getStatusStyle = status => {
    // For posted gigs that are awaiting applications, they should be "Active"
    const normalizedStatus = status?.toLowerCase() || 'active';
    return STATUS_STYLES[normalizedStatus] || STATUS_STYLES.active;
  };

  const getStatusLabel = status => {
    // For posted gigs that are awaiting applications, they should be "Active"
    const normalizedStatus = status?.toLowerCase() || 'active';
    return STATUS_LABELS[normalizedStatus] || 'Active';
  };

  const totalPages = Math.ceil(gigs.length / GIGS_PER_PAGE);
  const paginatedGigs = gigs.slice(
    page * GIGS_PER_PAGE,
    (page + 1) * GIGS_PER_PAGE
  );

  return (
    <div className={styles.postedGigsSection}>
      <h2 className={styles.sectionTitle}>Posted Gigs</h2>
      <div className={styles.gigsList}>
        {paginatedGigs.map(gig => (
          <div
            className={styles.gigCard}
            key={gig._id}
            onClick={() => handleGigClick(gig._id)}
          >
            <div className={styles.gigContent}>
              <h3 className={styles.gigTitle}>
                {decodeHTMLEntities(gig.title)}
              </h3>
              <div className={styles.gigMeta}>
                <div className={styles.gigCardBadges}>
                  {gig.status === 'open' ? (
                    <span className={`${styles.statusBadge} ${styles.open}`}>
                      Open
                    </span>
                  ) : (
                    <span
                      className={`${styles.statusBadge}`}
                      style={getStatusStyle(gig.status)}
                    >
                      {getStatusLabel(gig.status)}
                    </span>
                  )}
                </div>
                <div className={styles.gigPostedDate}>
                  <Clock size={14} className={styles.clockIcon} />
                  <span>{timeAgo(gig.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {gigs.length > 0 && totalPages > 1 && (
        <div className={styles.paginationDots}>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={styles.dotButton}
              onClick={() => setPage(idx)}
              style={{
                cursor: 'pointer',
                margin: '0 4px',
                background: 'none',
                border: 'none',
                padding: 0,
              }}
            >
              <span className={idx === page ? styles.activeDot : styles.dot} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PostedGigs;
