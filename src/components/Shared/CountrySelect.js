import React from 'react';
import styles from './CountrySelect.module.css';

const countries = [
    { code: 'CA', name: 'Canada' },
    { code: 'US', name: 'United States' },
    // Add more countries as needed
  ];

const CountrySelect = ({ value, onChange, className, disabled }) => {
  return (
      <select
        value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${styles.countrySelect} ${className || ''}`}
            disabled={disabled}
      >
            <option value="">Select Country</option>
            {countries.map((country) => (
                <option key={country.code} value={country.code}>
                    {country.name}
          </option>
        ))}
      </select>
  );
};

export default CountrySelect;