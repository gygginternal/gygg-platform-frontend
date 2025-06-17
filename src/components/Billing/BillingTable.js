import React from 'react';
import styles from './BillingTable.module.css';

const BillingTable = ({ transactions }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
              <td>{transaction.description}</td>
              <td className={styles.amount}>
                ${transaction.amount.toFixed(2)}
              </td>
              <td>
                <span className={`${styles.status} ${styles[transaction.status.toLowerCase()]}`}>
                  {transaction.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BillingTable; 