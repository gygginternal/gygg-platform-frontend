import React, { useState, createContext, useContext, useEffect } from 'react';
// import cn from "classnames"; // No longer needed
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns'; // Import date-fns for formatting dates
import apiClient from '../../api/axiosConfig';
import styles from './ContractsPage.module.css';
import ProfileSidebar from '../../components/Shared/ProfileSidebar';
import { TabNavigation } from '../../components/Shared/TabNavigation'; // Import the TabNavigation component
import InputField from '../../components/Shared/InputField';
import Toggle from '../../components/Shared/Toggle';
import { StatusBadge } from '../../components/Shared/StatusBadge'; // Adjust the import path
import BillingAndPayment from '../BillingAndPayment/BillingAndPayment';
import { CATEGORY_ENUM } from '../../constants/categories';
import { Search, Filter, DollarSign, User } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import ContractCard from '../../components/ContractsPage/ContractCard';
import CheckoutForm from '../../components/Shared/CheckoutForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const ContractsContext = createContext();
export function useContracts() {
  return useContext(ContractsContext);
}

const statusClass = {
  Active: styles.active,
  'Offer waiting': styles.offerWaiting,
  Ended: styles.ended,
};

function JobListingsPage({ contracts, onContractClick }) {
  return (
    <div className={styles.contractsCard}>
      <div className={styles.contractsList}>
        {contracts.length === 0 ? (
          <div className={styles.emptyState}>No contracts found.</div>
        ) : (
          contracts.map((job, index) => (
            <div
              key={job.id}
              className={styles.contractRow}
              onClick={() => onContractClick(job)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') onContractClick(job);
              }}
              tabIndex={0}
              role="button"
              aria-expanded={false}
            >
              <div className={styles.contractMain}>
                <div className={styles.contractTitle}>{job.gigTitle}</div>
                <div className={styles.contractDetailsRow}>
                  <span className={styles.contractDetailLabel}>
                    Hired by <b>{job.provider}</b>
                  </span>
                  <span className={styles.contractDetailLabel}>
                    Rate <span className={styles.contractRate}>{job.rate}</span>
                  </span>
                  <span
                    className={`${styles.contractStatusBadge} ${statusClass[job.status] || ''}`}
                  >
                    {job.status}
                  </span>
                </div>
                <div className={styles.contractDetailsRow}>
                  <span className={styles.contractDetailLabel}>
                    Contract ID {job.contractId}
                  </span>
                  <span className={styles.contractDetailLabel}>
                    Earned{' '}
                    <span className={styles.contractEarned}>{job.earned}</span>
                  </span>
                  <span className={styles.contractStarted}>
                    Started {job.started}
                  </span>
                </div>
              </div>
              {index !== contracts.length - 1 && (
                <div className={styles.contractDivider} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function JobListingItem({ job }) {
  // Format the createdAt date
  const formattedDate = job.createdAt
    ? format(new Date(job.createdAt), 'MM-dd-yyyy')
    : 'N/A';

  return (
    <div>
      <Link to={`/gigs/${job.gigId}`} className={styles.jobTitleLink}>
        {job.gigTitle}
      </Link>
      <div className={styles.jobDetailsRow}>
        <div>
          <div className={styles.jobDetailItem}>
            <span className={styles.jobDetailLabel}>Hired by</span>
            <div className={styles.jobDetailValue}>{job.provider}</div>
          </div>
          <div
            className={`${styles.jobDetailItem} ${styles.jobDetailItemMarginTop}`}
          >
            <span className={styles.jobDetailLabel}>Contract ID</span>
            <div className={styles.jobDetailValue}>{job.contractId}</div>
          </div>
        </div>
        <div className={styles.jobStatusContainer}>
          <StatusBadge status={job.status} />
          <div
            className={`${styles.jobDetailItem} ${styles.jobDetailItemMarginTop}`}
          >
            <span className={styles.jobDetailLabel}>Started</span>
            <span className={styles.jobDetailValue}>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const priceRanges = ['Any', 'Under $20', '$20 - $50', '$50 - $100', '$100+'];
const statusOptions = [
  'All',
  'active',
  'completed',
  'cancelled_by_provider',
  'cancelled_by_tasker',
  'cancelled_mutual',
  'pending_acceptance',
  'pending_payment',
  'submitted',
  'approved',
];

function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]); // State for selected statuses
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minCost, setMinCost] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [activeTab, setActiveTab] = useState('contracts'); // State for active tab
  const [newContracts, setNewContracts] = useState([]); // For newly added contracts
  const [expandedId, setExpandedId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState('Any');
  const [status, setStatus] = useState('All');
  const [modalContract, setModalContract] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    contract: null,
    clientSecret: null,
    loading: false,
  });
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { user, sessionRole } = useAuth();

  const tabOptions = [
    { id: 'contracts', label: 'All Contracts' },
    { id: 'billing', label: 'Billing and payment' },
  ];

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setPriceRange('Any');
    setStatus('All');
  };

  useEffect(() => {
    // Map priceRange to minCost/maxCost
    let minCost, maxCost;
    if (priceRange === 'Under $20') maxCost = 20;
    else if (priceRange === '$20 - $50') {
      minCost = 20;
      maxCost = 50;
    } else if (priceRange === '$50 - $100') {
      minCost = 50;
      maxCost = 100;
    } else if (priceRange === '$100+') minCost = 100;
    // Map status
    const statusParam = status !== 'All' ? status : undefined;
    const params = {
      name: search,
      status: statusParam,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      minCost,
      maxCost,
    };
    Object.keys(params).forEach(
      key => params[key] === undefined && delete params[key]
    );
    apiClient.get('/contracts/my-contracts', { params }).then(res => {
      const mapped = res.data.data.contracts.map(c => ({
        id: c.id || c.contractId || Math.random(),
        title: c.gigTitle || c.title || 'Contract',
        hiredBy: c.provider || c.hiredBy || '',
        provider: c.provider,
        contractId: c.id || c.contractId || '',
        status: c.status || 'Active',
        description:
          c.description ||
          'Looking for a reliable dog sitter to take care of my baby Mia (Puppy Poodle) while I am away for work. Details can be discussed in messages.',
        started: c.createdAt
          ? new Date(c.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: '2-digit',
              year: 'numeric',
            })
          : '',
        location: c.location || 'Thornhill',
        rate: c.rate || '$23/hr',
        duration: c.duration || '4 hours',
        earned: c.earned || '$96',
        category: c.gigCategory || 'Other',
        cost: c.gigCost || 0,
      }));
      setContracts(mapped);
    });
  }, [search, selectedCategory, priceRange, status]);

  const filteredContracts = contracts.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = e => {
    if (e.key === 'Enter') {
      setSearch(e.target.value); // Update the actual search query
    }
  };

  const toggleStatus = status => {
    setSelectedStatuses(
      prevStatuses =>
        prevStatuses.includes(status)
          ? prevStatuses.filter(s => s !== status) // Remove status if already selected
          : [...prevStatuses, status] // Add status if not selected
    );
  };

  const handleExpand = id => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Example rows for the BillingTable
  const billingRows = [
    {
      hiredBy: 'Justin.S',
      date: 'Jun, 24, 2025',
      detail: 'Dog sitting for the weekend...',
      invoice: 'View',
    },
    {
      hiredBy: 'Alice.J',
      date: 'Jun, 25, 2025',
      detail: 'Graphic design project...',
      invoice: 'View',
    },
  ];

  // Mutation for submitting as complete (tasker)
  const submitMutation = useMutation({
    mutationFn: async contractId => {
      await apiClient.patch(`/contracts/${contractId}/submit-work`);
    },
    onSuccess: () => {
      showToast('Work submitted successfully!', 'success');
      setIsModalOpen(false);
      setModalContract(null);
      queryClient.invalidateQueries(['contracts']);
    },
    onError: error => {
      showToast(
        error.response?.data?.message || 'Failed to submit work.',
        'error'
      );
    },
  });

  // Mutation for approving completion (provider)
  const approveMutation = useMutation({
    mutationFn: async contractId => {
      await apiClient.patch(`/contracts/${contractId}/approve-completion`);
    },
    onSuccess: () => {
      showToast('Work approved and contract completed!', 'success');
      setIsModalOpen(false);
      setModalContract(null);
      queryClient.invalidateQueries(['contracts']);
    },
    onError: error => {
      showToast(
        error.response?.data?.message || 'Failed to approve completion.',
        'error'
      );
    },
  });

  return (
    <ContractsContext.Provider
      value={{
        addContract: contract => setNewContracts(prev => [contract, ...prev]),
      }}
    >
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <aside className={styles.sidebarArea}>
            <ProfileSidebar />
          </aside>
          <main
            className={`${styles.mainFeedArea} ${styles.mainFeedAreaMarginLeft}`}
          >
            {/* Dashboard Header */}
            <div className={styles.dashboardHeader}>
              <div className={styles.headerContent}>
                <div className={styles.headerIcon}>
                  <DollarSign size={24} />
                </div>
                <div>
                  <h1 className={styles.dashboardTitle}>Contracts Dashboard</h1>
                  <p className={styles.dashboardSubtitle}>
                    Track and manage your active and completed contracts
                  </p>
                </div>
              </div>
            </div>

            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={tabOptions}
            />
            {activeTab === 'contracts' && (
              <>
                {/* Stats Cards - moved inside All Contracts tab */}
                <div className={styles.statsGrid}>
                  <div
                    className={styles.statCard}
                    style={{
                      '--stat-color': '#2196f3',
                      '--stat-color-light': '#42a5f5',
                    }}
                  >
                    <div className={styles.statNumber}>{contracts.length}</div>
                    <div className={styles.statLabel}>Total</div>
                    <div
                      className={styles.statDot}
                      style={{ backgroundColor: '#2196f3' }}
                    ></div>
                  </div>
                  <div
                    className={styles.statCard}
                    style={{
                      '--stat-color': '#4caf50',
                      '--stat-color-light': '#66bb6a',
                    }}
                  >
                    <div className={styles.statNumber}>
                      {
                        contracts.filter(
                          c => c.status?.toLowerCase() === 'active'
                        ).length
                      }
                    </div>
                    <div className={styles.statLabel}>Active</div>
                    <div
                      className={styles.statDot}
                      style={{ backgroundColor: '#4caf50' }}
                    ></div>
                  </div>
                  <div
                    className={styles.statCard}
                    style={{
                      '--stat-color': '#00bcd4',
                      '--stat-color-light': '#26c6da',
                    }}
                  >
                    <div className={styles.statNumber}>
                      {
                        contracts.filter(
                          c => c.status?.toLowerCase() === 'completed'
                        ).length
                      }
                    </div>
                    <div className={styles.statLabel}>Completed</div>
                    <div
                      className={styles.statDot}
                      style={{ backgroundColor: '#00bcd4' }}
                    ></div>
                  </div>
                  <div
                    className={styles.statCard}
                    style={{
                      '--stat-color': '#f44336',
                      '--stat-color-light': '#ef5350',
                    }}
                  >
                    <div className={styles.statNumber}>
                      {
                        contracts.filter(c =>
                          c.status?.toLowerCase().includes('cancelled')
                        ).length
                      }
                    </div>
                    <div className={styles.statLabel}>Cancelled</div>
                    <div
                      className={styles.statDot}
                      style={{ backgroundColor: '#f44336' }}
                    ></div>
                  </div>
                  <div
                    className={styles.statCard}
                    style={{
                      '--stat-color': '#9c27b0',
                      '--stat-color-light': '#ab47bc',
                    }}
                  >
                    <div className={styles.statNumber}>
                      {
                        contracts.filter(
                          c => c.status?.toLowerCase() === 'pending_payment'
                        ).length
                      }
                    </div>
                    <div className={styles.statLabel}>Pending Payment</div>
                    <div
                      className={styles.statDot}
                      style={{ backgroundColor: '#9c27b0' }}
                    ></div>
                  </div>
                </div>
              </>
            )}
            {activeTab === 'contracts' && (
              <div className={styles.searchAndFilters}>
                <div className={styles.searchBar}>
                  <Search className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search contracts..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={styles.searchInput}
                  />
                  <button
                    className={styles.filterButton}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className={styles.filterIcon} />
                    Filters
                  </button>
                </div>
                {showFilters && (
                  <div className={styles.filtersPanel}>
                    <div className={styles.filterSection}>
                      <h3>Categories</h3>
                      <div className={styles.categoryList}>
                        {['All', ...CATEGORY_ENUM].map(category => (
                          <button
                            key={category}
                            className={`${styles.categoryButton} ${selectedCategory === category ? styles.selected : ''}`}
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.filterSection}>
                      <h3>Price Range</h3>
                      <div className={styles.priceRangeList}>
                        {priceRanges.map(range => (
                          <button
                            key={range}
                            className={`${styles.priceRangeButton} ${priceRange === range ? styles.selected : ''}`}
                            onClick={() => setPriceRange(range)}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.filterSection}>
                      <h3>Status</h3>
                      <div className={styles.priceRangeList}>
                        {statusOptions.map(opt => (
                          <button
                            key={opt}
                            className={`${styles.priceRangeButton} ${status === opt ? styles.selected : ''}`}
                            onClick={() => setStatus(opt)}
                          >
                            {opt === 'cancelled_by_provider'
                              ? 'Cancelled by Provider'
                              : opt === 'cancelled_by_tasker'
                                ? 'Cancelled by Tasker'
                                : opt === 'cancelled_mutual'
                                  ? 'Cancelled (Mutual)'
                                  : opt
                                      .replace(/_/g, ' ')
                                      .replace(/\b\w/g, l => l.toUpperCase())}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      className={styles.clearFiltersButton}
                      onClick={clearFilters}
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'contracts' && (
              <>
                <div className={styles.applicationsList}>
                  {filteredContracts.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>
                        <DollarSign size={48} />
                      </div>
                      <h3>No Contracts Found</h3>
                      <p>
                        You don't have any contracts matching your current
                        filters.
                      </p>
                    </div>
                  ) : (
                    filteredContracts.map(contract => (
                      <ContractCard
                        key={contract.id}
                        contract={{
                          id: contract.id,
                          title: contract.title,
                          hiredBy: contract.hiredBy,
                          contractId: contract.contractId,
                          status: contract.status,
                          rate: contract.rate,
                          earned: contract.earned,
                          started: contract.started,
                          location: contract.location,
                          duration: contract.duration,
                          category: contract.category,
                        }}
                        onClick={() => {
                          setModalContract(contract);
                          setIsModalOpen(true);
                        }}
                      />
                    ))
                  )}
                </div>
              </>
            )}
            {activeTab === 'billing' && <BillingAndPayment />}
          </main>
        </div>
      </div>
      {isModalOpen && modalContract && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Contract Details</h3>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setIsModalOpen(false);
                  setModalContract(null);
                }}
                aria-label="Close contract modal"
              >
                ✖
              </button>
            </div>
            <div className={styles.modalBody}>
              <div>
                <b>Title:</b> {modalContract.gigTitle || modalContract.title}
              </div>
              <div>
                <b>Hired by:</b>{' '}
                {modalContract.provider || modalContract.hiredBy}
              </div>
              <div>
                <b>Rate:</b> {modalContract.rate}
              </div>
              <div>
                <b>Status:</b> {modalContract.status}
              </div>
            </div>
            <div className={styles.modalActions}>
              {sessionRole === 'provider' &&
                ['active', 'submitted'].includes(
                  modalContract.status?.toLowerCase()
                ) && (
                  <button
                    className={styles.primaryBtn}
                    onClick={async () => {
                      setPaymentModal(prev => ({ ...prev, loading: true }));
                      try {
                        const response = await apiClient.post(
                          `/payments/contracts/${modalContract.id || modalContract._id}/create-payment-intent`
                        );

                        // Close the contract details modal and open payment modal
                        setIsModalOpen(false);
                        setModalContract(null);

                        // Open payment modal with client secret
                        setPaymentModal({
                          open: true,
                          contract: modalContract,
                          clientSecret: response.data.clientSecret,
                          loading: false,
                        });
                      } catch (err) {
                        setPaymentModal(prev => ({ ...prev, loading: false }));
                        showToast(
                          err.response?.data?.message ||
                            'Failed to initiate payment.',
                          'error'
                        );
                      }
                    }}
                    disabled={paymentModal.loading}
                  >
                    {paymentModal.loading ? 'Processing...' : 'Make Payment'}
                  </button>
                )}
              {sessionRole === 'provider' &&
                modalContract.status?.toLowerCase() === 'submitted' && (
                  <button
                    className={styles.primaryBtn}
                    onClick={() =>
                      approveMutation.mutate(
                        modalContract.id || modalContract._id
                      )
                    }
                  >
                    Approve Completion
                  </button>
                )}
              {sessionRole === 'tasker' &&
                modalContract.status?.toLowerCase() === 'active' && (
                  <button
                    className={styles.primaryBtn}
                    onClick={() =>
                      submitMutation.mutate(
                        modalContract.id || modalContract._id
                      )
                    }
                  >
                    Submit as Complete
                  </button>
                )}
              <button
                className={styles.secondaryBtn}
                onClick={() => {
                  setIsModalOpen(false);
                  setModalContract(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal.open && paymentModal.clientSecret && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Complete Payment</h3>
              <button
                className={styles.closeButton}
                onClick={() =>
                  setPaymentModal({
                    open: false,
                    contract: null,
                    clientSecret: null,
                    loading: false,
                  })
                }
                aria-label="Close payment modal"
              >
                ✖
              </button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ marginBottom: '20px' }}>
                <div>
                  <b>Contract:</b>{' '}
                  {paymentModal.contract?.title ||
                    paymentModal.contract?.gig?.title ||
                    'N/A'}
                </div>
                <div>
                  <b>Hired by:</b>{' '}
                  {paymentModal.contract?.provider?.firstName ||
                    paymentModal.contract?.providerName ||
                    'N/A'}{' '}
                  {paymentModal.contract?.provider?.lastName || ''}
                </div>
                <div>
                  <b>Rate:</b> $
                  {paymentModal.contract?.agreedCost ||
                    paymentModal.contract?.rate ||
                    'N/A'}
                </div>
              </div>

              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: paymentModal.clientSecret,
                  appearance: {
                    theme: 'stripe',
                  },
                  // Disable Link to avoid phone number validation issues
                  loader: 'auto',
                }}
              >
                <CheckoutForm
                  clientSecret={paymentModal.clientSecret}
                  onPaymentSuccess={async paymentIntentId => {
                    try {
                      // Confirm payment success with backend
                      await apiClient.post(
                        '/payments/confirm-payment-success',
                        {
                          paymentIntentId,
                        }
                      );

                      showToast(
                        'Payment completed successfully! Contract has been completed.',
                        'success'
                      );
                      setPaymentModal({
                        open: false,
                        contract: null,
                        clientSecret: null,
                        loading: false,
                      });

                      // Refresh contracts data
                      queryClient.invalidateQueries(['contracts']);
                    } catch (error) {
                      console.error('Error confirming payment:', error);
                      showToast(
                        'Payment succeeded but there was an issue updating the contract. Please contact support.',
                        'warning'
                      );
                      setPaymentModal({
                        open: false,
                        contract: null,
                        clientSecret: null,
                        loading: false,
                      });
                    }
                  }}
                  onPaymentError={error => {
                    showToast(`Payment failed: ${error}`, 'error');
                  }}
                />
              </Elements>
            </div>
          </div>
        </div>
      )}
    </ContractsContext.Provider>
  );
}

export default ContractsPage;
