import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import styles from './SearchHeader.module.css';
import PropTypes from 'prop-types';

function SearchHeader({ onSearch }) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = e => {
    const { value } = e.target;
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={styles.searchHeaderWrapper}>
      <div className={styles.searchInputWrapper}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search contracts..."
          className={styles.searchInput}
          value={searchValue}
          onChange={handleSearchChange}
        />
      </div>
      <button className={styles.filterButton}>
        <SlidersHorizontal className={styles.filterIcon} />
      </button>
    </div>
  );
}

SearchHeader.propTypes = {
  onSearch: PropTypes.func,
};

export default SearchHeader;
