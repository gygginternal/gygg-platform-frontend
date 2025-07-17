import React, { useEffect, useState } from 'react';
import styles from './RecentHires.module.css';
import apiClient from '../../api/axiosConfig';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

function RecentHires({ providerId, isOwnProfile }) {
  const [hires, setHires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRecentHires() {
      setLoading(true);
      setError('');
      try {
        // Fetch completed contracts for this provider
        const res = await apiClient.get('/contracts/my-contracts', {
          params: { status: 'completed', limit: 20 },
        });
        // Filter contracts where provider matches
        const contracts = res.data.data.contracts.filter(
          c => c.provider === providerId
        );
        // Extract unique taskers and their contracts
        const uniqueTaskers = [];
        const seen = new Set();
        for (const contract of contracts) {
          if (contract.tasker && !seen.has(contract.tasker)) {
            uniqueTaskers.push({
              tasker: contract.tasker,
              gigTitle: contract.gigTitle || contract.title,
              review: contract.review || contract.description || '',
              rating: contract.rating || 5,
              date:
                contract.completedAt ||
                contract.updatedAt ||
                contract.createdAt,
              gigId: contract.gigId,
            });
            seen.add(contract.tasker);
          }
        }
        setHires(uniqueTaskers.slice(0, 5));
      } catch (err) {
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
              Post Your First Gig
            </Link>
          )}
        </div>
      </div>
    );

  return (
    <div className={styles.recentHiresSection}>
      <h2 className={styles.sectionTitle}>Recent hires</h2>
      <div className={styles.hiresList}>
        {hires.map((hire, idx) => (
          <div className={styles.hireCard} key={idx}>
            {hire.gigId ? (
              <a href={`/gigs/${hire.gigId}`} className={styles.gigTitleLink}>
                {hire.gigTitle}
              </a>
            ) : (
              <span className={styles.gigTitleLink}>{hire.gigTitle}</span>
            )}
            <div className={styles.gigDoneBy}>
              Gig done by <b>{hire.tasker}</b>
            </div>
            <div className={styles.reviewText}>
              {hire.review ||
                'I am an easygoing and organized person who loves staying active and exploring new hobbies.'}
            </div>
            <div className={styles.ratingRow}>
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
    </div>
  );
}

export default RecentHires;
