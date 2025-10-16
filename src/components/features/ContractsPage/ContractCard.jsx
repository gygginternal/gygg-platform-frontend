import React from 'react';
import styles from './ContractCard.module.css';
import {
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
} from 'lucide-react';
import { decodeHTMLEntities } from '@utils/htmlEntityDecoder';

export default function ContractCard({ contract, onClick }) {
  // Define status configuration for styling
  const statusConfig = {
    submitted: {
      color: '#ff9800',
      bgColor: '#fff3e0',
      icon: Clock,
    },
    approved: {
      color: '#4caf50',
      bgColor: '#e8f5e8',
      icon: CheckCircle,
    },
    completed: {
      color: '#2196f3',
      bgColor: '#e3f2fd',
      icon: CheckCircle,
    },
    cancelled: {
      color: '#f44336',
      bgColor: '#ffebee',
      icon: AlertCircle,
    },
    pending_payment: {
      color: '#9c27b0',
      bgColor: '#f3e5f5',
      icon: ClockIcon,
    },
    active: {
      color: '#4caf50',
      bgColor: '#e8f5e8',
      icon: User,
    },
  };

  // Get status configuration or use default
  const status = contract.status?.toLowerCase() || 'active';
  const config = statusConfig[status] || {
    color: '#9e9e9e',
    bgColor: '#f5f5f5',
    icon: Clock,
  };

  const StatusIcon = config.icon;

  // Handle click event
  const handleClick = () => {
    if (onClick) {
      onClick(contract);
    }
  };

  // Handle keyboard navigation for accessibility
  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) {
        onClick(contract);
      }
    }
  };

  return (
    <div
      className={styles.contractCard}
      tabIndex={0}
      role="button"
      aria-expanded={false}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Card Header with Category and Status */}
      <div className={styles.cardHeader}>
        <div className={styles.categorySection}>
          <div className={styles.categoryInfo}>
            <span className={styles.categoryName}>
              {decodeHTMLEntities(contract.gigCategory?.toUpperCase()) ||
                'CONTRACT'}
            </span>
          </div>
        </div>
        <div
          className={styles.statusBadge}
          style={{
            backgroundColor: config.bgColor,
            color: config.color,
          }}
        >
          <StatusIcon size={14} />
          {contract.status}
        </div>
      </div>

      {/* Contract Title */}
      <h3 className={styles.contractTitle}>
        {decodeHTMLEntities(contract.gigTitle)}
      </h3>

      {/* Client Info */}
      <div className={styles.clientInfo}>
        <div className={styles.clientAvatar}>
          {contract.displayImage ? (
            <img
              src={contract.displayImage}
              alt={`${decodeHTMLEntities(contract.displayName)}'s profile`}
              className={styles.avatarImage}
            />
          ) : (
            contract.displayName?.[0] || 'U'
          )}
        </div>
        <div className={styles.clientDetails}>
          <span className={styles.clientName}>
            <b>
              {decodeHTMLEntities(contract.hiredBy) ||
                decodeHTMLEntities(contract.displayName)}
            </b>
          </span>
        </div>
        <div className={styles.timeInfo}>
          <span>
            <Calendar size={12} />
            Started {contract.started}
          </span>
        </div>
      </div>

      {/* Contract Details - Contract ID hidden for simplicity */}

      {/* Footer with Location and Price */}
      <div className={styles.cardFooter}>
        <div className={styles.locationPrice}>
          <div className={styles.location}>
            <MapPin size={14} />
            <span>
              {decodeHTMLEntities(contract.location) || 'Location TBD'}
            </span>
          </div>
          <div className={styles.duration}>
            <Clock size={14} />
            <span>{decodeHTMLEntities(contract.duration) || 'Flexible'}</span>
          </div>
        </div>
        <div className={styles.priceSection}>
          <div className={styles.price}>
            <DollarSign size={16} />
            <span className={styles.amount}>
              {decodeHTMLEntities(contract.rate)}
            </span>
          </div>
          <div className={styles.earned}>
            <span>Earned</span>
            <span className={styles.earnedAmount}>
              {decodeHTMLEntities(contract.earned)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
