import styles from './Badge.module.css';
import PropTypes from 'prop-types';

const Badge = ({ variant = 'default', children }) => {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>
  );
};

Badge.propTypes = {
  variant: PropTypes.oneOf(['default', 'secondary', 'destructive', 'outline']),
  children: PropTypes.node.isRequired,
};

export default Badge;
