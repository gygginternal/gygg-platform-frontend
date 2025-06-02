// frontend/src/components/Shared/InputField.js
import React, { useState, useEffect } from "react";
import styles from "./InputField.module.css"; // Ensure this CSS Module exists and is styled
import CountrySelect from "./CountrySelect"; // Ensure this component is correctly implemented
import { cn } from "../../uitls/cn"; // Import the utility function for class names

function InputField({
  label,
  name, // Crucial: This 'name' is used to update the parent's formData state
  type = "text",
  placeholder,
  value = "", // Controlled component: value comes from parent state
  onChange, // Parent's onChange: (fieldName: string, fieldValue: string) => void
  icon, // 'phone' or 'password'
  inputMode,
  maxLength, // Can be for text, password, or the *local part* of a phone number
  required = false,
  rows = 3, // Default rows for textarea
  disabled = false,
  onKeyDown,
  className = "",
  // ... any other standard input/textarea props
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  // --- State specifically for phone parts ---
  // Initialize countryCode and localNumber by parsing the incoming 'value' prop IF it's a phone field
  const isPhoneInput = icon === "phone";
  const [countryCode, setCountryCode] = useState(
    isPhoneInput ? value?.match(/^\+\d{1,3}/)?.[0] || "+1" : "+1"
  );
  const [localNumber, setLocalNumber] = useState(
    isPhoneInput
      ? value?.substring(countryCode.length).replace(/\D/g, "") || ""
      : ""
  );

  // Update internal phone parts if the parent's 'value' prop changes externally
  useEffect(() => {
    if (isPhoneInput) {
      const newCountryCode = value?.match(/^\+\d{1,3}/)?.[0] || countryCode; // Keep current code if value is empty
      const newLocalNumber =
        value?.substring(newCountryCode.length).replace(/\D/g, "") || "";
      if (newCountryCode !== countryCode) setCountryCode(newCountryCode);
      if (newLocalNumber !== localNumber) setLocalNumber(newLocalNumber);
    }
  }, [value, isPhoneInput]); // Only re-run if value or isPhoneInput changes (though isPhoneInput shouldn't change)

  // --- Event Handlers ---

  // Handler for country code select change (passed to CountrySelect)
  const handleCountryCodeChange = (e) => {
    const newCode = e.target.value;
    setCountryCode(newCode);
    if (onChange) {
      onChange(name, newCode + localNumber); // Update parent with new combined E.164 number
    }
  };

  // Handler for the local phone number input part
  const handleLocalNumberChange = (e) => {
    let digits = e.target.value.replace(/\D/g, ""); // Remove non-digits
    const effectiveMaxLength = typeof maxLength === "number" ? maxLength : 10; // Default to 10 for local phone part
    if (digits.length > effectiveMaxLength) {
      digits = digits.slice(0, effectiveMaxLength);
    }
    setLocalNumber(digits);
    if (onChange) {
      onChange(name, countryCode + digits); // Update parent with new combined E.164 number
    }
  };

  // Handler for password field to apply maxLength specifically
  const handlePasswordChange = (e) => {
    let passwordValue = e.target.value;
    if (typeof maxLength === "number" && passwordValue.length > maxLength) {
      passwordValue = passwordValue.slice(0, maxLength);
    }
    if (onChange) {
      onChange(name, passwordValue);
    }
  };

  // Handler for generic inputs (text, email, date, textarea that isn't phone/password)
  const handleGenericChange = (e) => {
    if (onChange) {
      onChange(name, e.target.value);
    }
  };

  // Determine which specific change handler and value to use
  let currentDisplayValue = value; // Value for generic inputs
  let specificChangeHandler = handleGenericChange;
  let effectiveInputType = type;
  let effectiveMaxLength = maxLength; // MaxLength for generic inputs

  if (isPhoneInput) {
    currentDisplayValue = localNumber; // Input field only shows the local part
    specificChangeHandler = handleLocalNumberChange;
    effectiveInputType = "tel"; // Use 'tel' for semantic phone input
    effectiveMaxLength = typeof maxLength === "number" ? maxLength : 10; // Max length for local part
    inputMode = inputMode || "tel";
  } else if (
    icon === "password" ||
    name === "password" ||
    name === "passwordConfirm" ||
    name === "currentPassword" ||
    name === "newPassword"
  ) {
    specificChangeHandler = handlePasswordChange; // Use password specific handler for length
    if (showPassword) effectiveInputType = "text";
    // maxLength for password is passed via props
  } else if (type === "date") {
    placeholder = ""; // Date inputs don't use placeholder well
  } else if (type === "number" && name === "ratePerHour") {
    // Ensure value is appropriate for number input
    currentDisplayValue = value === 0 ? "" : String(value || ""); // Allow empty input for 0 rate
  }

  return (
    <div className={cn(styles.fieldContainer, className)}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <div className={styles.inputContainer}>
        {isPhoneInput && (
          <CountrySelect
            value={countryCode}
            onChange={handleCountryCodeChange} // Event from select
          />
        )}
        {type === "textarea" ? (
          <textarea
            id={name}
            name={name}
            className={`${styles.input} ${styles.textarea}`} // Apply both for base and specific
            placeholder={placeholder}
            value={currentDisplayValue} // The value from parent state
            onChange={specificChangeHandler} // Generic handler works for textarea
            rows={rows}
            required={required}
            disabled={disabled}
            maxLength={effectiveMaxLength} // Apply maxLength to textarea
            {...props} // Spread other props like readOnly
          />
        ) : (
          <input
            type={effectiveInputType}
            id={name}
            name={name}
            className={styles.input}
            placeholder={placeholder}
            value={currentDisplayValue} // The value from parent state
            onChange={specificChangeHandler}
            inputMode={inputMode}
            maxLength={effectiveMaxLength} // Apply effective maxLength
            required={required}
            disabled={disabled}
            autoComplete={
              name.includes("password")
                ? "new-password"
                : type === "email"
                ? "email"
                : "on"
            }
            max={type === "date" ? props.max : undefined} // For date input max boundary
            min={type === "number" ? props.min : undefined} // For number input min boundary
            step={type === "number" ? props.step : undefined} // For number input step
            {...props} // Spread other props
          />
        )}
        {icon === "password" && (
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={disabled}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </div>
  );
}

export default InputField;
