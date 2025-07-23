import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import ErrorDisplay from './ErrorDisplay';
import { validateContent } from '../../utils/contentFilter';
import styles from './InputField.module.css';

const COUNTRY_OPTIONS = [
  { code: '+1', label: '+1', flag: 'US' },
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
  enableContentFilter = true, // New prop to enable/disable content filtering
  contentFilterOptions = {}, // Options for content filtering
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('+1');
  const [localNumber, setLocalNumber] = useState('');
  const [contentWarning, setContentWarning] = useState(null);
  const [isContentValid, setIsContentValid] = useState(true);

  // Determine input variant
  const isPhoneInput = variant === 'phone';
  const isPasswordInput = variant === 'password' || type === 'password';
  const isTextarea = type === 'textarea';

  // Parse phone number from value prop
  const parsePhoneNumber = useCallback(
    phoneValue => {
      if (!phoneValue || !isPhoneInput) return { code: '+1', number: '' };

      // Handle cases where phoneValue might be just the country code
      if (phoneValue === '+1' || phoneValue === '+44' || phoneValue === '+91') {
        return { code: phoneValue, number: '' };
      }

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
        onChange(name, newCode + localNumber, { isContentValid: true });
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
        const fullPhoneNumber = countryCode + limitedDigits;
        // Phone number formatted and updated
        onChange(name, fullPhoneNumber, { isContentValid: true });
      }
    },
    [name, countryCode, maxLength, onChange]
  );

  // Content validation function
  const validateInputContent = useCallback(
    (text) => {
      if (!enableContentFilter || !text || type === 'password' || type === 'email' || isPhoneInput) {
        setContentWarning(null);
        setIsContentValid(true);
        return true;
      }

      const validation = validateContent(text, {
        minSafetyScore: 70,
        strictMode: false,
        ...contentFilterOptions
      });

      if (!validation.isValid) {
        setContentWarning({
          message: validation.message,
          suggestions: validation.suggestions,
          severity: validation.safetyScore < 30 ? 'high' : 'medium'
        });
        setIsContentValid(false);
        return false;
      } else {
        setContentWarning(null);
        setIsContentValid(true);
        return true;
      }
    },
    [enableContentFilter, type, isPhoneInput, contentFilterOptions]
  );

  // Handle regular input change
  const handleInputChange = useCallback(
    e => {
      let newValue = e.target.value;
      if (maxLength && newValue.length > maxLength) {
        newValue = newValue.slice(0, maxLength);
      }

      // Validate content if filtering is enabled
      const isValid = validateInputContent(newValue);

      if (onChange) {
        onChange(name, newValue, { isContentValid: isValid });
      }
    },
    [name, maxLength, onChange, validateInputContent]
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

      <div className={`${styles.inputContainer} ${error ? styles.error : ''} ${contentWarning ? styles.contentWarning : ''}`}>
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
        <div id={`${name}-error`}>
          <ErrorDisplay 
            errors={error} 
            variant="field"
            showIcon={false}
          />
        </div>
      )}

      {contentWarning && (
        <div className={styles.contentWarningContainer}>
          <div className={`${styles.contentWarningMessage} ${styles[contentWarning.severity]}`}>
            <AlertTriangle size={14} className={styles.warningIcon} />
            <span>{contentWarning.message}</span>
          </div>
          {contentWarning.suggestions && contentWarning.suggestions.length > 0 && (
            <div className={styles.contentSuggestions}>
              <p className={styles.suggestionsTitle}>Suggestions:</p>
              <ul className={styles.suggestionsList}>
                {contentWarning.suggestions.slice(0, 2).map((suggestion, index) => (
                  <li key={index} className={styles.suggestionItem}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {helperText && !error && !contentWarning && (
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
  enableContentFilter: PropTypes.bool,
  contentFilterOptions: PropTypes.object,
};

export default InputField;
