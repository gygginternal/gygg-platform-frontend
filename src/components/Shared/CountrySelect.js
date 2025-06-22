import styles from './CountrySelect.module.css';
import PropTypes from 'prop-types';

const countries = [
  { code: 'CA', name: 'Canada' },
  { code: 'US', name: 'United States' },
  // Add more countries as needed
];

const CountrySelect = ({ value, onChange, className, disabled }) => {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`${styles.countrySelect} ${className || ''}`}
      disabled={disabled}
    >
      <option value="">Select Country</option>
      {countries.map(country => (
        <option key={country.code} value={country.code}>
          {country.name}
        </option>
      ))}
    </select>
  );
};

CountrySelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default CountrySelect;
