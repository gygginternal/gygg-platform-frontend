// import React from 'react';
import { useState } from 'react';
import { X, Download } from 'lucide-react';
import apiClient from '../../api/axiosConfig';
import styles from './InvoiceModal.module.css';
import PropTypes from 'prop-types';

function InvoiceModal({ isOpen, onClose, invoice }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    if (!invoice.paymentId) {
      setError('Payment ID not available for this invoice');
      return;
    }

    setDownloading(true);
    setError('');

    try {
      const res = await apiClient.get(
        `/payments/${invoice.paymentId}/invoice-pdf`,
        {
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // console.error('Error downloading PDF:', err);
      setError('Failed to download invoice PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Invoice</h3>
            <p className={styles.invoiceId}>#{invoice.id}</p>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={handleDownloadPDF}
              className={styles.downloadButton}
              disabled={downloading || !invoice.paymentId}
            >
              <Download className={styles.downloadIcon} />
              {downloading ? 'Downloading...' : 'Download PDF'}
            </button>
            <button onClick={onClose} className={styles.closeButton}>
              <X className={styles.closeIcon} />
            </button>
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.modalContent}>
          <div className={styles.row}>
            <span className={styles.label}>Gig title</span>
            <span className={styles.value}>{invoice.title}</span>
          </div>

          <div className={styles.earningDetails}>
            <div className={styles.row}>
              <span className={styles.label}>Your total earnings</span>
              <span className={styles.value}>
                ${invoice.totalEarnings.toFixed(2)}
              </span>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Fees and taxes</span>
              <span className={styles.value}>
                ${invoice.feesAndTaxes.toFixed(2)}
              </span>
            </div>

            <hr className={styles.divider} />

            <div className={styles.row}>
              <span className={styles.totalLabel}>
                Your earnings after fees and taxes
              </span>
              <span className={styles.totalValue}>
                ${invoice.netEarnings.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

InvoiceModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  invoice: PropTypes.shape({
    id: PropTypes.string,
    paymentId: PropTypes.string,
    title: PropTypes.string,
    totalEarnings: PropTypes.number,
    feesAndTaxes: PropTypes.number,
    netEarnings: PropTypes.number,
  }),
};

export default InvoiceModal;
