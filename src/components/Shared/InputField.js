// frontend/src/components/Shared/InputField.js (UPDATED)
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './InputField.module.css';
// import { cn } from "../../uitls/cn"; // Assuming you have this utility

function InputField({
  label,
  name,
  type = 'text',
  placeholder,
  value = '', // This `value` is the FULL phone number (e.g., +1234...) from parent
  onChange,
  icon,
  inputMode,
  maxLength, // This `maxLength` prop from SignupPage should be 10 for phone numbers
  required = false,
  rows = 3,
  disabled = false,
  onKeyDown,
  className = '',
  labelColor = '#fff',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPhoneInput = icon === 'phone';

  // INTERNAL STATE: countryCode and localNumber
  // These are derived from the `value` prop, but managed internally for display and interaction
  const [countryCode, setCountryCode] = useState(() => {
    // Attempt to parse country code from the value prop, default to +1
    const match = value?.match(/^\+\d{1,4}/); // Match + followed by 1 to 4 digits
    return isPhoneInput ? (match ? match[0] : '+1') : '+1';
  });

  const [localNumber, setLocalNumber] = useState(() => {
    // Attempt to parse local number from the value prop, after country code
    const initialCodeMatch = value?.match(/^\+\d{1,4}/);
    const initialCode = initialCodeMatch ? initialCodeMatch[0] : '+1';
    return isPhoneInput
      ? value?.substring(initialCode.length).replace(/\D/g, '') || ''
      : '';
  });

  // Effect to re-sync internal states if the `value` prop changes from parent
  useEffect(() => {
    if (isPhoneInput) {
      const newCountryCodeMatch = value?.match(/^\+\d{1,4}/);
      const newCountryCode = newCountryCodeMatch
        ? newCountryCodeMatch[0]
        : countryCode; // Use current if not found

      const newLocalNumberRaw = value?.substring(newCountryCode.length);
      const newLocalNumber = newLocalNumberRaw?.replace(/\D/g, '') || '';

      // Update internal states only if they actually differ to prevent infinite loops
      if (newCountryCode !== countryCode) {
        setCountryCode(newCountryCode);
      }
      if (newLocalNumber !== localNumber) {
        setLocalNumber(newLocalNumber);
      }
    } else {
      // Reset for non-phone inputs if they mistakenly had phone values
      if (localNumber !== '' || countryCode !== '+1') {
        setLocalNumber('');
        setCountryCode('+1');
      }
    }
  }, [value, isPhoneInput]); // Removed countryCode, localNumber from deps to prevent infinite loops

  // Replace CountrySelect with a simple select for country code, defaulting to +1 for US/Canada
  const countryOptions = [
    { code: '+1', label: 'Canada/US (+1)' },
    // Add more as needed
  ];

  // Handler for CountrySelect component (now expects a string, not event)
  const handleCountryCodeChange = newCode => {
    setCountryCode(newCode); // Update internal state
    // Notify parent with the *full* phone number (new country code + current local number)
    if (onChange) {
      onChange(name, newCode + localNumber);
    }
  };

  // Handler for the local number input field
  const handleLocalNumberChange = e => {
    let digits = e.target.value.replace(/\D/g, ''); // Strip non-digits from typed value

    // The maxLength prop from SignupPage is now for the LOCAL number part (e.g., 10 digits)
    const localNumberMaxLength = typeof maxLength === 'number' ? maxLength : 10;

    if (digits.length > localNumberMaxLength) {
      digits = digits.slice(0, localNumberMaxLength);
    }
    setLocalNumber(digits); // Update internal state

    // Notify parent with the *full* phone number (current country code + new local number)
    if (onChange) {
      onChange(name, countryCode + digits);
    }
  };

  // Other handlers remain largely the same, ensuring maxLength is respected
  const handlePasswordChange = e => {
    let passwordValue = e.target.value;
    if (typeof maxLength === 'number' && passwordValue.length > maxLength) {
      passwordValue = passwordValue.slice(0, maxLength);
    }
    if (onChange) {
      onChange(name, passwordValue);
    }
  };

  const handleGenericChange = e => {
    if (onChange) {
      onChange(name, e.target.value);
    }
  };

  let specificChangeHandler = handleGenericChange;
  let effectiveInputType = type;
  // This is the maxLength that will be passed to the HTML <input> element.
  // For phone numbers, it should be the maxLength of the LOCAL part.
  let effectiveHtmlMaxLength = maxLength;

  if (isPhoneInput) {
    specificChangeHandler = handleLocalNumberChange;
    effectiveInputType = 'tel';
    inputMode = inputMode || 'tel';
    // For phone input, allow up to 15 digits for the local number (E.164 max)
    effectiveHtmlMaxLength = 15;
  } else if (
    icon === 'password' ||
    name === 'password' ||
    name === 'passwordConfirm' ||
    name === 'currentPassword' ||
    name === 'newPassword'
  ) {
    specificChangeHandler = handlePasswordChange;
    if (showPassword) effectiveInputType = 'text';
  } else if (type === 'date') {
    placeholder = '';
  }

  // The value displayed in the actual HTML <input> element
  let displayValueForInput = value;
  if (isPhoneInput) {
    displayValueForInput = localNumber; // Input field only displays the local number part
  }

  return (
    <div className={`${styles.fieldContainer} ${className}`.trim()}>
      <label
        htmlFor={name}
        className={styles.label}
        style={{ color: labelColor }}
      >
        {label}
        {required && <span className={styles.requiredIndicator}>*</span>}
      </label>
      <div className={styles.inputContainer}>
        {isPhoneInput && (
          <select
            value={countryCode}
            onChange={e => handleCountryCodeChange(e.target.value)}
            className={styles.input}
            style={{ maxWidth: 100 }}
          >
            {countryOptions.map(opt => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
        <input
          type={effectiveInputType}
          id={name}
          name={name}
          className={styles.input}
          placeholder={placeholder}
          value={displayValueForInput}
          onChange={specificChangeHandler}
          inputMode={inputMode}
          maxLength={effectiveHtmlMaxLength}
          required={required}
          disabled={disabled}
          autoComplete={
            name.includes('password')
              ? 'new-password'
              : type === 'email'
                ? 'email'
                : 'on'
          }
          max={type === 'date' ? props.max : undefined}
          min={type === 'number' ? props.min : undefined}
          step={type === 'number' ? props.step : undefined}
          {...props}
        />
        {icon === 'password' && (
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={disabled}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
    </div>
  );
}

InputField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  icon: PropTypes.node,
  inputMode: PropTypes.string,
  maxLength: PropTypes.number,
  required: PropTypes.bool,
  rows: PropTypes.number,
  disabled: PropTypes.bool,
  onKeyDown: PropTypes.func,
  className: PropTypes.string,
  labelColor: PropTypes.string,
};

export default InputField;
