// src/components/ProfilePage/ReviewCard.js
import styles from './ReviewCard.module.css'; // Create CSS Module
import PropTypes from 'prop-types';

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

function ReviewCard({ review }) {
  // Accept full review object
  if (!review) return null;

  // Assuming backend populates reviewer and gig
  const reviewerName =
    review.reviewer?.fullName ||
    `${review.reviewer?.firstName} ${review.reviewer?.lastName}`.trim() ||
    'Anonymous';
  const gigTitle = review.gig?.title || 'A Completed Gig';
  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString()
    : '';

  // Get first initial for avatar if no image
  const reviewerInitial = reviewerName.charAt(0).toUpperCase();

  return (
    <div className={styles.reviewItem}>
      <div className={styles.reviewHeader}>
        <div className={styles.reviewerInfo}>
          {review.reviewer?.profileImage ? (
            <img
              src={review.reviewer.profileImage}
              alt={reviewerName}
              className={styles.reviewerAvatar}
            />
          ) : (
            <div className={styles.reviewerAvatar}>{reviewerInitial}</div>
          )}
          <h3 className={styles.reviewerName}>{reviewerName}</h3>
        </div>
        <div className={styles.reviewMeta}>
          <span className={styles.reviewRating}>
            {review.rating?.toFixed(1)}
          </span>
          <DisplayRating rating={review.rating} />
        </div>
      </div>

      <p className={styles.reviewJob}>{gigTitle}</p>
      <p className={styles.reviewText}>
        {review.comment || 'No comment provided.'}
      </p>
      <p className={styles.reviewDate}>{formattedDate}</p>
    </div>
  );
}

ReviewCard.propTypes = {
  review: PropTypes.shape({
    reviewer: PropTypes.shape({
      fullName: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      profileImage: PropTypes.string,
    }),
    gig: PropTypes.shape({
      title: PropTypes.string,
    }),
    createdAt: PropTypes.string,
    rating: PropTypes.number,
    comment: PropTypes.string,
  }),
};

export default ReviewCard;
