import React from 'react';
import styles from './ContractParties.module.css';

const ContractParties = ({ provider, tasker }) => (
  <section className={styles.partiesSection}>
    <div className={styles.party}>
      <img src={provider.avatar} alt="Provider" />
      <div>
        <div className={styles.partyRole}>Provider</div>
        <div className={styles.partyName}>{provider.name}</div>
      </div>
    </div>
    <div className={styles.party}>
      <img src={tasker.avatar} alt="Tasker" />
      <div>
        <div className={styles.partyRole}>Tasker</div>
        <div className={styles.partyName}>{tasker.name}</div>
      </div>
    </div>
  </section>
);

export default ContractParties;
