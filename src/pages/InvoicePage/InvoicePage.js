import { useState } from 'react';
import apiClient from '../../api/axiosConfig';
import styles from './InvoicePage.module.css';
import PropTypes from 'prop-types';

function InvoicePage({ paymentId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/payments/${paymentId}/invoice-pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Failed to download invoice.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h2>Invoice</h2>
      <button onClick={handleDownload} disabled={loading}>
        {loading ? 'Downloading...' : 'Download PDF'}
      </button>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}

InvoicePage.propTypes = {
  paymentId: PropTypes.string,
};

export default InvoicePage;
