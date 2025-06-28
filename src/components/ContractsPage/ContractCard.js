// import React from 'react';
import StatusBadge from './StatusBadge';
import styles from './ContractCard.module.css';
import PropTypes from 'prop-types';

function ContractCard({ contract, onClick }) {
  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={styles.contractCard}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for contract: ${contract.title}`}
    >
      <div className={styles.cardHeader}>
        <h3 className={styles.contractTitle}>{contract.title}</h3>
        <StatusBadge status={contract.status} />
      </div>
      <div className={styles.contractInfo}>
        <div className={styles.infoRow}>
          <span>Hired by</span>
          <span className={styles.infoValuePrimary}>{contract.hiredBy}</span>
        </div>
        <div className={styles.infoRow}>
          <span>Rate</span>
          <span className={styles.infoValueOrange}>${contract.rate}/hr</span>
        </div>
        <div className={styles.infoRow}>
          <span>Contract ID</span>
          <span className={styles.infoValuePrimary}>{contract.contractId}</span>
        </div>
        <div className={styles.infoRow}>
          <span>Earned</span>
          <span className={styles.infoValueGreen}>${contract.earned}</span>
        </div>
        <div className={styles.infoRow}>
          <span>Started</span>
          <span className={styles.infoValuePrimary}>{contract.startDate}</span>
        </div>
      </div>
    </div>
  );
}

ContractCard.propTypes = {
  contract: PropTypes.shape({
    title: PropTypes.string,
    status: PropTypes.string,
    hiredBy: PropTypes.string,
    rate: PropTypes.number,
    contractId: PropTypes.string,
    earned: PropTypes.number,
    startDate: PropTypes.string,
  }),
  onClick: PropTypes.func,
};

export default ContractCard;
