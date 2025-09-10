import React, { useEffect, useState } from 'react';
import styles from './RecentHires.module.css';
import apiClient from '../../api/axiosConfig';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

function RecentHires({ providerId, isOwnProfile }) {
  const [hires, setHires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const HIRES_PER_PAGE = 3;

  useEffect(() => {
    async function fetchRecentHires() {
      setLoading(true);
      setError('');
      try {
        // Fetch completed contracts for this provider
        const res = await apiClient.get('/contracts/my-contracts', {
          params: { status: 'completed', limit: 20 },
        });
        
        // Log the response for debugging
        console.log('Contracts response:', res.data);
        
        // Filter contracts where the logged-in user is the provider
        const contracts = res.data.data.contracts.filter(
          c => c.providerId === providerId || c.provider === providerId
        );
        
        // Log the filtered contracts
        console.log('Filtered contracts:', contracts);
        
        // Extract unique taskers and their contracts
        const uniqueTaskers = [];
        const seen = new Set();
        for (const contract of contracts) {
          // Get tasker details from the contract
          // Tasker information might be in different fields depending on how the API returns data
          const taskerInfo = contract.tasker || contract.taskerDetails || {};
          
          // Extract tasker name
          let taskerName = 'Unknown Tasker';
          if (taskerInfo.fullName) {
            taskerName = taskerInfo.fullName;
          } else if (taskerInfo.firstName || taskerInfo.lastName) {
            taskerName = `${taskerInfo.firstName || ''} ${taskerInfo.lastName || ''}`.trim();
          } else if (taskerInfo.displayName) {
            taskerName = taskerInfo.displayName;
          } else if (contract.taskerName) {
            taskerName = contract.taskerName;
          }
          
          // Get the tasker ID - could be in different fields
          const taskerId = contract.taskerId || taskerInfo._id || taskerInfo.id || contract.tasker;
          
          // Get actual rating or default to 0 if not available
          const rating = contract.rating && contract.rating > 0 ? contract.rating : 0;
          
          // Only add if we haven't seen this tasker yet
          if (taskerId && !seen.has(taskerId)) {
            uniqueTaskers.push({
              taskerId: taskerId,
              taskerName: taskerName,
              gigTitle: contract.gig?.title || contract.gigTitle || contract.title || 'Untitled Gig',
              review: contract.review || contract.description || 'No review provided',
              rating: rating,
              date: contract.completedAt || contract.updatedAt || contract.createdAt,
              gigId: contract.gig?._id || contract.gigId || contract.gig,
            });
            seen.add(taskerId);
          }
        }
        setHires(uniqueTaskers);
        setPage(0);
      } catch (err) {
        console.error('Error fetching recent hires:', err);
        setError('Could not load recent hires.');
      } finally {
        setLoading(false);
      }
    }
    fetchRecentHires();
  }, [providerId]);

  if (loading)
    return <div className={styles.state}>Loading recent hires...</div>;
  if (error) return <div className={styles.state}>{error}</div>;
  if (!hires.length)
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Recent Hires</h2>
        </div>
        <div className={styles.emptyMessage}>
          <p>
            {isOwnProfile
              ? "You haven't hired any taskers yet."
              : "This provider hasn't hired any taskers yet."}
          </p>
          {isOwnProfile && (
            <Link to="/gigs/create" className={styles.createActionButton}>
              Hire someone for the Gig
            </Link>
          )}
        </div>
      </div>
    );

  const totalPages = Math.ceil(hires.length / HIRES_PER_PAGE);
  const paginatedHires = hires.slice(
    page * HIRES_PER_PAGE,
    (page + 1) * HIRES_PER_PAGE
  );

  return (
    <div className={styles.recentHiresSection}>
      <h2 className={styles.sectionTitle}>Recent hires</h2>
      <div className={styles.hiresList}>
        {paginatedHires.map((hire, idx) => (
          <div className={styles.hireCard} key={idx}>
            {hire.gigId ? (
              <a href={`/gigs/${hire.gigId}`} className={styles.gigTitleLink}>
                {hire.gigTitle}
              </a>
            ) : (
              <span className={styles.gigTitleLink}>{hire.gigTitle}</span>
            )}
            <div className={styles.gigDoneBy}>
              Gig done by <b>{hire.taskerName}</b>
            </div>
            <div className={styles.reviewText}>
              {hire.review}
            </div>
            <div className={styles.ratingRow}>
              {hire.rating > 0 ? (
                <>
                  <span className={styles.ratingValue}>
                    {hire.rating.toFixed(1)}
                  </span>
                  <span className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < Math.round(hire.rating) ? '#FFA726' : '#E0E0E0'}
                        color={i < Math.round(hire.rating) ? '#FFA726' : '#E0E0E0'}
                      />
                    ))}
                  </span>
                </>
              ) : (
                <span className={styles.noRating}>Not rated yet</span>
              )}
              <span className={styles.hireDate}>
                {hire.date
                  ? new Date(hire.date).toLocaleDateString('en-US', {
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {hires.length > 0 && totalPages > 1 && (
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

export default RecentHires;
