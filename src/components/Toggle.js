import React from 'react';
import styles from './Toggle.module.css';

const Toggle = ({ isOn, handleToggle }) => {
  return (
    <div className={styles.toggleContainer} onClick={handleToggle}>
      <div className={`${styles.toggleButton} ${isOn ? styles.toggleOn : ''}`} />
    </div>
  );
};

export default Toggle;
