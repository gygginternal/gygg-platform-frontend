import React from 'react';
import styles from './ContractPayment.module.css';

const ContractPayment = ({ payment }) => (
  <section className={styles.paymentSection}>
    <h2>Payment Info</h2>
    <div>Status: {payment.status}</div>
    <div>Amount: ${payment.amount}</div>
    <div>Method: {payment.method}</div>
  </section>
);

export default ContractPayment;
