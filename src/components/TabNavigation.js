import React from 'react';
import styles from './TabNavigation.module.css';
import PropTypes from 'prop-types';

export const TabNavigation = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            role="tab"
            tabIndex={0}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') onTabChange(tab.id);
            }}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            aria-selected={activeTab === tab.id}
            aria-label={`Switch to ${tab.label}`}
          >
            {tab.label}
            {activeTab === tab.id && <div className={styles.activeIndicator} />}
          </div>
        ))}
      </div>
      <div className={styles.separator} />
    </div>
  );
};

TabNavigation.propTypes = {
  activeTab: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  onTabChange: PropTypes.func.isRequired,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
};
