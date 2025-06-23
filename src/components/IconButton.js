import PropTypes from 'prop-types';
import React from 'react';
import styles from './IconButton.module.css'; // Use the CSS module provided

function IconButton({ children, className = '', ...props }) {
  return (
    <button className={`${styles.iconButton} ${className}`} {...props}>
      {children}
    </button>
  );
}

IconButton.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default IconButton;
