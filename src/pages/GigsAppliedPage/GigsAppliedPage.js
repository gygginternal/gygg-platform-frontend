import React, { useEffect, useState } from 'react';
import apiClient from '../../api/axiosConfig';
import styles from './GigsAppliedPage.module.css';
import ProfileSidebar from '../../components/Shared/ProfileSidebar';
import { useAuth } from '../../contexts/AuthContext';
import {
  Search,
  Filter,
  Clock,
  MapPin,
  DollarSign,
  Calendar,
  User,
  Star,
} from 'lucide-react';
import GigDetailsModal from '../../components/Shared/GigDetailsModal';

const statusConfig = {
  pending: {
    color: '#ff9800',
    bgColor: '#fff3e0',
    icon: Clock,
    label: 'Pending',
    priority: 'medium priority',
  },
  accepted: {
    color: '#4caf50',
    bgColor: '#e8f5e8',
    icon: User,
    label: 'Accepted',
    priority: 'high priority',
  },
  rejected: {
    color: '#f44336',
    bgColor: '#ffebee',
    icon: Clock,
    label: 'Cancelled',
    priority: 'low priority',
  },
  cancelled: {
    color: '#9e9e9e',
    bgColor: '#f5f5f5',
    icon: Clock,
    label: 'Cancelled',
    priority: 'low priority',
  },
  completed: {
    color: '#2196f3',
    bgColor: '#e3f2fd',
    icon: User,
    label: 'Completed',
    priority: 'high priority',
  },
  in_progress: {
    color: '#9c27b0',
    bgColor: '#f3e5f5',
    icon: Clock,
    label: 'In Progress',
    priority: 'medium priority',
  },
};

const GigsAppliedPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGig, setSelectedGig] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('Most Recent');

  useEffect(() => {
    if (user && user.role?.includes('tasker')) {
      const fetchGigs = async () => {
        setLoading(true);
        setError('');
        try {
          const res = await apiClient.get('/applications/my-gigs');
          setApplications(res.data.data || []);
        } catch (err) {
          setError('Failed to load applied gigs.');
        } finally {
          setLoading(false);
        }
      };
      fetchGigs();
    }
  }, [user]);

  const handleCardClick = async gig => {
    try {
      const res = await apiClient.get(`/gigs/${gig._id}`);
      setSelectedGig(res.data.data.gig);
      setSelectedApplicationId(gig.applicationId);
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
          setApplications(res.data.data || []);
        } catch (err) {
          setError('Failed to load applied gigs.');
        } finally {
          setLoading(false);
        }
      };
      fetchGigs();
    }
  };

  // Helper functions
  const getStatusCounts = () => {
    const counts = {
      total: applications.length,
      pending: applications.filter(app => app.applicationStatus === 'pending')
        .length,
      accepted: applications.filter(app => app.applicationStatus === 'accepted')
        .length,
      in_progress: applications.filter(
        app => app.applicationStatus === 'in_progress'
      ).length,
      completed: applications.filter(
        app => app.applicationStatus === 'completed'
      ).length,
    };
    return counts;
  };

  const getFilteredApplications = () => {
    let filtered = applications;

    // Enhanced search functionality
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(app => {
        // Search in multiple fields with better matching
        const titleMatch = app.title?.toLowerCase().includes(searchLower);
        const categoryMatch = app.category?.toLowerCase().includes(searchLower);
        const descriptionMatch = app.description
          ?.toLowerCase()
          .includes(searchLower);
        const clientNameMatch =
          app.postedBy?.firstName?.toLowerCase().includes(searchLower) ||
          app.postedBy?.lastName?.toLowerCase().includes(searchLower) ||
          `${app.postedBy?.firstName} ${app.postedBy?.lastName}`
            .toLowerCase()
            .includes(searchLower);
        const skillsMatch = app.skills?.some(skill =>
          skill.toLowerCase().includes(searchLower)
        );
        const locationMatch =
          app.location?.city?.toLowerCase().includes(searchLower) ||
          app.location?.address?.toLowerCase().includes(searchLower);
        const statusMatch = app.applicationStatus
          ?.toLowerCase()
          .includes(searchLower);

        return (
          titleMatch ||
          categoryMatch ||
          descriptionMatch ||
          clientNameMatch ||
          skillsMatch ||
          locationMatch ||
          statusMatch
        );
      });
    }

    // Filter by status
    if (statusFilter !== 'All Status') {
      const statusKey = statusFilter.toLowerCase().replace(' ', '_');
      filtered = filtered.filter(app => app.applicationStatus === statusKey);
    }

    // Enhanced sorting
    if (sortBy === 'Most Recent') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'Oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'Highest Pay') {
      filtered.sort((a, b) => {
        const aPrice = a.isHourly ? a.ratePerHour : a.cost;
        const bPrice = b.isHourly ? b.ratePerHour : b.cost;
        return (bPrice || 0) - (aPrice || 0);
      });
    } else if (sortBy === 'Lowest Pay') {
      filtered.sort((a, b) => {
        const aPrice = a.isHourly ? a.ratePerHour : a.cost;
        const bPrice = b.isHourly ? b.ratePerHour : b.cost;
        return (aPrice || 0) - (bPrice || 0);
      });
    }

    return filtered;
  };

  const formatTimeAgo = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (user && !user.role?.includes('tasker')) {
    return (
      <div style={{ display: 'flex', gap: '32px' }}>
        <aside style={{ flex: '0 0 260px' }}>
          <ProfileSidebar />
        </aside>
        <main style={{ flex: 1 }}>
          <div className={styles.container}>
            <h2>Applications Dashboard</h2>
            <p>This page is only available for taskers.</p>
          </div>
        </main>
      </div>
    );
  }

  const statusCounts = getStatusCounts();
  const filteredApplications = getFilteredApplications();

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <aside className={styles.sidebarArea}>
          <ProfileSidebar />
        </aside>
        <main className={styles.mainFeedArea}>
          {/* Dashboard Header */}
          <div className={styles.dashboardHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerIcon}>
                <User size={24} />
              </div>
              <div>
                <h1 className={styles.dashboardTitle}>
                  Applications Dashboard
                </h1>
                <p className={styles.dashboardSubtitle}>
                  Track and manage your gig applications
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{statusCounts.total}</div>
              <div className={styles.statLabel}>Total</div>
              <div
                className={styles.statDot}
                style={{ backgroundColor: '#2196f3' }}
              ></div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{statusCounts.pending}</div>
              <div className={styles.statLabel}>Pending</div>
              <div
                className={styles.statDot}
                style={{ backgroundColor: '#ff9800' }}
              ></div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{statusCounts.accepted}</div>
              <div className={styles.statLabel}>Accepted</div>
              <div
                className={styles.statDot}
                style={{ backgroundColor: '#4caf50' }}
              ></div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>
                {statusCounts.in_progress}
              </div>
              <div className={styles.statLabel}>In Progress</div>
              <div
                className={styles.statDot}
                style={{ backgroundColor: '#9c27b0' }}
              ></div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{statusCounts.completed}</div>
              <div className={styles.statLabel}>Completed</div>
              <div
                className={styles.statDot}
                style={{ backgroundColor: '#2196f3' }}
              ></div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.searchContainer}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search gigs, categories, or clients..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterControls}>
              <div className={styles.filterGroup}>
                <Filter size={16} />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>Accepted</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <Calendar size={16} />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option>Most Recent</option>
                  <option>Oldest</option>
                  <option>Highest Pay</option>
                  <option>Lowest Pay</option>
                </select>
              </div>
            </div>
          </div>

          {/* Applications List */}
          {loading ? (
            <div className={styles.spinnerWrapper}>
              <div className={styles.spinner}></div>
            </div>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : filteredApplications.length === 0 ? (
            <div className={styles.emptyState}>
              <User size={48} className={styles.emptyIcon} />
              <h3>No Applications Found</h3>
              <p>
                {applications.length === 0
                  ? "You haven't applied to any gigs yet. Browse gigs and start applying!"
                  : 'No applications match your current filters.'}
              </p>
            </div>
          ) : (
            <div className={styles.applicationsList}>
              {filteredApplications.map(gig => {
                const config =
                  statusConfig[gig.applicationStatus] || statusConfig.pending;
                const IconComponent = config.icon;

                return (
                  <div
                    key={gig._id}
                    className={styles.applicationCard}
                    onClick={() => handleCardClick(gig)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardClick(gig);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for ${gig.title}`}
                  >
                    {/* Card Header */}
                    <div className={styles.cardHeader}>
                      <div className={styles.categorySection}>
                        <div className={styles.categoryInfo}>
                          <span className={styles.categoryName}>
                            {gig.category?.toUpperCase() || 'GENERAL'}
                          </span>
                        </div>
                      </div>
                      <div
                        className={styles.statusBadge}
                        style={{
                          backgroundColor: config.bgColor,
                          color: config.color,
                        }}
                      >
                        <IconComponent size={14} />
                        {config.label}
                      </div>
                    </div>

                    {/* Gig Title */}
                    <h3 className={styles.gigTitle}>{gig.title}</h3>

                    {/* Client Info */}
                    <div className={styles.clientInfo}>
                      <div className={styles.clientAvatar}>
                        {gig.postedBy?.profileImage ? (
                          <img
                            src={gig.postedBy.profileImage}
                            alt={`${gig.postedBy.firstName || 'User'}'s profile`}
                            className={styles.avatarImage}
                          />
                        ) : (
                          gig.postedBy?.firstName?.[0] || 'U'
                        )}
                      </div>
                      <div className={styles.clientDetails}>
                        <span className={styles.clientName}>
                          {gig.postedBy?.firstName || 'Unknown'}{' '}
                          {gig.postedBy?.lastName || 'Client'}
                        </span>
                        {gig.postedBy?.rating && (
                          <div className={styles.clientRating}>
                            <Star size={12} fill="#ffc107" color="#ffc107" />
                            <span>
                              {gig.postedBy.rating} (
                              {gig.postedBy.reviewCount || 0} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={styles.timeInfo}>
                        <Calendar size={12} />
                        <span>Posted {formatTimeAgo(gig.createdAt)}</span>
                        <Clock size={12} />
                        <span>Applied {formatTimeAgo(gig.createdAt)}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className={styles.gigDescription}>
                      {gig.description?.substring(0, 120)}
                      {gig.description?.length > 120 ? '...' : ''}
                    </p>

                    {/* Tags */}
                    {gig.skills && gig.skills.length > 0 && (
                      <div className={styles.tagsSection}>
                        {gig.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className={styles.tag}>
                            {skill}
                          </span>
                        ))}
                        {gig.skills.length > 3 && (
                          <span className={styles.moreTag}>
                            +{gig.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className={styles.cardFooter}>
                      <div className={styles.locationPrice}>
                        <div className={styles.location}>
                          <MapPin size={14} />
                          <span>
                            {gig.location?.city ||
                              gig.location?.address ||
                              (gig.isRemote ? 'Remote' : 'Location TBD')}
                          </span>
                        </div>
                        <div className={styles.duration}>
                          <Clock size={14} />
                          <span>
                            {gig.duration
                              ? `${gig.duration} hours`
                              : 'Flexible'}
                          </span>
                        </div>
                      </div>
                      <div className={styles.price}>
                        <DollarSign size={16} />
                        <span className={styles.amount}>
                          ${gig.isHourly ? gig.ratePerHour : gig.cost}
                        </span>
                        <span className={styles.rateType}>
                          {gig.isHourly ? 'Hourly Rate' : 'Fixed Rate'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <GigDetailsModal
            gig={selectedGig}
            open={modalOpen}
            onClose={handleModalClose}
            onApply={handleApplicationUpdate}
            showRetract
            applicationId={selectedApplicationId}
          />
        </main>
      </div>
    </div>
  );
};

export default GigsAppliedPage;
