import React from 'react';
import styles from './ContractDetails.module.css';

const ContractDetails = ({ gig }) => (
  <section className={styles.detailsSection}>
    <h2>Gig Details</h2>
    <div>Title: {gig.title}</div>
    <div>Description: {gig.description}</div>
    <div>Budget: ${gig.budget}</div>
    <div>Timeline: {gig.timeline}</div>
  </section>
);

export default ContractDetails;
