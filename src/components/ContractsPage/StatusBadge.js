// import React from 'react';
import PropTypes from 'prop-types';
import styles from './StatusBadge.module.css';

function StatusBadge({ status }) {
  const getStatusClass = () => {
    switch (status) {
      case 'Active':
        return styles.active;
      case 'Interviewing':
        return styles.interviewing;
      case 'Ended':
        return styles.ended;
      default:
        return styles.ended;
    }
  };

  return (
    <span className={`${styles.badgeBase} ${getStatusClass()}`}>{status}</span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string,
};

export default StatusBadge;
