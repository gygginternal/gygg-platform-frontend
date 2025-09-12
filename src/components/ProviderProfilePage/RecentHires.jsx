import React, { useEffect, useState } from 'react';
import styles from './RecentHires.module.css';
import apiClient from '../../api/axiosConfig';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { decodeHTMLEntities } from '../../utils/htmlEntityDecoder';

function RecentHires({ providerId, isOwnProfile }) {
  const [hires, setHires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const HIRES_PER_PAGE = 6;

  useEffect(() => {
    async function fetchRecentHires() {
      setLoading(true);
      setError('');
      try {
        // Fetch completed contracts for this provider with pagination
        const res = await apiClient.get('/contracts/my-contracts', {
          params: { 
            status: 'completed', 
            page: page,
            limit: HIRES_PER_PAGE
          },
        });
        
        const contracts = res.data.data.contracts;
        setTotalPages(res.data.data.totalPages);
        setTotalCount(res.data.data.total);
        
        // Filter contracts to only include those where the current user is the provider
        const providerContracts = contracts.filter(contract => 
          contract.providerId === providerId || contract.provider === providerId
        );
        
        // Transform contracts to hires with review information
        const hiresWithReviews = await Promise.all(
          providerContracts.map(async (contract) => {
            // Extract tasker information
            let taskerName = 'Unknown Tasker';
            let taskerImage = null;
            let taskerId = null;
            
            // Handle populated tasker object
            if (contract.tasker && typeof contract.tasker === 'object') {
              const firstName = contract.tasker.firstName || '';
              const lastName = contract.tasker.lastName || '';
              taskerName = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown Tasker';
              taskerImage = contract.tasker.profileImage || null;
              taskerId = contract.tasker._id || contract.tasker.id;
            } 
            // Handle tasker as string ID
            else if (typeof contract.tasker === 'string' && contract.tasker.length > 0) {
              taskerName = contract.tasker;
              taskerId = contract.tasker;
            }
            
            // Validate taskerImage to ensure it's a proper URL
            if (taskerImage) {
              // Remove any invalid image URLs
              const trimmedImage = taskerImage.trim();
              if (trimmedImage === 'null' || trimmedImage === 'undefined' || trimmedImage === '' || 
                  (!trimmedImage.startsWith('http') && !trimmedImage.startsWith('/'))) {
                taskerImage = null;
              } else {
                taskerImage = trimmedImage;
              }
            }
            
            // Debug logging removed for production
            
            // Extract gig information
            let gigTitle = 'Untitled Gig';
            let gigId = null;
            
            // Handle populated gig object
            if (contract.gig && typeof contract.gig === 'object' && contract.gig.title) {
              gigTitle = contract.gig.title;
              gigId = contract.gig._id || contract.gig.id;
            } 
            // Handle gigTitle field
            else if (contract.gigTitle) {
              gigTitle = contract.gigTitle;
            }
            
            // Check if a review exists for this contract
            let reviewData = null;
            let hasReview = false;
            try {
              const reviewRes = await apiClient.get(`/reviews?contract=${contract.id || contract._id || contract.contractId}`);
              if (reviewRes.data.data.reviews && reviewRes.data.data.reviews.length > 0) {
                reviewData = reviewRes.data.data.reviews[0];
                hasReview = true;
              }
            } catch (reviewErr) {
              // No review found, which is fine
            }
            
            return {
              contractId: contract.id || contract._id || contract.contractId,
              taskerId: taskerId,
              taskerName: decodeHTMLEntities(taskerName),
              taskerImage: taskerImage,
              gigTitle: decodeHTMLEntities(gigTitle),
              review: decodeHTMLEntities(reviewData?.comment) || 'No review provided',
              rating: reviewData?.rating || 0,
              date: contract.completedAt || contract.updatedAt || contract.createdAt,
              gigId: gigId,
              hasReview: hasReview
            };
          })
        );
        
        setHires(hiresWithReviews);
      } catch (err) {
        console.error('Error fetching recent hires:', err);
        setError('Could not load recent hires.');
      } finally {
        setLoading(false);
      }
    }
    fetchRecentHires();
  }, [providerId, page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

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

  return (
    <div className={styles.recentHiresSection}>
      <h2 className={styles.sectionTitle}>Recent hires{totalCount > 0 ? ` (${totalCount})` : ''}</h2>
      <div className={styles.hiresList}>
        {hires.map((hire, idx) => (
          <div className={styles.hireCard} key={`${hire.contractId}-${idx}`}>
            <div className={styles.hireHeader}>
              {hire.taskerImage && hire.taskerImage !== 'null' && hire.taskerImage !== 'undefined' && hire.taskerImage.trim() !== '' && (hire.taskerImage.startsWith('http') || hire.taskerImage.startsWith('/')) ? (
              <div className={styles.avatarContainer}>
                <img 
                  src={hire.taskerImage} 
                  alt={hire.taskerName}
                  className={styles.taskerAvatar}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.querySelector(`.${styles.avatarPlaceholder}`).style.display = 'flex';
                  }}
                />
                <div className={styles.avatarPlaceholder} style={{display: 'none'}}>
                  {hire.taskerName && hire.taskerName !== 'Unknown Tasker' && hire.taskerName.length > 0 ? 
                    hire.taskerName.charAt(0).toUpperCase() : '?'}
                </div>
              </div>
            ) : (
              <div className={styles.avatarContainer}>
                <div className={styles.avatarPlaceholder} style={{display: 'flex'}}>
                  {hire.taskerName && hire.taskerName !== 'Unknown Tasker' && hire.taskerName.length > 0 ? 
                    hire.taskerName.charAt(0).toUpperCase() : '?'}
                </div>
              </div>
            )}
              <div className={styles.hireInfo}>
                <div className={styles.hireName}>{decodeHTMLEntities(hire.taskerName)}</div>
                <div className={styles.hireDate}>
                  {hire.date
                    ? new Date(hire.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : ''}
                </div>
              </div>
            </div>
            
                          {hire.gigId ? (
                <a href={`/gigs/${hire.gigId}`} className={styles.gigTitleLink}>
                  {decodeHTMLEntities(hire.gigTitle)}
                </a>
              ) : (
                <span className={styles.gigTitleLink}>{decodeHTMLEntities(hire.gigTitle)}</span>
              )}
            
            <div className={styles.reviewSection}>
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
              </div>
              
              <div className={styles.reviewText}>
                {decodeHTMLEntities(hire.review)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.paginationDots}>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={styles.dotButton}
              onClick={() => handlePageChange(idx + 1)}
              style={{
                cursor: 'pointer',
                margin: '0 4px',
                background: 'none',
                border: 'none',
                padding: 0,
              }}
            >
              <span className={idx + 1 === page ? styles.activeDot : styles.dot} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentHires;
