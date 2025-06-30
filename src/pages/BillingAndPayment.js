import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/axiosConfig';
import styles from './BillingAndPayment.module.css';
import BillingTable from '../components/Billing/BillingTable';

function WithdrawModal({ open, onClose, available, onConfirm }) {
  const [custom, setCustom] = useState(false);
  const [amount, setAmount] = useState(available);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!open) {
      setCustom(false);
      setAmount(available);
      setInputValue('');
    }
  }, [open, available]);

  const handleCustom = () => {
    setCustom(true);
    setAmount(Number(inputValue) || 0);
  };

  const handleDefault = () => {
    setCustom(false);
    setAmount(available);
    setInputValue('');
  };

  const handleInput = e => {
    setInputValue(e.target.value);
    setAmount(Number(e.target.value) || 0);
  };

  if (!open) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <span>Withdraw Confirmation</span>
          <button className={styles.modalClose} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          <div style={{ marginBottom: 16 }}>
            The amount below will be withdrawn to banking account ending with
            5698.
          </div>
          <div className={styles.radioRow}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                checked={!custom}
                onChange={handleDefault}
                name="withdrawAmount"
              />
              <span style={{ marginLeft: 8, fontWeight: 500 }}>
                ${available.toFixed(2)}
              </span>
            </label>
            <label className={styles.radioLabel} style={{ marginLeft: 24 }}>
              <input
                type="radio"
                checked={custom}
                onChange={handleCustom}
                name="withdrawAmount"
              />
              <span style={{ marginLeft: 8 }}>Enter custom amount</span>
              <input
                type="number"
                min="1"
                step="0.01"
                className={styles.customInput}
                value={custom ? inputValue : ''}
                onChange={handleInput}
                disabled={!custom}
                style={{ marginLeft: 8, width: 100 }}
              />
            </label>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.modalCancel} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.modalConfirm}
            onClick={() => onConfirm(amount)}
            disabled={amount <= 0 || amount > available}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function InvoiceModal({ open, onClose, payment }) {
  if (!open || !payment) return null;
  // Use real fields from payment object
  const total = (payment.amount || 0) / 100;
  const tax = (payment.taxAmount || 0) / 100;
  const platformFee = (payment.applicationFeeAmount || 0) / 100;
  const net = (payment.amountReceivedByPayee || 0) / 100;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.invoiceModalCard}>
        <div className={styles.invoiceModalHeader}>
          <span style={{ fontWeight: 600, fontSize: 24 }}>Invoice</span>
          <button className={styles.modalClose} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.invoiceModalBody}>
          <div style={{ marginBottom: 12, color: '#555', fontWeight: 500 }}>
            #{payment.invoiceNumber || payment._id?.slice(-5) || '—'}
          </div>
          <div className={styles.invoiceRow}>
            <span style={{ color: '#888' }}>Gig title</span>
            <span style={{ fontWeight: 500 }}>
              {payment.contract?.title || payment.gig?.title || 'N/A'}
            </span>
          </div>
          <div className={styles.invoiceRow}>
            <span>Your total earnings</span>
            <span style={{ fontWeight: 600 }}>${total.toFixed(2)}</span>
          </div>
          <div className={styles.invoiceRow}>
            <span>Tax</span>
            <span style={{ fontWeight: 600 }}>${tax.toFixed(2)}</span>
          </div>
          <div className={styles.invoiceRow}>
            <span>Platform fee</span>
            <span style={{ fontWeight: 600 }}>${platformFee.toFixed(2)}</span>
          </div>
          <div className={styles.invoiceRow}>
            <span>Your earnings after fees and taxes</span>
            <span style={{ fontWeight: 700, fontSize: 22 }}>
              {net.toFixed(2)}
            </span>
          </div>
        </div>
        <div className={styles.invoiceModalFooter}>
          <button
            className={styles.downloadBtn}
            onClick={() => window.open(payment.invoiceUrl, '_blank')}
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BillingAndPayment() {
  const { user } = useAuth();
  const [_transactions, setTransactions] = useState([]);
  const [_loading, setLoading] = useState(false);
  const [_error, setError] = useState('');
  const [view, setView] = useState('earned'); // 'earned' for tasker, 'spent' for provider
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState({
    open: false,
    payment: null,
  });

  // Determine if user has both roles
  const isTasker = user?.role?.includes('tasker');
  const isProvider = user?.role?.includes('provider');

  useEffect(() => {
    async function fetchPayments() {
      setLoading(true);
      setError('');
      try {
        let url = '/payments?';
        if (view === 'earned' && isTasker) {
          url += `payee=${user._id}`;
        } else if (view === 'spent' && isProvider) {
          url += `payer=${user._id}`;
        }
        const res = await apiClient.get(url);
        setTransactions(res.data.data.payments || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load payments.');
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchPayments();
  }, [user, view, isTasker, isProvider]);

  // Calculate totals
  const total = _transactions.reduce((sum, p) => sum + (p.amount || 0), 0);
  const available = total / 100;

  // Color for summary
  const summaryColor =
    view === 'earned' ? styles.summaryValueEarned : styles.summaryValueSpent;

  const handleWithdraw = amount => {
    setShowWithdraw(false);
    setWithdrawSuccess(true);
    setTimeout(() => setWithdrawSuccess(false), 2000);
    // TODO: Call backend to process withdrawal
  };

  return (
    <div className={styles.container}>
      <WithdrawModal
        open={showWithdraw && view === 'earned'}
        onClose={() => setShowWithdraw(false)}
        available={available}
        onConfirm={handleWithdraw}
      />
      <InvoiceModal
        open={invoiceModal.open}
        onClose={() => setInvoiceModal({ open: false, payment: null })}
        payment={invoiceModal.payment}
      />
      <div className={styles.card}>
        <div className={styles.searchRow}>
          <input
            type="text"
            placeholder="Search"
            className={styles.searchInput}
            disabled
          />
          <span className={styles.filterIcon}>⚙️</span>
        </div>
        <div className={styles.summaryRow}>
          {isTasker && isProvider && (
            <div className={styles.toggleView}>
              <button
                className={view === 'earned' ? styles.activeToggle : ''}
                onClick={() => setView('earned')}
              >
                Money Earned
              </button>
              <button
                className={view === 'spent' ? styles.activeToggle : ''}
                onClick={() => setView('spent')}
              >
                Money Spent
              </button>
            </div>
          )}
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>
              {view === 'earned' ? 'Total Earned' : 'Total Spent'}
            </span>
            <span className={summaryColor}>${available.toFixed(2)}</span>
          </div>
          {view === 'earned' && isTasker && (
            <button
              className={styles.withdrawBtn}
              onClick={() => setShowWithdraw(true)}
              disabled={available <= 0}
            >
              Withdraw
            </button>
          )}
        </div>
        {withdrawSuccess && (
          <div
            style={{ color: '#1db954', textAlign: 'center', marginBottom: 12 }}
          >
            Withdrawal request submitted!
          </div>
        )}
        <div className={styles.tableWrapper}>
          {_loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              Loading payments...
            </div>
          ) : _error ? (
            <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>
              {_error}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Hired by</th>
                  <th>Date</th>
                  <th>Contract detail</th>
                  <th>Amount</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {_transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ textAlign: 'center', color: '#888' }}
                    >
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  _transactions.map((inv, idx) => (
                    <tr key={inv._id || idx}>
                      <td>
                        {inv.payer?.firstName || ''} {inv.payer?.lastName || ''}
                      </td>
                      <td>
                        {inv.createdAt
                          ? new Date(inv.createdAt).toLocaleDateString()
                          : ''}
                      </td>
                      <td className={styles.contractDetail}>
                        {inv.contract?.title || inv.gig?.title || 'N/A'}
                      </td>
                      <td
                        style={{
                          color: view === 'earned' ? '#1db954' : '#e53935',
                          fontWeight: 600,
                        }}
                      >
                        {view === 'earned' ? '+' : '-'}$
                        {((inv.amount || 0) / 100).toFixed(2)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className={styles.viewLink}
                          onClick={e => {
                            e.preventDefault();
                            setInvoiceModal({ open: true, payment: inv });
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
