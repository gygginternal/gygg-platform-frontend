import {} from /* cva */ 'class-variance-authority';
// import { cn } from "../../uitls/cn";
import styles from './badge.module.css';

function Badge({ className, variant = 'default', ...props }) {
  const badgeClasses = `${styles.base} ${styles[variant]} ${className}`.trim();
  return <div className={badgeClasses} {...props} />;
}

export { Badge };
