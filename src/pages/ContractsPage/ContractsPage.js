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
import ProfileSidebar from '../../components/ProfileSidebar';
import { TabNavigation } from '../../components/TabNavigation'; // Import the TabNavigation component
import InputField from '../../components/Shared/InputField';
import Toggle from '../../components/Toggle';
import { StatusBadge } from '../../components/StatusBadge'; // Adjust the import path
import BillingAndPayment from '../BillingAndPayment/BillingAndPayment';
import { CATEGORY_ENUM } from '../../constants/categories';
import { Search, Filter, DollarSign } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

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
  const queryClient = useQueryClient();
  const showToast = useToast();
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
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={tabOptions}
            />
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
                <div className={styles.contractsCard}>
                  <div className={styles.contractsList}>
                    {filteredContracts.length === 0 ? (
                      <div className={styles.emptyState}>
                        No contracts found.
                      </div>
                    ) : (
                      filteredContracts.map((contract, index) => (
                        <div
                          key={contract.id}
                          className={styles.contractRow}
                          onClick={() => {
                            console.log('Contract row clicked:', contract);
                            setModalContract(contract);
                            setIsModalOpen(true);
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setModalContract(contract);
                              setIsModalOpen(true);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-expanded={false}
                        >
                          <div className={styles.contractMain}>
                            <div className={styles.contractTitle}>
                              {contract.title}
                            </div>
                            <div className={styles.contractDetailsRow}>
                              <span className={styles.contractDetailLabel}>
                                Hired by <b>{contract.hiredBy}</b>
                              </span>
                              <span className={styles.contractDetailLabel}>
                                Rate{' '}
                                <span className={styles.contractRate}>
                                  {contract.rate}
                                </span>
                              </span>
                              <StatusBadge status={contract.status} />
                            </div>
                            <div className={styles.contractDetailsRow}>
                              <span className={styles.contractDetailLabel}>
                                Contract ID {contract.contractId}
                              </span>
                              <span className={styles.contractDetailLabel}>
                                Earned{' '}
                                <span className={styles.contractEarned}>
                                  {contract.earned}
                                </span>
                              </span>
                              <span className={styles.contractStarted}>
                                Started {contract.started}
                              </span>
                            </div>
                          </div>
                          {index !== filteredContracts.length - 1 && (
                            <div className={styles.contractDivider} />
                          )}
                        </div>
                      ))
                    )}
                  </div>
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
                      try {
                        await apiClient.post(
                          `/payments/contracts/${modalContract.id || modalContract._id}/create-payment-intent`
                        );
                        showToast(
                          'Payment initiated! Please complete the payment in the next step.',
                          'success'
                        );
                        setIsModalOpen(false);
                        setModalContract(null);
                      } catch (err) {
                        showToast(
                          err.response?.data?.message ||
                            'Failed to initiate payment.',
                          'error'
                        );
                      }
                    }}
                  >
                    Make Payment
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
    </ContractsContext.Provider>
  );
}

export default ContractsPage;
