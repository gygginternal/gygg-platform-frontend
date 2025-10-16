import React from 'react';
import { Dialog } from '@headlessui/react';
import styles from './BillingModal.module.css';
import { decodeHTMLEntities } from '../../utils/htmlEntityDecoder';

export const BillingModal = ({ isOpen, onClose, gig }) => {
  if (!gig) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className={styles.dialog}>
      {/* Backdrop */}
      <div className={styles.backdrop} aria-hidden="true" />

      {/* Modal Content */}
      <div className={styles.modalWrapper}>
        <Dialog.Panel className={styles.panel}>
          {/* Header */}
          <header className={styles.header}>
            <button
              aria-label="Close invoice"
              className={styles.closeButton}
              onClick={onClose}
            >
              X
            </button>
            <Dialog.Title className={styles.title}>Invoice</Dialog.Title>
            <p className={styles.invoiceNumber}>#{gig._id || 'N/A'}</p>
          </header>

          {/* Gig Title Section */}
          <section className={styles.section}>
            <div className={styles.flexRow}>
              <p className={styles.label}>Gig title</p>
              <p className={styles.value}>
                {decodeHTMLEntities(gig.gig.title) || 'N/A'}
              </p>
            </div>
          </section>

          <hr className={styles.hr} />

          {/* Earnings Section */}
          <section className={styles.section}>
            <div className={styles.flexRow}>
              <p className={styles.label}>Your total earnings</p>
              <p className={styles.value}>
                ${((gig.amount || 0) / 100).toFixed(2)}
              </p>
            </div>
          </section>

          <hr className={styles.hr} />

          {/* Fees and Taxes Section */}
          <section className={styles.section}>
            <div className={styles.flexRow}>
              <p className={styles.label}>Fees and taxes</p>
              <p className={styles.value}>
                ${((gig.applicationFeeAmount || 0) / 100).toFixed(2)}
              </p>
            </div>
          </section>

          <section
            className={`${styles.section} ${styles.totalEarningsSection}`}
          >
            <div className={styles.flexRow}>
              <p className={styles.bigLabel}>
                Your earnings after fees and taxes
              </p>
              <p className={styles.bigValue}>
                ${((gig.amountReceivedByPayee || 0) / 100).toFixed(2)}
              </p>
            </div>
          </section>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
