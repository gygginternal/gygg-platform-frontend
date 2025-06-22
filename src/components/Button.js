import styles from './Button.module.css';
import PropTypes from 'prop-types';

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
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'destructive']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string,
};

export default Button;
