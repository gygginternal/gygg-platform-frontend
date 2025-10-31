import React, { useState, createContext, useContext, useEffect } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns'; // Import date-fns for formatting dates
import apiClient from '../../api/axiosConfig';
import styles from './ContractsPage.module.css';
import ProfileSidebar from '../../components/common/ProfileSidebar';
import { TabNavigation } from '../../components/common/TabNavigation'; // Import the TabNavigation component
import InputField from '../../components/common/InputField';
import Toggle from '../../components/common/Toggle';
import { StatusBadge } from '../../components/common/StatusBadge'; // Adjust the import path
import BillingAndPayment from '../BillingAndPayment/BillingAndPayment';
import { CATEGORY_ENUM } from '../../constants/categories';
import { Search, Filter } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import NuveiSimplyConnectPayment from '../../components/common/NuveiSimplyConnectPayment';
import ContractCard from '../../components/features/ContractsPage/ContractCard';
import CheckoutForm from '../../components/common/CheckoutForm';
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
  const [loading, setLoading] = useState(true); // Main loading state
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    contract: null,
    clientSecret: null,
    loading: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { user, sessionRole } = useAuth();
  const navigate = useNavigate();

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

  const fetchContracts = async (pageToFetch = 1) => {
    const isFirstPage = pageToFetch === 1;
    if (isFirstPage) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
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
        page: pageToFetch,
        limit: 10, // Load 10 contracts per page
        name: search,
        status: statusParam,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        minCost,
        maxCost,
      };
      
      // Clean up undefined parameters
      Object.keys(params).forEach(
        key => params[key] === undefined && delete params[key]
      );
      
      const res = await apiClient.get('/contracts/my-contracts', { params });
      
      // Update pagination info - pagination data is in the root level
      const totalPages = res.data.totalPages || 1;
      const currentPage = res.data.currentPage || 1;
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
      setHasMore(currentPage < totalPages);
      
      // Check if contracts exist in response
      const contractsData = res.data.data?.contracts || [];
      const mapped = contractsData.map(c => ({
        id: c.id || c.contractId,
        title: c.gigTitle || 'Contract',
        hiredBy: c.hiredBy || c.displayName || '',
        displayName: c.displayName,
        displayImage: c.displayImage,
        provider: c.provider,
        providerId: c.providerId,
        taskerId: c.taskerId,
        contractId: c.id || c.contractId,
        status: c.status || 'Active',
        description: c.description || 'Contract details',
        started: c.createdAt
          ? new Date(c.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: '2-digit',
              year: 'numeric',
            })
          : '',
        location: c.location || 'Location TBD',
        rate: c.rate || 'Rate TBD',
        duration: c.duration || 'Duration TBD',
        earned: c.earned || '$0',
        category: c.gigCategory || 'Other',
        cost: c.gigCost || 0,
      }));
      
      if (isFirstPage) {
        setContracts(mapped);
      } else {
        setContracts(prev => [...prev, ...mapped]);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      if (isFirstPage) setContracts([]);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (user) {
      setCurrentPage(1);
      setContracts([]);
      fetchContracts(1);
    }
  }, [user, search, selectedCategory, priceRange, status]);

  // Using contracts that are already filtered by the backend
  const filteredContracts = contracts;

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
            className={styles.mainFeedArea}
          >
            {/* Dashboard Header */}
            <div className={styles.header}>
              <h1 className={styles.title}>Contracts</h1>
              <p className={styles.subtitle}>
                Track and manage your active and completed contracts
              </p>
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
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{contracts.length}</div>
                    <div className={styles.statLabel}>Total</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>
                      {
                        contracts.filter(
                          c => c.status?.toLowerCase() === 'active'
                        ).length
                      }
                    </div>
                    <div className={styles.statLabel}>Active</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>
                      {
                        contracts.filter(
                          c => c.status?.toLowerCase() === 'completed'
                        ).length
                      }
                    </div>
                    <div className={styles.statLabel}>Completed</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>
                      {
                        contracts.filter(c =>
                          c.status?.toLowerCase().includes('cancelled')
                        ).length
                      }
                    </div>
                    <div className={styles.statLabel}>Cancelled</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>
                      {
                        contracts.filter(
                          c => c.status?.toLowerCase() === 'pending_payment'
                        ).length
                      }
                    </div>
                    <div className={styles.statLabel}>Pending Payment</div>
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
                  {loading && contracts.length === 0 ? (
                    <div className={styles.emptyState}>
                      <h3>Loading Contracts...</h3>
                      <p>Please wait while we fetch your contracts.</p>
                    </div>
                  ) : filteredContracts.length === 0 ? (
                    <div className={styles.emptyState}>
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
                          gigTitle: contract.title,
                          title: contract.title,
                          hiredBy: contract.hiredBy,
                          displayName: contract.displayName,
                          displayImage: contract.displayImage,
                          providerId: contract.providerId,
                          taskerId: contract.taskerId,
                          contractId: contract.contractId,
                          status: contract.status,
                          rate: contract.rate,
                          earned: contract.earned,
                          started: contract.started,
                          location: contract.location,
                          duration: contract.duration,
                          gigCategory: contract.category,
                          category: contract.category,
                        }}
                        onClick={() => {
                          setModalContract(contract);
                          setIsModalOpen(true);
                        }}
                      />
                    ))
                  )}
                  
                  {/* Loading more indicator */}
                  {isLoadingMore && (
                    <div className={styles.loadingMore}>
                      <div className={styles.loadingSpinnerSmall}></div>
                      <p>Loading more contracts...</p>
                    </div>
                  )}
                  
                  {/* Load More Button */}
                  {hasMore && !isLoadingMore && (
                    <button 
                      onClick={() => fetchContracts(currentPage + 1)}
                      className={styles.loadMoreButton}
                    >
                      Load More Contracts
                    </button>
                  )}
                  
                  {!hasMore && filteredContracts.length > 0 && (
                    <p className={styles.endOfResults}>
                      You've reached the end of the results.
                    </p>
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
                <b>
                  {sessionRole === 'provider' ? 'Working with' : 'Hired by'}:
                </b>{' '}
                {modalContract.displayName || modalContract.hiredBy}
              </div>
              <div>
                <b>Rate:</b> {modalContract.rate}
              </div>
              <div>
                <b>Status:</b> {modalContract.status}
              </div>
              <div>
                <b>Location:</b> {modalContract.location}
              </div>
              <div>
                <b>Duration:</b> {modalContract.duration}
              </div>
              <div>
                <b>Earned:</b> {modalContract.earned}
              </div>
            </div>
            <div className={styles.modalActions}>
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
              {sessionRole === 'provider' &&
                modalContract.status?.toLowerCase() === 'pending_payment' && (
                  <button
                    className={styles.primaryBtn}
                    onClick={() => {
                      // Navigate to the payment page with the contract ID
                      window.location.href = `/payment?contractId=${modalContract.id || modalContract._id}`;
                    }}
                  >
                    Pay Tasker
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

              {/* Show Rate Tasker button for completed contracts (only for providers) */}
              {sessionRole === 'provider' &&
                modalContract.status?.toLowerCase() === 'completed' && (
                  <button
                    className={styles.primaryBtn}
                    onClick={() => {
                      // Close the modal first
                      setIsModalOpen(false);
                      setModalContract(null);
                      // Navigate to the rate tasker page
                      navigate(
                        `/contracts/${modalContract.id || modalContract._id}/rate-tasker`
                      );
                    }}
                  >
                    Rate Tasker
                  </button>
                )}

              {/* Only show Message button for non-completed contracts */}
              {modalContract.status?.toLowerCase() !== 'completed' && (
                <button
                  className={styles.secondaryBtn}
                  onClick={() => {
                    // Navigate to messages/chat with the other party
                    const otherPartyId =
                      sessionRole === 'provider'
                        ? modalContract.taskerId
                        : modalContract.providerId;
                    if (otherPartyId) {
                      // Close the modal first
                      setIsModalOpen(false);
                      setModalContract(null);
                      // Navigate to chat with the specific user
                      navigate(`/messages/${otherPartyId}`);
                    } else {
                      showToast(
                        'Unable to find the other party to message.',
                        'error'
                      );
                    }
                  }}
                >
                  Message
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
      {paymentModal.open && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Complete Payment</h3>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setPaymentModal({
                    open: false,
                    contract: null,
                    clientSecret: null,
                    loading: false,
                    paymentMethod: 'stripe', // Default to Stripe
                  });
                }}
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

              {/* Payment Method Selection */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '10px' }}>Select Payment Method</h4>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <button
                    className={`${styles.tabButton} ${!paymentModal.paymentMethod || paymentModal.paymentMethod === 'stripe' ? styles.activeTab : ''}`}
                    onClick={() => setPaymentModal(prev => ({ ...prev, paymentMethod: 'stripe' }))}
                    style={{
                      padding: '10px 15px',
                      border: '1px solid #ddd',
                      backgroundColor: paymentModal.paymentMethod === 'stripe' ? '#007bff' : '#f8f9fa',
                      color: paymentModal.paymentMethod === 'stripe' ? 'white' : '#333',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    Credit Card (Stripe)
                  </button>
                  <button
                    className={`${styles.tabButton} ${paymentModal.paymentMethod === 'nuvei' ? styles.activeTab : ''}`}
                    onClick={() => setPaymentModal(prev => ({ ...prev, paymentMethod: 'nuvei' }))}
                    style={{
                      padding: '10px 15px',
                      border: '1px solid #ddd',
                      backgroundColor: paymentModal.paymentMethod === 'nuvei' ? '#007bff' : '#f8f9fa',
                      color: paymentModal.paymentMethod === 'nuvei' ? 'white' : '#333',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    Nuvei (Cards/InstaDebit)
                  </button>
                </div>
              </div>

              {/* Stripe Payment Form */}
              {(!paymentModal.paymentMethod || paymentModal.paymentMethod === 'stripe') && paymentModal.clientSecret && (
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
                          paymentMethod: 'stripe',
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
                          paymentMethod: 'stripe',
                        });
                      }
                    }}
                    onPaymentError={error => {
                      showToast(`Payment failed: ${error}`, 'error');
                    }}
                  />
                </Elements>
              )}

              {/* Nuvei Simply Connect Payment */}
              {paymentModal.paymentMethod === 'nuvei' && (
                <NuveiSimplyConnectPayment
                  contract={paymentModal.contract}
                  amount={parseFloat(paymentModal.contract?.agreedCost || paymentModal.contract?.rate || 0)}
                  onPaymentSuccess={async (result) => {
                    try {
                      // Confirm payment success with backend
                      await apiClient.post('/payments/nuvei/confirm-simply-connect-payment', {
                        contractId: paymentModal.contract?.id || paymentModal.contract?._id,
                        transactionId: result.TransactionId || result.transactionId,
                        paymentResult: result
                      });

                      showToast(
                        'Payment completed successfully! Contract has been completed.',
                        'success'
                      );
                      setPaymentModal({
                        open: false,
                        contract: null,
                        clientSecret: null,
                        loading: false,
                        paymentMethod: 'nuvei',
                      });

                      // Refresh contracts data
                      queryClient.invalidateQueries(['contracts']);
                    } catch (error) {
                      console.error('Error confirming Nuvei payment:', error);
                      showToast(
                        'Payment succeeded but there was an issue updating the contract. Please contact support.',
                        'warning'
                      );
                      setPaymentModal({
                        open: false,
                        contract: null,
                        clientSecret: null,
                        loading: false,
                        paymentMethod: 'nuvei',
                      });
                    }
                  }}
                  onPaymentError={(error) => {
                    showToast(`Payment failed: ${error.message || 'Unknown error'}`, 'error');
                  }}
                  onCancel={() => {
                    // User cancelled, just close the modal
                    setPaymentModal({
                      open: false,
                      contract: null,
                      clientSecret: null,
                      loading: false,
                      paymentMethod: 'nuvei',
                    });
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </ContractsContext.Provider>
  );
}

export default ContractsPage;
