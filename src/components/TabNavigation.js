import React from "react";
import styles from "./TabNavigation.module.css";

export const TabNavigation = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ""}`}
            onClick={() => onTabChange(tab.id)}
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
