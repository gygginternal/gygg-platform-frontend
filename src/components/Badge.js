import PropTypes from 'prop-types';
import styles from './Badge.module.css';

const Badge = ({ variant = 'default', children }) => {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>
  );
};

Badge.propTypes = {
  variant: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Badge;
