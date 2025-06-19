// src/components/ProfilePage/ReviewsSection.js
import React, { useState, useEffect } from 'react';
import styles from './ReviewsSection.module.css';
import ReviewCard from './ReviewCard'; // Assuming this is your component for displaying a single review
import apiClient from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext'; // Not strictly needed if always using userIdToView
import logger from '../../utils/logger';

function ReviewsSection({ userIdToView, isOwnProfile }) {
  // Accept userIdToView and isOwnProfile
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user: loggedInUser } = useAuth();

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
        const response = await apiClient.get(
          `/reviews?taskerId=${targetUserIdForReviews}`
        );
        setReviews(response.data.data.reviews || []);
      } catch (err) {
        logger.error('ReviewsSection: Error fetching reviews:', err);
        setError('Could not load reviews.');
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if a target user is specified
    // Also, reviews are typically for taskers, so you might add that check.
    // However, your UserProfilePage already checks if profileUser is a tasker before rendering this.
    fetchReviews();
  }, [targetUserIdForReviews]);

  const renderContent = () => {
    if (loading) return <p>Loading reviews...</p>;
    if (error) return <p className={styles.errorMessage}>{error}</p>;
    if (reviews.length === 0) {
      return (
        <p>
          {isOwnProfile
            ? "You haven't received any reviews yet."
            : "This user hasn't received any reviews yet."}
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
      </div>
      <div className={styles.reviewsGrid}>{renderContent()}</div>
    </section>
  );
}
export default ReviewsSection;
