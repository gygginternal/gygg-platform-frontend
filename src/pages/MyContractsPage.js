import React, { useEffect, useState } from 'react';
import apiClient from '../api/axiosConfig';
import { Link } from 'react-router-dom';
import styles from './MyContractsPage.module.css';

function MyContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/contracts/my-contracts');
        setContracts(res.data.data.contracts || []);
      } catch (err) {
        setError('Failed to load contracts.');
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h2>My Contracts</h2>
      <ul className={styles.list}>
        {contracts.map(c => (
          <li key={c._id} className={styles.item}>
            <span>{c.title || c.gig?.title}</span>
            <span>Status: {c.status}</span>
            <Link to={`/contracts/${c._id}`}>Details</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyContractsPage;
