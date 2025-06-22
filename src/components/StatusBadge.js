import styles from './StatusBadge.module.css';
import PropTypes from 'prop-types';

export function StatusBadge({ status, className = '' }) {
  const key = status?.toLowerCase();
  const statusClass = styles[key] || '';
  const statusLabel = status?.toUpperCase() || 'Status';

  return (
    <span
      className={`${styles.badge} ${statusClass} ${className}`}
      aria-label={statusLabel}
    >
      {statusLabel}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string,
  className: PropTypes.string,
};
