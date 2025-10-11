import React from 'react';
import styles from './ContractDetails.module.css';
import { decodeHTMLEntities } from '../../utils/htmlEntityDecoder';

const ContractDetails = ({ gig }) => (
  <section className={styles.detailsSection}>
    <h2>Gig Details</h2>
    <div>Title: {decodeHTMLEntities(gig.title)}</div>
    <div>Description: {decodeHTMLEntities(gig.description)}</div>
    <div>Budget: ${gig.budget}</div>
    <div>Timeline: {decodeHTMLEntities(gig.timeline)}</div>
  </section>
);

export default ContractDetails;
