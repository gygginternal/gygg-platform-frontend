// import React from 'react';
import PropTypes from 'prop-types';
import styles from './ContractDetailsSection.module.css';

const ContractDetails = ({ gig }) => (
  <section className={styles.detailsSection}>
    <h2>Gig Details</h2>
    <div>Title: {gig.title}</div>
    <div>Description: {gig.description}</div>
    <div>Budget: ${gig.budget}</div>
    <div>Timeline: {gig.timeline}</div>
  </section>
);

ContractDetails.propTypes = {
  gig: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    budget: PropTypes.number,
    timeline: PropTypes.string,
  }),
};

export default ContractDetails;
