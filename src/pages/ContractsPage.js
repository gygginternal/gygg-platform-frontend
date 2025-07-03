import React, { useState, createContext, useContext, useEffect } from 'react';
// import cn from "classnames"; // No longer needed
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns'; // Import date-fns for formatting dates
import apiClient from '../api/axiosConfig';
import styles from '../components/ContractsPage/ContractsPage.module.css';
import ProfileSidebar from '../components/ProfileSidebar';
import { TabNavigation } from '../components/TabNavigation'; // Import the TabNavigation component
import InputField from '../components/Shared/InputField';
import Toggle from '../components/Toggle';
import { StatusBadge } from '../components/StatusBadge'; // Adjust the import path
import BillingAndPayment from './BillingAndPayment';
import ContractCard from '../components/ContractsPage/ContractCard';
import { CATEGORY_ENUM } from '../constants/categories';
import { Search, Filter, DollarSign } from 'lucide-react';

export const ContractsContext = createContext();
export function useContracts() {
  return useContext(ContractsContext);
}

const statusClass = {
  Active: styles.active,
  'Offer waiting': styles.offerWaiting,
  Ended: styles.ended,
};

function JobListingsPage({ contracts }) {
  const [expandedId, setExpandedId] = useState(null);

  const handleExpand = id => {
    setExpandedId(expandedId === id ? null : id);
  };

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
              onClick={() => handleExpand(job.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') handleExpand(job.id);
              }}
              tabIndex={0}
              role="button"
              aria-expanded={expandedId === job.id}
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
              {expandedId === job.id && (
                <div className={styles.details}>
                  <p className={styles.description}>{job.description}</p>
                  <div className={styles.detailRow}>
                    <span>
                      <b>Location</b>{' '}
                      <span className={styles.locationIcon}>📍</span>
                      {job.location}
                    </span>
                  </div>
                  <div className={styles.buttonRow}>
                    <button className={styles.primaryBtn}>
                      Submit as Complete
                    </button>
                    <button className={styles.secondaryBtn}>
                      End Contract
                    </button>
                  </div>
                </div>
              )}
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
            {activeTab === 'contracts' && (
              <>
                <div className={styles.contractsCard}>
                  <div className={styles.contractsList}>
                    {filteredContracts.length === 0 ? (
                      <div className={styles.emptyState}>
                        No contracts found.
                      </div>
                    ) : (
                      filteredContracts.map(contract => (
                        <ContractCard key={contract.id} contract={contract} />
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
    </ContractsContext.Provider>
  );
}

export default ContractsPage;
