import PropTypes from 'prop-types';
import styles from './Button.module.css'; // Use the CSS module you provided

function Button({
  children,
  variant = 'primary', // Keep variant if CSS uses it, otherwise simplify
  className = '',
  isActive = false,
  ...props // Pass other props like onClick, disabled, etc.
}) {
  // Combine class names: base, variant (if used in CSS), incoming, and active state
  const buttonClass = `
    ${styles.button}
    ${styles[variant] || ''}
    ${isActive ? styles.active : ''}
    ${className}
  `.trim(); // trim to remove extra spaces

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  className: PropTypes.string,
  isActive: PropTypes.bool,
};

export default Button;
