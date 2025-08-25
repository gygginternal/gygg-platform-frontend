import React, { useState, useEffect } from 'react';
import styles from './GigHelperPage.module.css';
import ProfileSidebar from '../../components/Shared/ProfileSidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import TaskerListSafe from '../../components/TaskerListSafe';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Search } from 'lucide-react';

export default function GigHelperPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchTermFromUrl = searchParams.get('search') || '';
  
  const [searchTerm, setSearchTerm] = useState(searchTermFromUrl);

  // Update URL when search term changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    navigate(`?${params.toString()}`, { replace: true });
  }, [searchTerm, navigate]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <ErrorBoundary>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <aside className={styles.sidebarArea}>
            <ProfileSidebar />
          </aside>
          <main className={styles.mainFeedArea}>
            <div className={styles.header}>
              <h1 className={styles.title}>Gig Helpers</h1>
              <p className={styles.subtitle}>
                {searchTerm 
                  ? `Search results for "${searchTerm}"`
                  : 'Find helpers for your gigs based on their skills and preferences'
                }
              </p>
            </div>
            
            {/* Search Bar */}
            <div className={styles.searchContainer}>
              <div className={styles.searchBar}>
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search taskers by skills, bio, or name..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className={styles.searchInput}
                />
                {searchTerm && (
                  <button
                    className={styles.clearButton}
                    onClick={clearSearch}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            
            <TaskerListSafe searchTerm={searchTerm} />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
