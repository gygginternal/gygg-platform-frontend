// src/components/GigsPage/TaskCard.js
import { useState } from 'react';
import styles from './TaskCard.module.css';
import GigDetailsModal from './GigDetailsModal';
import PropTypes from 'prop-types';

// Utility to format "time ago"
const timeAgo = date => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `Posted ${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `Posted ${Math.floor(diff / 3600)} hours ago`;
  return `Posted ${Math.floor(diff / 86400)} days ago`;
};

const TaskCard = ({ gig }) => {
  const [modalOpen, setModalOpen] = useState(false);
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
    provider,
    postedBy,
  } = gig;

  // Use provider if present, otherwise postedBy
  const user = provider || postedBy || {};

  // Provider name logic
  const name =
    user.name ||
    user.fullName ||
    (user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : 'Anonymous');

  // Profile image fallback
  const profileImage =
    user.profileImage && user.profileImage !== 'default.jpg'
      ? user.profileImage
      : '/default-profile.png';

  // Format price/cost/rate
  let rate = '';
  if (
    typeof cost === 'number' &&
    !isNaN(cost) &&
    (typeof ratePerHour !== 'number' || isNaN(ratePerHour)) &&
    (typeof duration !== 'number' || isNaN(duration))
  ) {
    rate = `$${cost} (fixed)`;
  } else if (
    typeof ratePerHour === 'number' &&
    !isNaN(ratePerHour) &&
    typeof duration === 'number' &&
    !isNaN(duration)
  ) {
    rate = `$${ratePerHour}/hr · ${duration} hrs`;
  } else if (minPrice && maxPrice && minPrice !== maxPrice) {
    rate = `$${minPrice}-${maxPrice}/hr`;
  } else if (price) {
    rate = `$${price}/hr`;
  } else if (minPrice) {
    rate = `$${minPrice}/hr`;
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

  const handleCardClick = e => {
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);
  const handleApply = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleCardClick(gig)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') handleCardClick(gig);
        }}
        className={styles.card}
        aria-label={`View details for ${gig.title}`}
      >
        <img src={profileImage} alt={name} className={styles.profileImage} />
        <div className={styles.content}>
          <div className={styles.header}>
            <span className={styles.name}>{name}</span>
            <span className={styles.cardTitle}>{title}</span>
          </div>
          <div className={styles.rate}>{rate}</div>
          <div className={styles.meta}>
            <span className={styles.location}>
              <span className={styles.icon}>📍</span>
              {formatLocation(location)}
            </span>
            <span className={styles.time}>{timeAgo(createdAt)}</span>
          </div>
        </div>
      </div>
      <GigDetailsModal
        gig={gig}
        open={modalOpen}
        onClose={handleCloseModal}
        onApply={handleApply}
      />
    </>
  );
};

TaskCard.propTypes = {
  gig: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
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
  }).isRequired,
};

export default TaskCard;
