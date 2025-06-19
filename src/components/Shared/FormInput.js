// src/components/Shared/FormInput.js (Example if different from global InputField)
import React from 'react';
import styles from './FormInput.module.css'; // Create this

function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  ...props
}) {
  const handleChange = e => {
    if (onChange) {
      onChange(name, e.target.value); // Pass name and value
    }
  };
  return (
    <div className={styles.inputField}>
      <label htmlFor={name} className={styles.inputLabel}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        className={styles.input}
        {...props}
      />
    </div>
  );
}
export default FormInput;
