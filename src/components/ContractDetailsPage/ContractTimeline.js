// import React from 'react';
import PropTypes from 'prop-types';
import styles from './ContractDetailsSection.module.css';

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

ContractTimeline.propTypes = {
  timeline: PropTypes.arrayOf(PropTypes.object),
};

export default ContractTimeline;
