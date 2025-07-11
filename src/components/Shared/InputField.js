import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';
import styles from './InputField.module.css';

const COUNTRY_OPTIONS = [
  { code: '+1', label: 'CA', flag: 'CA' },
  { code: '+1', label: 'US', flag: 'US' },
  { code: '+44', label: 'UK', flag: 'GB' },
  { code: '+33', label: 'France', flag: 'FR' },
  { code: '+49', label: 'Germany', flag: 'DE' },
  { code: '+81', label: 'Japan', flag: 'JP' },
  { code: '+86', label: 'China', flag: 'CN' },
  { code: '+91', label: 'India', flag: 'IN' },
];

const InputField = ({
  label,
  name,
  type = 'text',
  placeholder,
  value = '',
  onChange,
  variant = 'default', // 'default', 'phone', 'password'
  maxLength,
  required = false,
  rows = 3,
  disabled = false,
  onKeyDown,
  className = '',
  labelColor = '#374151',
  error,
  helperText,
  autoComplete,
  min,
  max,
  step,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('+1');
  const [localNumber, setLocalNumber] = useState('');

  // Determine input variant
  const isPhoneInput = variant === 'phone';
  const isPasswordInput = variant === 'password' || type === 'password';
  const isTextarea = type === 'textarea';

  // Parse phone number from value prop
  const parsePhoneNumber = useCallback(
    phoneValue => {
      if (!phoneValue || !isPhoneInput) return { code: '+1', number: '' };

      const match = phoneValue.match(/^(\+\d{1,4})(.*)$/);
      if (match) {
        return {
          code: match[1],
          number: match[2].replace(/\D/g, ''),
        };
      }
      return { code: '+1', number: phoneValue.replace(/\D/g, '') };
    },
    [isPhoneInput]
  );

  // Initialize phone number state
  useEffect(() => {
    if (isPhoneInput) {
      const { code, number } = parsePhoneNumber(value);
      setCountryCode(code);
      setLocalNumber(number);
    }
  }, [value, isPhoneInput, parsePhoneNumber]);

  // Handle country code change
  const handleCountryCodeChange = useCallback(
    newCode => {
      setCountryCode(newCode);
      if (onChange) {
        onChange(name, newCode + localNumber);
      }
    },
    [name, localNumber, onChange]
  );

  // Handle local number change
  const handleLocalNumberChange = useCallback(
    e => {
      const digits = e.target.value.replace(/\D/g, '');
      const limitedDigits = maxLength ? digits.slice(0, maxLength) : digits;
      setLocalNumber(limitedDigits);

      if (onChange) {
        onChange(name, countryCode + limitedDigits);
      }
    },
    [name, countryCode, maxLength, onChange]
  );

  // Handle regular input change
  const handleInputChange = useCallback(
    e => {
      let newValue = e.target.value;
      if (maxLength && newValue.length > maxLength) {
        newValue = newValue.slice(0, maxLength);
      }

      if (onChange) {
        onChange(name, newValue);
      }
    },
    [name, maxLength, onChange]
  );

  // Get appropriate input type
  const getInputType = () => {
    if (isPhoneInput) return 'tel';
    if (isPasswordInput && showPassword) return 'text';
    return type;
  };

  // Get display value
  const getDisplayValue = () => {
    if (isPhoneInput) return localNumber;
    return value?.toString() || '';
  };

  // Get autocomplete attribute
  const getAutoComplete = () => {
    if (autoComplete) return autoComplete;
    if (isPasswordInput) return 'current-password';
    if (type === 'email') return 'email';
    if (isPhoneInput) return 'tel';
    return 'off';
  };

  // Get appropriate change handler
  const getChangeHandler = () => {
    if (isPhoneInput) return handleLocalNumberChange;
    return handleInputChange;
  };

  // Render input or textarea
  const renderInput = () => {
    const commonProps = {
      id: name,
      name,
      placeholder,
      value: getDisplayValue(),
      onChange: getChangeHandler(),
      maxLength: isPhoneInput ? 15 : maxLength,
      required,
      disabled,
      autoComplete: getAutoComplete(),
      onKeyDown,
      'aria-invalid': error ? 'true' : 'false',
      'aria-describedby': error
        ? `${name}-error`
        : helperText
          ? `${name}-helper`
          : undefined,
      ...props,
    };

    if (isTextarea) {
      return (
        <textarea
          {...commonProps}
          className={`${styles.input} ${styles.textarea}`}
          rows={rows}
        />
      );
    }

    return (
      <input
        {...commonProps}
        type={getInputType()}
        inputMode={isPhoneInput ? 'tel' : undefined}
        className={styles.input}
        min={type === 'number' ? min : undefined}
        max={type === 'number' || type === 'date' ? max : undefined}
        step={type === 'number' ? step : undefined}
      />
    );
  };

  return (
    <div className={`${styles.fieldContainer} ${className}`.trim()}>
      {label && (
        <label
          htmlFor={name}
          className={styles.label}
          style={{ color: labelColor }}
        >
          {label}
          {required && <span className={styles.requiredIndicator}>*</span>}
        </label>
      )}

      <div className={`${styles.inputContainer} ${error ? styles.error : ''}`}>
        {isPhoneInput && (
          <select
            value={countryCode}
            onChange={e => handleCountryCodeChange(e.target.value)}
            className={styles.countrySelect}
            disabled={disabled}
            aria-label="Country code"
          >
            {COUNTRY_OPTIONS.map(option => (
              <option key={option.code} value={option.code}>
                {option.flag} {option.code}
              </option>
            ))}
          </select>
        )}

        {renderInput()}

        {isPasswordInput && (
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={disabled}
          >
            {showPassword ? (
              <EyeOff size={16} color="currentColor" />
            ) : (
              <Eye size={16} color="currentColor" />
            )}
          </button>
        )}
      </div>

      {error && (
        <span id={`${name}-error`} className={styles.errorMessage}>
          {error}
        </span>
      )}

      {helperText && !error && (
        <span id={`${name}-helper`} className={styles.helperText}>
          {helperText}
        </span>
      )}
    </div>
  );
};

InputField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf([
    'text',
    'email',
    'password',
    'tel',
    'number',
    'date',
    'textarea',
  ]),
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'phone', 'password']),
  maxLength: PropTypes.number,
  required: PropTypes.bool,
  rows: PropTypes.number,
  disabled: PropTypes.bool,
  onKeyDown: PropTypes.func,
  className: PropTypes.string,
  labelColor: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  autoComplete: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  step: PropTypes.number,
};

export default InputField;
