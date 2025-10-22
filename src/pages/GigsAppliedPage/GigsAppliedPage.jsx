import React, { useState, createContext, useContext, useEffect } from 'react';
import apiClient from '../../api/axiosConfig';
import styles from './GigsAppliedPage.module.css';
import ProfileSidebar from '../../components/common/ProfileSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Filter } from 'lucide-react';
import { CATEGORY_ENUM } from '../../constants/categories';
import AppliedGigCard from '../../components/features/GigsAppliedPage/AppliedGigCard';
import GigDetailsModal from '../../components/common/GigDetailsModal';

export const GigsAppliedContext = createContext();
export function useGigsApplied() {
  return useContext(GigsAppliedContext);
}

const GigsAppliedPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGig, setSelectedGig] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceRange, setPriceRange] = useState('Any');
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setPriceRange('Any');
  };

  useEffect(() => {
    if (user && user.role?.includes('tasker')) {
      const fetchGigs = async () => {
        setLoading(true);
        setError('');
        try {
          const res = await apiClient.get('/applications/my-gigs');
          // Backend returns applications in res.data.data.applications
          setApplications(res.data.data.applications || []);
        } catch (err) {
          setError('Failed to load applied gigs.');
        } finally {
          setLoading(false);
        }
      };
      fetchGigs();
    }
  }, [user]);

  const handleCardClick = async app => {
    try {
      // Use the gig ID from the application's gig field
      const res = await apiClient.get(`/gigs/${app.gig._id}`);
      setSelectedGig(res.data.data.gig);
      setSelectedApplicationId(app._id); // Use the application ID
      setModalOpen(true);
    } catch (err) {
      setError('Failed to load gig details.');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedGig(null);
  };

  const handleApplicationUpdate = () => {
    // Refresh the applications list
    if (user && user.role?.includes('tasker')) {
      const fetchGigs = async () => {
        setLoading(true);
        setError('');
        try {
          const res = await apiClient.get('/applications/my-gigs');
          // Backend returns applications in res.data.data.applications
          setApplications(res.data.data.applications || []);
        } catch (err) {
          setError('Failed to load applied gigs.');
        } finally {
          setLoading(false);
        }
      };
      fetchGigs();
    }
  };

  const getFilteredApplications = () => {
    let filtered = applications;

    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(app =>
        app.gig?.title?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(
        app => app.status === statusFilter.toLowerCase()
      );
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(app => app.gig?.category === categoryFilter);
    }

    if (priceRange !== 'Any') {
      const [min, max] = priceRange.replace(/\$/g, '').split(' - ');
      filtered = filtered.filter(app => {
        const price = app.gig?.isHourly ? app.gig?.ratePerHour : app.gig?.cost;
        if (priceRange.startsWith('Under')) {
          return price < 20;
        }
        if (priceRange.endsWith('+')) {
          return price >= 100;
        }
        return price >= min && price <= max;
      });
    }

    return filtered;
  };

  if (user && !user.role?.includes('tasker')) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <aside className={styles.sidebarArea}>
            <ProfileSidebar />
          </aside>
          <main className={styles.mainFeedArea}>
            <div className={styles.container}>
              <h2>Gigs Applied</h2>
              <p>This page is only available for taskers.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const filteredApplications = getFilteredApplications();
  const statusCounts = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending')
      .length,
    accepted: applications.filter(app => app.status === 'accepted')
      .length,
    in_progress: applications.filter(
      app => app.status === 'in_progress'
    ).length,
    completed: applications.filter(app => app.status === 'completed')
      .length,
  };

  return (
    <GigsAppliedContext.Provider value={{}}>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <aside className={styles.sidebarArea}>
            <ProfileSidebar />
          </aside>
          <main className={styles.mainFeedArea}>
            <div className={styles.header}>
              <h1 className={styles.title}>Gigs Applied</h1>
              <p className={styles.subtitle}>
                Track and manage your gig applications
              </p>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{statusCounts.total}</div>
                <div className={styles.statLabel}>Total</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{statusCounts.pending}</div>
                <div className={styles.statLabel}>Pending</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{statusCounts.accepted}</div>
                <div className={styles.statLabel}>Accepted</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>
                  {statusCounts.in_progress}
                </div>
                <div className={styles.statLabel}>In Progress</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>
                  {statusCounts.completed}
                </div>
                <div className={styles.statLabel}>Completed</div>
              </div>
            </div>

            <div className={styles.searchAndFilters}>
              <div className={styles.searchBar}>
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search gigs..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
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
                          className={`${styles.categoryButton} ${
                            categoryFilter === category ? styles.selected : ''
                          }`}
                          onClick={() => setCategoryFilter(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.filterSection}>
                    <h3>Price Range</h3>
                    <div className={styles.priceRangeList}>
                      {[
                        'Any',
                        'Under $20',
                        '$20 - $50',
                        '$50 - $100',
                        '$100+',
                      ].map(range => (
                        <button
                          key={range}
                          className={`${styles.priceRangeButton} ${
                            priceRange === range ? styles.selected : ''
                          }`}
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
                      {[
                        'All',
                        'Pending',
                        'Accepted',
                        'In Progress',
                        'Completed',
                        'Cancelled',
                      ].map(opt => (
                        <button
                          key={opt}
                          className={`${styles.priceRangeButton} ${
                            statusFilter === opt ? styles.selected : ''
                          }`}
                          onClick={() => setStatusFilter(opt)}
                        >
                          {opt}
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

            <div className={styles.applicationsList}>
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Loading your applied gigs...</p>
                </div>
              ) : error ? (
                <p className={styles.error}>{error}</p>
              ) : filteredApplications.length === 0 ? (
                <div className={styles.emptyState}>
                  <h3>No Applications Found</h3>
                  <p>
                    You haven't applied to any gigs matching your current
                    filters.
                  </p>
                </div>
              ) : (
                filteredApplications.map(app => (
                  <AppliedGigCard
                    key={app._id}
                    gig={{
                      ...app.gig,
                      status: app.status, // Include application status
                      applicationId: app._id, // Pass the application ID
                      createdAt: app.createdAt, // Include creation date
                      rate: app.gig?.isHourly ? app.gig?.ratePerHour : app.gig?.cost
                    }}
                    onClick={() => handleCardClick(app)}
                  />
                ))
              )}
            </div>
          </main>
        </div>
        <GigDetailsModal
          gig={selectedGig}
          open={modalOpen}
          onClose={handleModalClose}
          onApply={handleApplicationUpdate}
          showRetract
          applicationId={selectedApplicationId}
        />
      </div>
    </GigsAppliedContext.Provider>
  );
};

export default GigsAppliedPage;
