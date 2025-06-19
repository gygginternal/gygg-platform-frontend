import React, { useState } from 'react';
import styles from './ContractsPage.module.css';
import { StatusBadge } from '../StatusBadge';

export default function ContractCard({ contract }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={styles.contractRow}
      onClick={() => setExpanded(prev => !prev)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') setExpanded(prev => !prev);
      }}
      tabIndex={0}
      role="button"
      aria-expanded={expanded}
    >
      <div className={styles.contractMain}>
        <div className={styles.contractTitle}>{contract.title}</div>
        <div className={styles.contractDetailsRow}>
          <span className={styles.contractDetailLabel}>
            Hired by <b>{contract.hiredBy}</b>
          </span>
          <span className={styles.contractDetailLabel}>
            Rate <span className={styles.contractRate}>{contract.rate}</span>
          </span>
          <StatusBadge status={contract.status} />
        </div>
        <div className={styles.contractDetailsRow}>
          <span className={styles.contractDetailLabel}>
            Contract ID {contract.contractId}
          </span>
          <span className={styles.contractDetailLabel}>
            Earned{' '}
            <span className={styles.contractEarned}>{contract.earned}</span>
          </span>
          <span className={styles.contractStarted}>
            Started {contract.started}
          </span>
        </div>
      </div>
      {expanded && (
        <div className={styles.details}>
          <p className={styles.description}>{contract.description}</p>
          <div className={styles.detailRow}>
            <span>
              <b>Location</b> <span className={styles.locationIcon}>📍</span>
              {contract.location}
            </span>
          </div>
          <div className={styles.buttonRow}>
            <button className={styles.primaryBtn}>Submit as Complete</button>
            <button className={styles.secondaryBtn}>End Contract</button>
          </div>
        </div>
      )}
    </div>
  );
} 