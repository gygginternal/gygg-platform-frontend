import { useState, useRef, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { validateContent } from '../../utils/contentFilter';
import styles from './AutoComplete.module.css';
import PropTypes from 'prop-types';

export const AutoComplete = ({
  label = 'Enter items',
  placeholder = 'Type to search...',
  values = [],
  options = [],
  onChange,
  labelColor = '#ffffff',
  enableContentFilter = true,
  contentFilterOptions = {},
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [contentWarning, setContentWarning] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = options.filter(
    option =>
      option.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !values.includes(option)
  );

  const validateInputContent = text => {
    if (!enableContentFilter || !text) {
      setContentWarning(null);
      return true;
    }

    const validation = validateContent(text, {
      minSafetyScore: 70,
      strictMode: false,
      ...contentFilterOptions,
    });

    if (!validation.isValid) {
      setContentWarning({
        message: validation.message,
        suggestions: validation.suggestions,
        severity: validation.safetyScore < 30 ? 'high' : 'medium',
      });
      return false;
    } else {
      setContentWarning(null);
      return true;
    }
  };

  const handleAdd = item => {
    // Validate content before adding
    if (!validateInputContent(item)) {
      return; // Don't add if content is inappropriate
    }

    const updatedValues = [...values, item];
    onChange(updatedValues);
    setSearchTerm('');
    setShowDropdown(false);
    setFocusedIndex(-1);
    setContentWarning(null);
    inputRef.current?.focus();
  };

  const handleRemove = item => {
    const updatedValues = values.filter(value => value !== item);
    onChange(updatedValues);
  };

  const handleKeyDown = e => {
    if (!showDropdown || filteredOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          handleAdd(filteredOptions[focusedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setFocusedIndex(-1);
        break;
    }
  };

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // fallback legacy data
  if (!Array.isArray(values)) {
    values = [];
  }

  return (
    <div className={styles.inputField}>
      <label className={styles.inputLabel} style={{ color: labelColor }}>
        {label}
      </label>
      <div className={styles.dropdownWrapper} ref={dropdownRef}>
        <div
          className={`${styles.tagsInput} ${showDropdown ? styles.focused : ''}`}
        >
          {values.map(value => (
            <span key={value} className={styles.tag}>
              <span className={styles.tagText}>{value}</span>
              <button
                className={styles.removeButton}
                type="button"
                onClick={() => handleRemove(value)}
                aria-label={`Remove ${value}`}
                tabIndex={-1}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M9 3L3 9M3 3L9 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            className={styles.searchInput}
            type="text"
            value={searchTerm}
            onChange={e => {
              const newValue = e.target.value;
              setSearchTerm(newValue);
              setShowDropdown(true);
              setFocusedIndex(-1);

              // Validate content as user types
              if (newValue.trim()) {
                validateInputContent(newValue);
              } else {
                setContentWarning(null);
              }
            }}
            onFocus={() => {
              setShowDropdown(true);
              setFocusedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder={values.length === 0 ? placeholder : ''}
            autoComplete="off"
          />
        </div>
        {showDropdown && filteredOptions.length > 0 && (
          <div className={styles.dropdownContainer}>
            <ul className={styles.dropdownList}>
              {filteredOptions.map((option, index) => (
                <li
                  key={option}
                  className={`${styles.dropdownItem} ${
                    index === focusedIndex ? styles.focused : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleAdd(option)}
                    className={styles.optionButton}
                    aria-label={`Select ${option}`}
                  >
                    <span className={styles.optionText}>{option}</span>
                    <svg
                      className={styles.addIcon}
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M8 3V13M3 8H13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {showDropdown &&
          searchTerm &&
          filteredOptions.length === 0 &&
          !contentWarning && (
            <div className={styles.dropdownContainer}>
              <div className={styles.noResults}>
                <span>No options found for &quot;{searchTerm}&quot;</span>
              </div>
            </div>
          )}
      </div>

      {contentWarning && (
        <div className={styles.contentWarningContainer}>
          <div
            className={`${styles.contentWarningMessage} ${styles[contentWarning.severity]}`}
          >
            <AlertTriangle size={14} className={styles.warningIcon} />
            <span>{contentWarning.message}</span>
          </div>
          {contentWarning.suggestions &&
            contentWarning.suggestions.length > 0 && (
              <div className={styles.contentSuggestions}>
                <p className={styles.suggestionsTitle}>Suggestions:</p>
                <ul className={styles.suggestionsList}>
                  {contentWarning.suggestions
                    .slice(0, 2)
                    .map((suggestion, index) => (
                      <li key={index} className={styles.suggestionItem}>
                        {suggestion}
                      </li>
                    ))}
                </ul>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

AutoComplete.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  values: PropTypes.arrayOf(PropTypes.string),
  options: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  labelColor: PropTypes.string,
  enableContentFilter: PropTypes.bool,
  contentFilterOptions: PropTypes.object,
};
