import { useState } from 'react';
import styles from './AutoComplete.module.css';
import PropTypes from 'prop-types';

export const AutoComplete = ({
  label = 'Enter items',
  placeholder = 'Type to search...',
  values = [],
  options = [],
  onChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredOptions = options.filter(
    option =>
      option.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !values.includes(option)
  );

  const handleAdd = item => {
    const updatedValues = [...values, item];
    onChange(updatedValues);
    setSearchTerm('');
  };

  const handleRemove = item => {
    const updatedValues = values.filter(value => value !== item);
    onChange(updatedValues);
  };

  // fallback legacy data
  if (!Array.isArray(values)) {
    values = [];
  }

  return (
    <div className={styles.inputField}>
      <label className={styles.inputLabel}>{label}</label>
      <div className={styles.dropdownWrapper}>
        <div className={styles.tagsInput}>
          {values.map(value => (
            <span key={value} className={styles.tag}>
              {value}
              <span
                className={styles.remove}
                onClick={() => handleRemove(value)}
              >
                ×
              </span>
            </span>
          ))}
          <input
            className={styles.searchInput}
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder={placeholder}
          />
        </div>
        {showDropdown && filteredOptions.length > 0 && (
          <ul className={styles.dropdownList}>
            {filteredOptions.map(option => (
              <li
                key={option}
                onClick={() => handleAdd(option)}
                className={styles.dropdownItem}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleAdd(option)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') handleAdd(option);
                  }}
                  className={styles.option}
                  aria-label={`Select ${option}`}
                >
                  {option}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

AutoComplete.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  values: PropTypes.arrayOf(PropTypes.string),
  options: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
};
