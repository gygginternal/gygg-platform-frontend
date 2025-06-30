import React from 'react';
import styles from './BillingTable.module.css';

const BillingTable = ({ transactions, loading }) => {
  const items = Array.isArray(transactions) ? transactions : [];

  if (loading) {
    // Figma-style loading skeleton (3 rows)
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
            {[1, 2, 3].map(i => (
              <tr key={i} className={styles.skeletonRow}>
                <td colSpan={4}>
                  <div className={styles.skeleton} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyState}>No transactions found.</div>
      </div>
    );
  }

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
          {items.map(transaction => (
            <tr key={transaction._id}>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
              <td>{transaction.description}</td>
              <td className={styles.amount}>
                ${transaction.amount.toFixed(2)}
              </td>
              <td>
                <span
                  className={`${styles.status} ${styles[transaction.status.toLowerCase()]}`}
                >
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
