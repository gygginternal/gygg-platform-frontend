// src/pages/GigsPage.js
import React from "react";
import styles from "./GigsPage.module.css"; // Create this CSS Module
import { TaskList } from "../components/TaskList"; // Use named import if TaskList uses named export
// import TaskList from "../components/GigsPage/TaskList"; // Use default import if TaskList uses default export
import Header from "../components/Header"; // Adjust path
import ProfileSidebar from "../components/ProfileSidebar"; // Adjust path

export default function GigsPage() {
  // Use default export for pages usually
  return (
    // No <head> elements needed here, handled by index.html or Helmet if used
    // No <main> needed if App.js provides main layout container
    <div className={styles.pageContainer}>
      {" "}
      {/* Optional page-specific container */}
      {/* Header and Sidebar are likely rendered globally in App.js */}
      {/* If not, uncomment them here */}
      {/* <Header /> */}
      <div className={styles.contentLayout}>
        {/* <ProfileSidebar /> */}{" "}
        {/* Assuming ProfileSidebar is static info, not main nav */}
        <div className={styles.taskListContainer}>
          {" "}
          {/* Wrapper for TaskList */}
          <h2 className={styles.pageTitle}>Available Gigs</h2>{" "}
          {/* Add a title */}
          <TaskList />
        </div>
      </div>
    </div>
  );
}
