// src/pages/GigsPage.js
import React from "react";
import styles from "./GigsPage.module.css";
import { TaskList } from "../components/TaskList";
import ProfileSidebar from "../components/ProfileSidebar";
import { useLocation } from "react-router-dom";

export default function GigsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTermFromUrl = searchParams.get("search") || "";

  return (
    <div className={styles.pageContainer}>
      <div className={styles.profileSidebar}>
        <ProfileSidebar />
      </div>
      <div className={styles.taskListContainer}>
        <TaskList initialSearchTerm={searchTermFromUrl} />
      </div>
    </div>
  );
}
