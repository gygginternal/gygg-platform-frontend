// src/components/Onboarding/InputField.js
import React from 'react';
import styles from './InputField.module.css'; // Create this CSS module for your styles

// No TS interface needed for JS version, props are destructured directly
function InputField({
    label,
    name, // Add name prop for state management in parent
    value,
    onChange, // Parent should provide a handler: (name, value) => void
    type = "text", // Default type
    required = false,
    placeholder = "",
    ...props // Spread other standard input attributes like maxLength, readOnly, etc.
}) {

    const handleChange = (e) => {
        if (onChange) {
            onChange(name, e.target.value); // Pass name and value to parent
        }
    };

    return (
        <div className={styles.field}> {/* Use the class from your CSS module */}
            <label htmlFor={name} className={styles.label}>{label}</label>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={handleChange}
                required={required}
                placeholder={placeholder}
                className={styles.input} {/* Use the class from your CSS module */}
                {...props} // Spread other HTML input attributes
            />
        </div>
    );
}

export default InputField; // Use default export for wider compatibility if not specifically needing named