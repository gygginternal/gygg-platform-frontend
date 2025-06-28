// import React from 'react';
import { useState } from 'react';
// import { Plus } from 'react-feather';
import WithdrawModal from './WithdrawModal';
import InvoiceModal from './InvoiceModal';
import styles from './BillingPayments.module.css';
import PropTypes from 'prop-types';

function BillingPayments({ billingData, onWithdraw }) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleWithdraw = amount => {
    onWithdraw(amount);
    setShowAddMethod(true);
  };

  const handleViewInvoice = entry => {
    const invoice = {
      id: entry.paymentId || '27263',
      paymentId: entry.paymentId,
      title: entry.contractDetail,
      totalEarnings: entry.totalEarnings || 123.75,
      feesAndTaxes: entry.feesAndTaxes || 21.24,
      netEarnings: entry.netEarnings || 102.51,
    };
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  return (
    <div className={styles.billingPaymentsContainer}>
      <div className={styles.billingCardGrid}>
        <div className={styles.inProgressCard}>
          <h3 className={styles.inProgressLabel}>In Progress</h3>
          <p className={styles.inProgressValue}>
            ${billingData.inProgress.toFixed(2)}
          </p>
        </div>

        <div className={styles.availableCard}>
          <h3 className={styles.availableLabel}>Available</h3>
          <p className={styles.availableValue}>
            ${billingData.available.toFixed(2)}
          </p>
        </div>

        <div className={styles.withdrawActionWrapper}>
          <div className={styles.withdrawButtonGroup}>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className={styles.withdrawButton}
              disabled={billingData.available <= 0}
            >
              Withdraw
            </button>
            {showAddMethod && (
              <button
                onClick={() => setShowAddMethod(false)}
                className={styles.addWithdrawMethodButton}
              >
                Add withdraw method
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.transactionHistoryBox}>
        <div className={styles.transactionHeader}>
          <h3 className={styles.transactionTitle}>Transaction History</h3>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.transactionTable}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Hired by</th>
                <th>Date</th>
                <th>Contract detail</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {billingData.entries.map((entry, index) => (
                <tr key={index} className={styles.tableRow}>
                  <td>{entry.hiredBy}</td>
                  <td>{entry.date}</td>
                  <td>{entry.contractDetail}</td>
                  <td>
                    <button
                      onClick={() => handleViewInvoice(entry)}
                      className={styles.invoiceLinkButton}
                    >
                      {entry.invoice}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        availableAmount={billingData.available}
        onConfirm={handleWithdraw}
      />

      {selectedInvoice && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          invoice={selectedInvoice}
        />
      )}
    </div>
  );
}

BillingPayments.propTypes = {
  billingData: PropTypes.shape({
    inProgress: PropTypes.number,
    available: PropTypes.number,
    entries: PropTypes.arrayOf(PropTypes.object),
  }),
  onWithdraw: PropTypes.func,
};

export default BillingPayments;
