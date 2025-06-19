import React from 'react';
import styles from './Toggle.module.css';
import PropTypes from 'prop-types';

const Toggle = ({ isOn, handleToggle }) => {
  return (
    <div
      role="switch"
      tabIndex={0}
      aria-checked={isOn}
      onClick={handleToggle}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') handleToggle();
      }}
      className={`${styles.toggleContainer} ${isOn ? styles.toggleOn : ''}`}
      aria-label={isOn ? 'Switch off' : 'Switch on'}
    >
      <div className={styles.toggleButton} />
    </div>
  );
};

Toggle.propTypes = {
  isOn: PropTypes.bool.isRequired,
  handleToggle: PropTypes.func.isRequired,
};

export default Toggle;
