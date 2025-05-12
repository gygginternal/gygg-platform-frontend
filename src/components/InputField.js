// frontend/src/components/InputField.js
import React, { useState } from "react";
import styles from "./InputField.module.css"; // Create this CSS module
import CountrySelect from "./CountrySelect"; // Import CountrySelect

// No TS interfaces in JS
function InputField({
  label,
  name,
  type = "text", // Default type
  placeholder,
  value,
  onChange, // Expects (name, value) signature from parent
  icon,
  inputMode,
  maxLength,
  required = false
}) {
  const [showPassword, setShowPassword] = useState(false);
  // Phone state needs to be managed carefully if combining code and number
  const [countryCode, setCountryCode] = useState("+1"); // Default country code

  // Combined handler for parent state update
  const handleParentChange = (fieldName, fieldValue) => {
    if (onChange) { // Check if onChange prop is provided
        onChange(fieldName, fieldValue);
    } else {
        console.warn("InputField: onChange prop is missing for field:", fieldName);
    }
  };


  // Handler specifically for the phone number input (digits only)
  const handlePhoneDigitsChange = (e) => {
    let phoneNumberDigits = e.target.value.replace(/\D/g, ""); // Remove non-digits
    // Enforce maxLength on the digits part only
    if (maxLength && phoneNumberDigits.length > maxLength) {
        phoneNumberDigits = phoneNumberDigits.slice(0, maxLength);
    }
    // Call parent's onChange with the name 'phone' and the combined value
    handleParentChange(name, countryCode + phoneNumberDigits);
  };

  // Handler for country code change
   const handleCountryCodeChange = (e) => {
        const newCode = e.target.value;
        setCountryCode(newCode);
        // Update parent state: keep only digits from current value and prepend new code
        const currentDigits = value.substring(countryCode.length).replace(/\D/g, "");
        handleParentChange(name, newCode + currentDigits);
   };

  // Handler for regular inputs and password
  const handleInputChange = (e) => {
    handleParentChange(name, e.target.value);
  };

  // Handler for password field specifically to apply length limit
   const handlePasswordChange = (e) => {
      let passwordValue = e.target.value;
      if (maxLength && passwordValue.length > maxLength) {
         passwordValue = passwordValue.slice(0, maxLength);
      }
      handleParentChange(name, passwordValue);
   };


  // Determine which value and onChange handler to use based on type/icon
  let currentValue = value;
  let changeHandler = handleInputChange;

  if (icon === "phone") {
      // Extract digits part for the input field display
      currentValue = value.startsWith(countryCode) ? value.substring(countryCode.length) : value.replace(/\D/g, ''); // Show only digits after code
      changeHandler = handlePhoneDigitsChange;
      // MaxLength here applies to the digits part, not the combined value
      maxLength = 10; // Typical phone length without country code
  } else if (name === "password" || name === "confirmPassword") {
      changeHandler = handlePasswordChange;
       // MaxLength for password comes from props
  } else if (type === 'date'){
       // For date inputs, standard handler is fine, clear placeholder
       placeholder = '';
  }


  return (
    <div className={styles.fieldContainer}>
      <label htmlFor={name} className={styles.label}>{label}</label>
      <div className={styles.inputContainer}>
        {icon === "phone" && (
          <CountrySelect
             value={countryCode}
             onChange={handleCountryCodeChange} // Handle select change
           />
        )}
        <input
          type={icon === "password" && showPassword ? "text" : type}
          id={name} // Use name for id as well
          name={name}
          className={styles.input}
          placeholder={placeholder}
          value={currentValue} // Use the potentially modified value
          onChange={changeHandler} // Use the determined handler
          inputMode={inputMode} // Set input mode (numeric for phone digits)
          maxLength={maxLength} // Apply maxLength
          required={required}
          autoComplete={name.includes('password') ? 'new-password' : 'on'} // Help browser autocomplete
        />
        {icon === "password" && (
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"} // Accessibility
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </div>
  );
}

export default InputField;