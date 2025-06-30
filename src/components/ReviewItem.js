import PropTypes from 'prop-types';
import styles from './ReviewItem.module.css';

const DisplayRating = ({ rating }) => {
  /* ... Star display logic ... */
  return (
    <span className={styles.rating}>
      {' '}
      {'★'.repeat(Math.floor(rating))}
      {'☆'.repeat(Math.max(0, 5 - Math.floor(rating)))} ({rating?.toFixed(1)}
      ){' '}
    </span>
  );
};

DisplayRating.propTypes = {
  rating: PropTypes.number.isRequired,
};

function ReviewItem({ review }) {
  if (!review) return null;
  const { reviewer } = review;
  return (
    <div className={styles.reviewItem}>
      <div className={styles.flexContainer}>
        <img
          src={reviewer?.profileImage || '/default.jpg'}
          alt={reviewer?.fullName}
          className={styles.avatarSmall}
        />
        <strong>{reviewer?.fullName || 'Anonymous'}</strong>
        <span className={styles.marginLeftAuto}>
          <DisplayRating rating={review.rating} />
        </span>
      </div>
      <p className={styles.margin}>
        {review.comment || <i>No comment left.</i>}
      </p>
      <small className={styles.textMuted}>
        {new Date(review.createdAt).toLocaleDateString()}
      </small>
    </div>
  );
}

ReviewItem.propTypes = {
  review: PropTypes.shape({
    reviewer: PropTypes.shape({
      profileImage: PropTypes.string,
      fullName: PropTypes.string,
    }),
    rating: PropTypes.number.isRequired,
    comment: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
  }),
};

export default ReviewItem;
