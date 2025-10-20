import React from 'react';
import { Clock, MapPin, Briefcase } from 'lucide-react';
import styles from './AppliedGigCard.module.css';
import { decodeHTMLEntities } from '@utils/htmlEntityDecoder';

const AppliedGigCard = ({ gig, onClick }) => {
  const {
    title,
    category,
    status,
    postedBy,
    location,
    duration,
    rate,
    isHourly,
    createdAt,
  } = gig;

  const formatTimeAgo = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div
      className={styles.contractCard}
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for gig: ${decodeHTMLEntities(title)}`}
    >
      <div className={styles.cardHeader}>
        <span className={styles.category}>
          {category?.toUpperCase() || 'OTHER'}
        </span>
        <span className={styles.statusBadge}>{status}</span>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.title}>{decodeHTMLEntities(title)}</h3>
        <div className={styles.detailsRow}>
          <div className={styles.hiredBy}>
            <div className={styles.hiredByAvatar}>
              {postedBy?.profileImage ? (
                <img
                  src={postedBy.profileImage}
                  alt={`${postedBy.firstName}'s profile`}
                  className={styles.avatarImage}
                />
              ) : (
                postedBy?.firstName?.[0] || 'U'
              )}
            </div>
            <span className={styles.hiredByName}>
              {decodeHTMLEntities(postedBy?.firstName) || 'Unknown'}{' '}
              {decodeHTMLEntities(postedBy?.lastName) || 'Client'}
            </span>
          </div>
          <div className={styles.timeInfo}>
            <span>
              <Clock size={12} /> Posted {formatTimeAgo(createdAt)}
            </span>
          </div>
        </div>
        <div className={styles.cardFooter}>
          <div className={styles.metaInfo}>
            <span>
              <MapPin size={14} />
              {decodeHTMLEntities(location?.city) ||
                decodeHTMLEntities(location?.address) ||
                'Location TBD'}
            </span>
            <span>
              <Briefcase size={14} />
              {duration ? `${duration} hours` : 'Flexible'}
            </span>
          </div>
          <div className={styles.rate}>
            <span className={styles.rateAmount}>
              ${isHourly ? rate : gig.cost}
            </span>
            <span className={styles.rateType}>
              {isHourly ? '/hr' : 'Fixed Rate'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppliedGigCard;
