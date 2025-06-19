import React from 'react';
import styles from './ContractTimeline.module.css';

const ContractTimeline = ({ timeline }) => (
  <section className={styles.timelineSection}>
    <h2>Timeline</h2>
    <ul>
      {timeline.map((item, idx) => (
        <li key={idx}>
          {item.label}: {item.value}
        </li>
      ))}
    </ul>
  </section>
);

export default ContractTimeline;
