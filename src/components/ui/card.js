import * as React from 'react';
import styles from './card.module.css';
import PropTypes from 'prop-types';

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`${styles.card} ${className}`} {...props} />
));
Card.displayName = 'Card';

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`${styles.header} ${className}`} {...props} />
));
CardHeader.displayName = 'CardHeader';

CardHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={`${styles.title} ${className}`} {...props}>
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

CardTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`${styles.description} ${className}`}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

CardDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`${styles.content} ${className}`} {...props} />
));
CardContent.displayName = 'CardContent';

CardContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`${styles.footer} ${className}`} {...props} />
));
CardFooter.displayName = 'CardFooter';

CardFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
