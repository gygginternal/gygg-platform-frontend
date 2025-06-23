import styles from './AddressInput.module.css';
import CountrySelect from './CountrySelect';
import PropTypes from 'prop-types';

// List of Canadian provinces and territories
const CANADIAN_PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
];

// List of US states
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

const AddressInput = ({ value, onChange, className, disabled }) => {
  const handleChange = (field, newValue) => {
    // If country changes, reset state/province
    if (field === 'country') {
      onChange({
        ...value,
        [field]: newValue,
        state: '', // Reset state when country changes
      });
    } else {
      onChange({
        ...value,
        [field]: newValue,
      });
    }
  };

  // Get the appropriate state/province list based on selected country
  const getStateOptions = () => {
    if (value.country === 'CA') {
      return CANADIAN_PROVINCES;
    } else if (value.country === 'US') {
      return US_STATES;
    }
    return [];
  };

  return (
    <div className={`${styles.addressInput} ${className || ''}`}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="street">Street Address</label>
          <input
            type="text"
            id="street"
            value={value.street || ''}
            onChange={e => handleChange('street', e.target.value)}
            placeholder="123 Main St"
            disabled={disabled}
          />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            value={value.city || ''}
            onChange={e => handleChange('city', e.target.value)}
            placeholder="Toronto"
            disabled={disabled}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="state">Province/State</label>
          <select
            id="state"
            value={value.state || ''}
            onChange={e => handleChange('state', e.target.value)}
            disabled={disabled || !value.country}
            className={styles.select}
          >
            <option value="">
              Select {value.country === 'CA' ? 'Province' : 'State'}
            </option>
            {getStateOptions().map(state => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="postalCode">Postal Code</label>
          <input
            type="text"
            id="postalCode"
            value={value.postalCode || ''}
            onChange={e => handleChange('postalCode', e.target.value)}
            placeholder={value.country === 'CA' ? 'M5V 2H1' : '12345'}
            disabled={disabled}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="country">Country</label>
          <CountrySelect
            value={value.country || ''}
            onChange={newValue => handleChange('country', newValue)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

AddressInput.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default AddressInput;
