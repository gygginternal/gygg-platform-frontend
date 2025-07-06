import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axiosConfig';
import styles from './BillingTable.module.css';

const statusOptions = [
  'all',
  'pending_contract',
  'succeeded',
  'refunded',
  'failed',
  'requires_payment_method',
  'requires_action',
  'cancelled',
];

const BillingAndPaymentTable = ({ user, view }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  useEffect(() => {
    async function fetchPayments() {
      setLoading(true);
      setError('');
      try {
        let url = '/payments?';
        if (view === 'earned') url += `payee=${user._id}&`;
        if (view === 'spent') url += `payer=${user._id}&`;
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (status && status !== 'all') url += `status=${status}&`;
        if (minAmount) url += `minAmount=${minAmount}&`;
        if (maxAmount) url += `maxAmount=${maxAmount}&`;
        const res = await apiClient.get(url);
        setTransactions(res.data.data.payments || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load payments.');
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchPayments();
  }, [user, view, search, status, minAmount, maxAmount]);

  return (
    <div className={styles.tableContainer}>
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="Search by title, payer, invoice..."
          className={styles.searchInput}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          {statusOptions.map(opt => (
            <option key={opt} value={opt}>
              {opt.charAt(0).toUpperCase() + opt.slice(1).replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <input
          type="number"
          className={styles.amountInput}
          placeholder="Min $"
          value={minAmount}
          onChange={e => setMinAmount(e.target.value)}
          min={0}
        />
        <input
          type="number"
          className={styles.amountInput}
          placeholder="Max $"
          value={maxAmount}
          onChange={e => setMaxAmount(e.target.value)}
          min={0}
        />
        <button
          className={styles.clearBtn}
          onClick={() => {
            setSearch('');
            setStatus('all');
            setMinAmount('');
            setMaxAmount('');
          }}
        >
          Clear
        </button>
      </div>
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          Loading payments...
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>
          {error}
        </div>
      ) : (
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
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>
                  No payments found.
                </td>
              </tr>
            ) : (
              transactions.map(transaction => (
                <tr key={transaction._id}>
                  <td>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {transaction.contract?.title ||
                      transaction.gig?.title ||
                      transaction.description ||
                      'N/A'}
                  </td>
                  <td className={styles.amount}>
                    ${((transaction.amount || 0) / 100).toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={`${styles.status} ${styles[transaction.status?.toLowerCase()]}`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BillingAndPaymentTable;
