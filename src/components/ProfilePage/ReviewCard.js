// src/components/ProfilePage/ReviewCard.js
import styles from './ReviewCard.module.css'; // Create CSS Module
import PropTypes from 'prop-types';

// Reusable Star Display Component (or import from ReviewItem)
const DisplayRating = ({ rating }) => {
  const stars = Math.round(rating || 0); // Round to nearest star for simple display
  return (
    <span className={styles.starRating}>
      {' '}
      {'★'.repeat(stars)}
      {'☆'.repeat(Math.max(0, 5 - stars))}{' '}
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

  return (
    <div className={styles.reviewItem}>
      {/* Row 1: Name */}
      <div className={styles.reviewRow}>
        <h3 className={styles.name}>{reviewerName}</h3>
      </div>

      {/* Row 2: Job, Rating, Stars, Date */}
      <div className={styles.reviewRow}>
        {/* Use Gig Title for "job" */}
        <p className={styles.job}>{gigTitle}</p>
        <span className={styles.separator}> | </span>
        {/* Display rating value and stars */}
        <p className={styles.rating}>{review.rating?.toFixed(1)}</p>
        <DisplayRating rating={review.rating} />
        <span className={styles.separator}>|</span>
        <p className={styles.date}>{formattedDate}</p>
      </div>

      {/* Row 3: Review Description */}
      <div className={styles.reviewRow}>
        <p className={styles.reviewText}>
          {review.comment || 'No comment provided.'}
        </p>
      </div>
    </div>
  );
}

ReviewCard.propTypes = {
  review: PropTypes.shape({
    reviewer: PropTypes.shape({
      fullName: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
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
