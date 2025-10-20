// src/components/ProfilePage/ReviewsSection.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import apiClient from '../../../api/axiosConfig';
import styles from './ReviewsSection.module.css';
import ReviewCard from './ReviewCard';
import PropTypes from 'prop-types';
import logger from '../../../utils/logger';

// Reusable Star Display Component
const DisplayRating = ({ rating }) => {
  const stars = Math.round(rating || 0);
  return (
    <span className={styles.starRating}>
      {'★'.repeat(stars)}
      {'☆'.repeat(Math.max(0, 5 - stars))}
    </span>
  );
};

DisplayRating.propTypes = {
  rating: PropTypes.number.isRequired,
};

function ReviewsSection({ userIdToView, isOwnProfile }) {
  // Accept userIdToView and isOwnProfile
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user: _loggedInUser } = useAuth();

  // Determine whose reviews to fetch
  const targetUserIdForReviews = userIdToView;

  useEffect(() => {
    const fetchReviews = async () => {
      if (!targetUserIdForReviews) {
        logger.info('ReviewsSection: No targetUserId, cannot fetch reviews.');
        setLoading(false);
        setReviews([]);
        return;
      }
      setLoading(true);
      setError('');
      try {
        logger.info(
          `ReviewsSection: Fetching reviews for taskerId (reviewee): ${targetUserIdForReviews}`
        );
        // Fetch reviews where the targetUserId is the reviewee (Tasker)
        const [reviewsResponse, averageResponse] = await Promise.all([
          apiClient.get(`/reviews?taskerId=${targetUserIdForReviews}`),
          apiClient.get(`/reviews/average/${targetUserIdForReviews}`),
        ]);

        setReviews(reviewsResponse.data.data.reviews || []);
        setAverageRating(averageResponse.data.data.averageRating || 0);
      } catch (err) {
        logger.error('ReviewsSection: Error fetching reviews:', err);
        setError('Could not load reviews.');
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if a target user is specified
    fetchReviews();
  }, [targetUserIdForReviews]);

  const renderContent = () => {
    if (loading) return <p>Loading reviews...</p>;
    if (error) return <p className={styles.errorMessage}>{error}</p>;
    if (reviews.length === 0) {
      return (
        <p className={styles.noReviewsText}>
          {isOwnProfile
            ? "Take some gig and get reviewed"
            : "No reviews yet"}
        </p>
      );
    }
    return reviews.map(review => (
      <ReviewCard key={review._id} review={review} />
    ));
  };

  return (
    <section className={styles.reviewsCard}>
      <div className={styles.reviewsHeader}>
        <h2>Reviews Received</h2>
        {reviews.length > 0 && (
          <div className={styles.reviewsSummary}>
            <span className={styles.averageRating}>
              {averageRating.toFixed(1)}
            </span>
            <DisplayRating rating={averageRating} />
            <span className={styles.reviewsCount}>
              ({reviews.length} reviews)
            </span>
          </div>
        )}
      </div>
      <div className={styles.reviewsGrid}>{renderContent()}</div>
    </section>
  );
}

ReviewsSection.propTypes = {
  userIdToView: PropTypes.string,
  isOwnProfile: PropTypes.bool.isRequired,
};

export default ReviewsSection;
