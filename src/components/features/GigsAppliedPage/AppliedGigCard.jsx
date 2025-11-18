import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import styles from './AppliedGigCard.module.css';
import { decodeHTMLEntities } from '@utils/htmlEntityDecoder';

// Utility to format "time ago"
const timeAgo = date => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `Posted ${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `Posted ${Math.floor(diff / 3600)} hours ago`;
  return `Posted ${Math.floor(diff / 86400)} days ago`;
};

// Format location helper
const formatLocation = loc => {
  if (!loc) return 'Location not specified';
  if (typeof loc === 'string') return decodeHTMLEntities(loc);
  const parts = [];
  if (loc.city) parts.push(decodeHTMLEntities(loc.city));
  if (loc.state) parts.push(decodeHTMLEntities(loc.state));
  if (loc.country) parts.push(decodeHTMLEntities(loc.country));
  return parts.length > 0 ? parts.join(', ') : 'Location not specified';
};

const AppliedGigCard = ({ gig, onClick }) => {
  const {
    title,
    description,
    location,
    cost,
    ratePerHour,
    estimatedHours,
    duration,
    isHourly,
    price,
    minPrice,
    maxPrice,
    createdAt,
    postedBy,
    category,
    status, // This is the application status (pending/rejected)
    applicationId,
  } = gig || {}; // Add defensive null check

  return (
    <div
      className={styles.gigCard}
      onClick={onClick}
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick(gig || {});
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${gig?.title ? decodeHTMLEntities(gig.title) : ''}`}
    >
      <div className={styles.gigCardHeader}>
        <h3 className={styles.gigCardTitle}>
          {title ? decodeHTMLEntities(title) : ''}
        </h3>
        <div className={styles.gigCardBadges}>
          {/* Only show Pending or Rejected statuses, default to Pending if unknown */}
          <span
            className={`${styles.statusBadge} ${status === 'rejected' ? styles.rejected : styles.pending}`}
            data-status={status || 'pending'}
          >
            {status === 'rejected' ? 'Rejected' : 'Pending'}
          </span>
          <span
            className={`${styles.paymentTypeBadge} ${isHourly ? styles.hourly : styles.fixed}`}
          >
            {isHourly ? 'Hourly' : 'Fixed'}
          </span>
        </div>
      </div>

      <div className={styles.gigCardContent}>
        <p className={styles.gigCardDescription}>
          {description && decodeHTMLEntities(description)?.length > 120
            ? `${decodeHTMLEntities(description).substring(0, 120)}...`
            : description
              ? decodeHTMLEntities(description)
              : 'No description provided'}
        </p>

        <div className={styles.gigCardMeta}>
          <div className={styles.metaItem}>
            <MapPin size={16} />
            <span>{formatLocation(location)}</span>
          </div>
          <div className={styles.metaItem}>
            <Clock size={16} />
            <span>{createdAt ? timeAgo(createdAt) : ''}</span>
          </div>
          <div className={styles.metaItem}>
            <span>
              {isHourly
                ? `$${ratePerHour || 0}/hr${estimatedHours ? ` (Est. ${estimatedHours}h)` : ''}`
                : `$${cost || 0}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppliedGigCard;
