import {} from /* cva */ 'class-variance-authority';
// import { cn } from "../../uitls/cn";
import styles from './badge.module.css';
import PropTypes from 'prop-types';

function Badge({ className, variant = 'default', ...props }) {
  const badgeClasses = `${styles.base} ${styles[variant]} ${className}`.trim();
  return <div className={badgeClasses} {...props} />;
}

Badge.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'secondary', 'destructive', 'outline']),
  children: PropTypes.node,
};

export { Badge };
