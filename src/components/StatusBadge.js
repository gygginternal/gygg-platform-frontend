import React from "react";
import styles from "./StatusBadge.module.css";

export function StatusBadge({ status, className = "" }) {
  const key = status?.toLowerCase();
  const statusClass = styles[key] || "";

  return (
    <span className={`${styles.badge} ${statusClass} ${className}`}>
      {status}
    </span>
  );
}
