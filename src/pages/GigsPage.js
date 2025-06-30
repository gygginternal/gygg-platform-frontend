import React, { useState, useEffect } from 'react';
import styles from './GigsPage.module.css';
import { TaskList } from '../components/TaskList';
import ProfileSidebar from '../components/ProfileSidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, DollarSign, Clock } from 'lucide-react';
import { CATEGORY_ENUM } from '../constants/categories';
import GigDetailsModal from '../components/GigDetailsModal';

export default function GigsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchTermFromUrl = searchParams.get('search') || '';
  const categoryFromUrl = searchParams.get('category') || 'All';
  const locationFromUrl = searchParams.get('location') || '';
  const priceRangeFromUrl = searchParams.get('priceRange') || 'Any';

  const [searchTerm, setSearchTerm] = useState(searchTermFromUrl);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [selectedLocation, setSelectedLocation] = useState(locationFromUrl);
  const [priceRange, setPriceRange] = useState(priceRangeFromUrl);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGig, setSelectedGig] = useState(null);

  const categories = ['All', ...CATEGORY_ENUM];
  const priceRanges = ['Any', 'Under $20', '$20 - $50', '$50 - $100', '$100+'];

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory && selectedCategory !== 'All')
      params.set('category', selectedCategory);
    if (selectedLocation) params.set('location', selectedLocation);
    if (priceRange && priceRange !== 'Any')
      params.set('priceRange', priceRange);

    navigate(`?${params.toString()}`);
  }, [searchTerm, selectedCategory, selectedLocation, priceRange, navigate]);

  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = category => {
    setSelectedCategory(category);
  };

  const handleLocationChange = e => {
    setSelectedLocation(e.target.value);
  };

  const handlePriceRangeChange = range => {
    setPriceRange(range);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLocation('');
    setPriceRange('Any');
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <aside className={styles.sidebarArea}>
          <ProfileSidebar />
        </aside>
        <main className={styles.mainFeedArea}>
          <div className={styles.searchAndFilters}>
            <div className={styles.searchBar}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search gigs..."
                value={searchTerm}
                onChange={handleSearch}
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
                    {categories.map(category => (
                      <button
                        key={category}
                        className={`${styles.categoryButton} ${
                          selectedCategory === category ? styles.selected : ''
                        }`}
                        onClick={() => handleCategoryChange(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.filterSection}>
                  <h3>Location</h3>
                  <div className={styles.locationInput}>
                    <MapPin className={styles.locationIcon} />
                    <input
                      type="text"
                      placeholder="Enter location..."
                      value={selectedLocation}
                      onChange={handleLocationChange}
                    />
                  </div>
                </div>

                <div className={styles.filterSection}>
                  <h3>Price Range</h3>
                  <div className={styles.priceRangeList}>
                    {priceRanges.map(range => (
                      <button
                        key={range}
                        className={`${styles.priceRangeButton} ${
                          priceRange === range ? styles.selected : ''
                        }`}
                        onClick={() => handlePriceRangeChange(range)}
                      >
                        {range}
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

          <TaskList
            initialSearchTerm={searchTerm}
            category={selectedCategory}
            location={selectedLocation}
            priceRange={priceRange}
            onGigClick={gig => setSelectedGig(gig)}
          />
          <GigDetailsModal
            gig={selectedGig}
            open={!!selectedGig}
            onClose={() => setSelectedGig(null)}
          />
        </main>
      </div>
    </div>
  );
}
