// src/components/Shared/FormInput.js (Example if different from global InputField)
// Remove: import React from 'react';
import { forwardRef } from 'react';
import styles from './FormInput.module.css'; // Create this
import PropTypes from 'prop-types';

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

FormInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  rows: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  error: PropTypes.string,
};

export default FormInput;
