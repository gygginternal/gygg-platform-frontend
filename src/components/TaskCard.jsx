// src/components/GigsPage/TaskCard.js
import styles from './TaskCard.module.css';
import PropTypes from 'prop-types';
import { MapPin, Clock } from 'lucide-react';

// Utility to format "time ago"
const timeAgo = date => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `Posted ${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `Posted ${Math.floor(diff / 3600)} hours ago`;
  return `Posted ${Math.floor(diff / 86400)} days ago`;
};

const TaskCard = ({ gig, onClick }) => {
  const {
    _id,
    title,
    location,
    cost,
    ratePerHour,
    duration,
    price,
    minPrice,
    maxPrice,
    createdAt,
    postedBy,
    category,
    description,
  } = gig;

  // Use postedBy for provider information
  const user = postedBy || {};

  // Provider name logic
  const name =
    user.name ||
    user.fullName ||
    (user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : 'Anonymous');

  // Format price/cost/rate
  let rate = '';
  if (
    typeof cost === 'number' &&
    !isNaN(cost) &&
    (typeof ratePerHour !== 'number' || isNaN(ratePerHour)) &&
    (typeof duration !== 'number' || isNaN(duration))
  ) {
    rate = `${cost} (fixed)`;
  } else if (
    typeof ratePerHour === 'number' &&
    !isNaN(ratePerHour) &&
    typeof duration === 'number' &&
    !isNaN(duration)
  ) {
    rate = `${ratePerHour}/hr · ${duration} hrs`;
  } else if (minPrice && maxPrice && minPrice !== maxPrice) {
    rate = `${minPrice}-${maxPrice}/hr`;
  } else if (price) {
    rate = `${price}/hr`;
  } else if (minPrice) {
    rate = `${minPrice}/hr`;
  } else {
    rate = '—';
  }

  // Format location
  const formatLocation = loc => {
    if (!loc) return 'Location not specified';
    if (typeof loc === 'string') return loc;
    const parts = [];
    if (loc.city) parts.push(loc.city);
    if (loc.state) parts.push(loc.state);
    if (loc.country) parts.push(loc.country);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick && onClick(gig)}
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick(gig);
        }
      }}
      className={styles.gigCard}
      aria-label={`View details for ${gig.title}`}
    >
      <div className={styles.gigCardHeader}>
        <h3 className={styles.gigCardTitle}>{title}</h3>
        <div className={styles.gigCardBadges}>
          <span className={`${styles.statusBadge} ${styles.open}`}>
            Open
          </span>
          <span className={`${styles.paymentTypeBadge} ${rate.includes('/hr') ? styles.hourly : styles.fixed}`}>
            {rate.includes('/hr') ? 'Hourly' : 'Fixed'}
          </span>
        </div>
      </div>

      <div className={styles.gigCardContent}>
        <p className={styles.gigCardDescription}>
          {description?.length > 120
            ? `${description.substring(0, 120)}...`
            : description || 'No description provided'}
        </p>

        <div className={styles.gigCardMeta}>
          <div className={styles.metaItem}>
            <MapPin size={16} />
            <span>{formatLocation(location)}</span>
          </div>
          <div className={styles.metaItem}>
            <Clock size={16} />
            <span>{timeAgo(createdAt)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.rateDisplay}>{rate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

TaskCard.propTypes = {
  gig: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    location: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        city: PropTypes.string,
        state: PropTypes.string,
        country: PropTypes.string,
      }),
    ]),
    cost: PropTypes.number,
    ratePerHour: PropTypes.number,
    duration: PropTypes.number,
    price: PropTypes.number,
    minPrice: PropTypes.number,
    maxPrice: PropTypes.number,
    createdAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    provider: PropTypes.object,
    postedBy: PropTypes.object,
    category: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
};

export default TaskCard;
