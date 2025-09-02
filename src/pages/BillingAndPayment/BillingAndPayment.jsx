import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../api/axiosConfig';
import styles from './BillingAndPayment.module.css';
import BillingTable from '../../components/Billing/BillingTable';
import { Filter, Search, DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react';

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

function InvoiceModal({ open, onClose, payment, showToast }) {
  if (!open || !payment) return null;
  
  // Use real fields from payment object
  const total = (payment.amount || 0) / 100;
  const tax = (payment.taxAmount || 0) / 100;
  const platformFee = (payment.applicationFeeAmount || 0) / 100;
  const net = (payment.amountReceivedByPayee || 0) / 100;
  
  const handleDownloadPDF = async () => {
    try {
      const response = await apiClient.get(`/payments/${payment._id}/invoice-pdf`, {
        responseType: 'blob',
        timeout: 30000 // 30 second timeout
      });
      
      // Check if response is actually a PDF
      if (response.data.type !== 'application/pdf' && response.data.size < 100) {
        throw new Error('Invalid PDF response');
      }
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `gygg-invoice-${payment._id?.slice(-8) || 'unknown'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Show success message
      showToast('Invoice PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Show user-friendly error using toast instead of alert
      const errorMessage = error.response?.data?.message || 'Unable to generate PDF at this time. Please try again later.';
      showToast(errorMessage, 'error');
    }
  };
  
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h3>Invoice #{payment._id?.slice(-5) || '—'}</h3>
          <button
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close invoice modal"
          >
            ✖
          </button>
        </div>
        <div className={styles.modalBody}>
          <div style={{ marginBottom: '20px' }}>
            <div><b>Contract:</b> {payment.contract?.title || payment.gig?.title || 'N/A'}</div>
            <div><b>Date:</b> {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}</div>
            <div><b>Status:</b> {payment.status}</div>
          </div>
          
          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Service Amount:</span>
              <span style={{ fontWeight: '600', color: '#1db954' }}>${total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666' }}>
              <span>Platform Fee (to platform):</span>
              <span style={{ fontWeight: '600' }}>${platformFee.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666' }}>
              <span>Tax (paid by provider):</span>
              <span style={{ fontWeight: '600' }}>${tax.toFixed(2)}</span>
            </div>
            <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: '700' }}>You Receive:</span>
                <span style={{ fontWeight: '700', fontSize: '18px', color: '#1db954' }}>${net.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                ✓ Full service amount with no deductions!
              </div>
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button
            className={styles.modalConfirm}
            onClick={handleDownloadPDF}
          >
            Download PDF
          </button>
          <button
            className={styles.modalCancel}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Earnings Summary Component
function EarningsSummary({ summary, period, onPeriodChange, isTasker, isProvider }) {
  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  return (
    <div className={styles.earningsCard}>
      <div className={styles.earningsHeader}>
        <h3>Earnings Summary</h3>
        <select 
          value={period} 
          onChange={(e) => onPeriodChange(e.target.value)}
          className={styles.periodSelect}
        >
          {periods.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>
      
      <div className={styles.summaryGrid}>
        {isTasker && summary.tasker && (
          <>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <TrendingUp size={24} color="#4caf50" />
              </div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryValue}>${summary.tasker.totalEarnedFormatted}</div>
                <div className={styles.summaryLabel}>Total Earned</div>
              </div>
            </div>
            
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <Wallet size={24} color="#2196f3" />
              </div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryValue}>${summary.tasker.availableBalanceFormatted}</div>
                <div className={styles.summaryLabel}>Available Balance</div>
              </div>
            </div>
            
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <CreditCard size={24} color="#ff9800" />
              </div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryValue}>{summary.tasker.totalContracts}</div>
                <div className={styles.summaryLabel}>Completed Contracts</div>
              </div>
            </div>
            
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <DollarSign size={24} color="#9c27b0" />
              </div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryValue}>${summary.tasker.averageEarningFormatted}</div>
                <div className={styles.summaryLabel}>Average per Contract</div>
              </div>
            </div>
          </>
        )}
        
        {isProvider && summary.provider && (
          <>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <TrendingDown size={24} color="#f44336" />
              </div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryValue}>${summary.provider.totalSpentFormatted}</div>
                <div className={styles.summaryLabel}>Total Spent</div>
              </div>
            </div>
            
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <DollarSign size={24} color="#4caf50" />
              </div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryValue}>${summary.provider.totalServiceCostsFormatted}</div>
                <div className={styles.summaryLabel}>Service Costs</div>
              </div>
            </div>
            
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <CreditCard size={24} color="#ff9800" />
              </div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryValue}>{summary.provider.totalContracts}</div>
                <div className={styles.summaryLabel}>Total Contracts</div>
              </div>
            </div>
            
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <DollarSign size={24} color="#9c27b0" />
              </div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryValue}>${summary.provider.averageSpentFormatted}</div>
                <div className={styles.summaryLabel}>Average per Contract</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

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
const typeOptions = ['all', 'earned', 'spent', 'withdrawals'];

export default function BillingAndPayment() {
  const { user, sessionRole } = useAuth();
  const { showToast } = useToast();
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
  const [releaseModal, setReleaseModal] = useState({
    open: false,
    payment: null,
  });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const searchInputRef = useRef();
  const [makePaymentModal, setMakePaymentModal] = useState({
    open: false,
    contract: null,
  });
  const [unpaidContracts, setUnpaidContracts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // New state for earnings summary
  const [earningsSummary, setEarningsSummary] = useState(null);
  const [summaryPeriod, setSummaryPeriod] = useState('month');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [balance, setBalance] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Determine if user has both roles
  const isTasker = user?.role?.includes('tasker');
  const isProvider = user?.role?.includes('provider');

  // Set payer/payee filter based on view and role
  // For users with both roles, filter based on current view
  const payer = view === 'spent' ? user?._id : undefined;
  const payee = view === 'earned' ? user?._id : undefined;

  // Fetch earnings summary
  const fetchEarningsSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await apiClient.get('/payments/earnings-summary', {
        params: { period: summaryPeriod }
      });
      setEarningsSummary(res.data.data.summary);
    } catch (err) {
      console.error('Error fetching earnings summary:', err);
      showToast('Failed to fetch earnings summary', 'error');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Fetch balance for taskers
  const fetchBalance = async () => {
    if (!isTasker) return;
    try {
      const res = await apiClient.get('/payments/balance');
      setBalance(res.data.data);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  // Move fetchPayments outside useEffect - now uses payment history endpoint
  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 10,
        status: status !== 'all' ? status : undefined,
        type: type !== 'all' ? type : undefined,
        startDate: undefined, // Can be added for date filtering
        endDate: undefined,
      };
      Object.keys(params).forEach(
        key => params[key] === undefined && delete params[key]
      );
      const res = await apiClient.get('/payments/payment-history', { params });
      setTransactions(res.data.data.payments || []);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.response?.data?.message || 'Failed to fetch payments.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchPayments();
      fetchEarningsSummary();
      fetchBalance();
    }
    // eslint-disable-next-line
  }, [status, type, page, user?._id]);

  useEffect(() => {
    if (user?._id) {
      fetchEarningsSummary();
    }
    // eslint-disable-next-line
  }, [summaryPeriod, user?._id]);

  // Calculate totals from earnings summary or fallback to transactions
  const getDisplayAmount = () => {
    if (earningsSummary) {
      if (view === 'earned' && earningsSummary.tasker) {
        return parseFloat(earningsSummary.tasker.totalEarnedFormatted);
      } else if (view === 'spent' && earningsSummary.provider) {
        return parseFloat(earningsSummary.provider.totalSpentFormatted);
      }
    }
    // Fallback to transaction calculation
    const total = _transactions.reduce((sum, p) => sum + (p.amount || 0), 0);
    return total / 100;
  };

  const available = getDisplayAmount();

  // Color for summary
  const summaryColor =
    view === 'earned' ? styles.summaryValueEarned : styles.summaryValueSpent;

  const handleWithdraw = async (amount) => {
    try {
      await apiClient.post('/payments/withdraw', { amount });
      setShowWithdraw(false);
      setWithdrawSuccess(true);
      setTimeout(() => setWithdrawSuccess(false), 3000);
      showToast(`Withdrawal of $${amount.toFixed(2)} initiated successfully!`, 'success');
      
      // Refresh data
      fetchBalance();
      fetchEarningsSummary();
      fetchPayments();
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to process withdrawal.',
        'error'
      );
    }
  };

  // Add release payment handler
  const handleReleasePayment = async contractId => {
    try {
      await apiClient.post(`/payments/contracts/${contractId}/release`);
      showToast('Payment released to tasker!', 'success');
      setReleaseModal({ open: false, payment: null });
      if (user) fetchPayments();
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to release payment.',
        'error'
      );
    }
  };

  // Add make payment handler
  const handleMakePayment = async contractId => {
    try {
      await apiClient.post(
        `/payments/contracts/${contractId}/create-payment-intent`
      );
      showToast(
        'Payment initiated! Please complete the payment in the next step.',
        'success'
      );
      setMakePaymentModal({ open: false, contract: null });
      if (user) fetchPayments();
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to initiate payment.',
        'error'
      );
    }
  };

  // Fetch unpaid contracts if no payments found and provider is in 'spent' view
  useEffect(() => {
    if (sessionRole === 'provider' && view === 'spent' && user) {
      apiClient.get('/contracts/my-contracts-with-payments').then(res => {
        // Show all contracts that are active or submitted
        const contractsWithPayments = (res.data.data || []).filter(item =>
          ['active', 'submitted'].includes(
            (item.contract.status || '').toLowerCase()
          )
        );
        setUnpaidContracts(contractsWithPayments);
      });
    } else {
      setUnpaidContracts([]);
    }
    // eslint-disable-next-line
  }, [sessionRole, view, user]);

  return (
    <div className={styles.container}>
      <WithdrawModal
        open={showWithdraw && view === 'earned'}
        onClose={() => setShowWithdraw(false)}
        available={balance?.available ? parseFloat(balance.available) : 0}
        onConfirm={handleWithdraw}
      />
      <InvoiceModal
        open={invoiceModal.open}
        onClose={() => setInvoiceModal({ open: false, payment: null })}
        payment={invoiceModal.payment}
        showToast={showToast}
      />
      
      {/* Earnings Summary Section */}
      {summaryLoading ? (
        <div className={styles.loadingCard}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading earnings summary...</p>
        </div>
      ) : earningsSummary ? (
        <EarningsSummary
          summary={earningsSummary}
          period={summaryPeriod}
          onPeriodChange={setSummaryPeriod}
          isTasker={isTasker}
          isProvider={isProvider}
        />
      ) : null}
      <div className={styles.searchAndFilters}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search payments..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button
            className={styles.filterButton}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className={styles.filterIcon} /> Filters
          </button>
        </div>
        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterSection}>
              <h3>Status</h3>
              <div className={styles.priceRangeList}>
                {statusOptions.map(opt => (
                  <button
                    key={opt}
                    className={`${styles.priceRangeButton} ${status === opt ? styles.selected : ''}`}
                    onClick={() => setStatus(opt)}
                  >
                    {opt.charAt(0).toUpperCase() +
                      opt.slice(1).replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.filterSection}>
              <h3>Type</h3>
              <div className={styles.priceRangeList}>
                {typeOptions.map(opt => (
                  <button
                    key={opt}
                    className={`${styles.priceRangeButton} ${type === opt ? styles.selected : ''}`}
                    onClick={() => setType(opt)}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.filterSection}>
              <h3>Amount Range</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={e => setMinAmount(e.target.value)}
                  className={styles.searchInput}
                  style={{ width: 100 }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={e => setMaxAmount(e.target.value)}
                  className={styles.searchInput}
                  style={{ width: 100 }}
                />
              </div>
            </div>
            <button
              className={styles.clearFiltersButton}
              onClick={() => {
                setStatus('all');
                setType('all');
                setMinAmount('');
                setMaxAmount('');
                setSearch('');
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
      {/* Card with summary and table below */}
      <div className={styles.card}>
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
              disabled={!balance || parseFloat(balance.available) <= 0}
            >
              Withdraw {balance && `($${balance.available} available)`}
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
        {/* Debug information removed for production */}
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
                <th>{sessionRole === 'tasker' ? 'Provider' : 'Tasker'}</th>
                <th>Date</th>
                <th>Contract Detail</th>
                <th>Amount</th>
                <th>Invoice</th>
                {view === 'spent' && isProvider && <th>Release Payment</th>}
              </tr>
            </thead>
            <tbody>
              {_transactions.length === 0 && unpaidContracts.length > 0 ? (
                unpaidContracts.map((item, idx) => {
                  const { contract, payment } = item;
                  return (
                    <tr key={contract.id || contract._id || idx}>
                      <td>{contract.hiredBy || contract.provider || ''}</td>
                      <td>
                        {contract.started ||
                          (contract.createdAt
                            ? new Date(contract.createdAt).toLocaleDateString()
                            : '')}
                      </td>
                      <td className={styles.contractDetail}>
                        {contract.title || contract.gigTitle || 'N/A'}
                      </td>
                      <td>{contract.rate || contract.gigCost || 'N/A'}</td>
                      <td>{payment ? payment.status || 'Pending' : '-'}</td>
                      <td>
                        {(!payment || payment.status !== 'succeeded') && (
                          <button
                            className={styles.releaseBtn}
                            onClick={() =>
                              setMakePaymentModal({ open: true, contract })
                            }
                          >
                            Make Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : _transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={view === 'earned' ? 5 : 7}
                    style={{ textAlign: 'center', color: '#888' }}
                  >
                    No payments found.
                  </td>
                </tr>
              ) : (
                _transactions.map((inv, idx) => (
                  <tr key={inv._id || idx}>
                    <td style={{ color: '#333', fontWeight: '500' }}>
                      {/* Show provider name for taskers, tasker name for providers */}
                      {sessionRole === 'tasker' 
                        ? `${inv.payer?.firstName || ''} ${inv.payer?.lastName || ''}`.trim() || 'N/A'
                        : `${inv.payee?.firstName || ''} ${inv.payee?.lastName || ''}`.trim() || 'N/A'
                      }
                    </td>
                    <td style={{ color: '#333' }}>
                      {inv.createdAt
                        ? new Date(inv.createdAt).toLocaleDateString()
                        : ''}
                    </td>
                    <td className={styles.contractDetail} style={{ color: '#333' }}>
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
                    {/* Make Payment button for providers in 'spent' view, status 'active' or 'submitted' */}
                    {view === 'spent' &&
                      sessionRole === 'provider' &&
                      inv.contract &&
                      ['active', 'submitted'].includes(
                        inv.contract.status?.toLowerCase()
                      ) && (
                        <td>
                          <button
                            className={styles.releaseBtn}
                            onClick={() =>
                              setMakePaymentModal({
                                open: true,
                                contract: inv.contract,
                              })
                            }
                          >
                            Make Payment
                          </button>
                        </td>
                      )}
                    {/* Release Payment button for providers in 'spent' view, status 'submitted' */}
                    {view === 'spent' &&
                      sessionRole === 'provider' &&
                      inv.contract &&
                      inv.contract.status?.toLowerCase() === 'submitted' && (
                        <td>
                          <button
                            className={styles.releaseBtn}
                            onClick={() =>
                              setReleaseModal({ open: true, payment: inv })
                            }
                          >
                            Release Payment
                          </button>
                        </td>
                      )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className={styles.paginationBtn}
            >
              Previous
            </button>
            <span className={styles.paginationInfo}>
              Page {pagination.currentPage} of {pagination.totalPages} 
              ({pagination.totalItems} total)
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
              className={styles.paginationBtn}
            >
              Next
            </button>
          </div>
        )}
      </div>
      {/* Release Payment Modal */}
      {releaseModal.open && releaseModal.payment && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Release Payment</h3>
              <button
                className={styles.closeButton}
                onClick={() => setReleaseModal({ open: false, payment: null })}
                aria-label="Close release modal"
              >
                ✖
              </button>
            </div>
            <div className={styles.modalBody}>
              <div>
                <b>Contract:</b> {releaseModal.payment.contract?.title || 'N/A'}
              </div>
              <div>
                <b>Tasker:</b> {releaseModal.payment.payee?.firstName}{' '}
                {releaseModal.payment.payee?.lastName}
              </div>
              <div>
                <b>Amount:</b> $
                {((releaseModal.payment.amount || 0) / 100).toFixed(2)}
              </div>
              <div>
                <b>Status:</b> {releaseModal.payment.contract?.status}
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.primaryBtn}
                onClick={() =>
                  handleReleasePayment(
                    releaseModal.payment.contract._id ||
                      releaseModal.payment.contract.id
                  )
                }
              >
                Confirm Release
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={() => setReleaseModal({ open: false, payment: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Make Payment Modal */}
      {makePaymentModal.open && makePaymentModal.contract && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Make Payment</h3>
              <button
                className={styles.closeButton}
                onClick={() =>
                  setMakePaymentModal({ open: false, contract: null })
                }
                aria-label="Close make payment modal"
              >
                ✖
              </button>
            </div>
            <div className={styles.modalBody}>
              <div>
                <b>Contract:</b> {makePaymentModal.contract.title || 'N/A'}
              </div>
              <div>
                <b>Tasker:</b> {makePaymentModal.contract.taskerName || 'N/A'}
              </div>
              <div>
                <b>Amount:</b> {makePaymentModal.contract.rate || 'N/A'}
              </div>
              <div>
                <b>Status:</b> {makePaymentModal.contract.status}
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.primaryBtn}
                onClick={() =>
                  handleMakePayment(
                    makePaymentModal.contract._id ||
                      makePaymentModal.contract.id
                  )
                }
              >
                Confirm Payment
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={() =>
                  setMakePaymentModal({ open: false, contract: null })
                }
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
