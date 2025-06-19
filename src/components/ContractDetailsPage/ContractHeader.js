import React from 'react';
import styles from './ContractHeader.module.css';

const ContractHeader = ({ title, status }) => (
  <section className={styles.headerSection}>
    <h1>{title}</h1>
    <span className={styles.status}>Status: {status}</span>
    <div className={styles.actions}>
      <button>Approve</button>
      <button>Request Revision</button>
    </div>
  </section>
);

export default ContractHeader;
