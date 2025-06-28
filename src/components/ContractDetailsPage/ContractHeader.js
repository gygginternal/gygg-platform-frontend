// import React from 'react';
import PropTypes from 'prop-types';
import styles from './ContractDetailsSection.module.css';

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

ContractHeader.propTypes = {
  title: PropTypes.string,
  status: PropTypes.string,
};

export default ContractHeader;
