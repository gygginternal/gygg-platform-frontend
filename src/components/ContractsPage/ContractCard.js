import React from 'react';
import styles from './ContractsPage.module.css';
import { StatusBadge } from '../StatusBadge';

export default function ContractCard({ contract }) {
  return (
    <div
      className={styles.contractRow}
      tabIndex={0}
      role="button"
      aria-expanded={false}
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
    </div>
  );
}
