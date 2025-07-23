import React from 'react';
import styles from './GigHelperPage.module.css';
import ProfileSidebar from '../../components/Shared/ProfileSidebar';
import { useLocation } from 'react-router-dom';
import TaskerListSafe from '../../components/TaskerListSafe';
import ErrorBoundary from '../../components/ErrorBoundary';

export default function GigHelperPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTermFromUrl = searchParams.get('search') || '';

  return (
    <ErrorBoundary>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <aside className={styles.sidebarArea}>
            <ProfileSidebar />
          </aside>
          <main className={styles.mainFeedArea}>
            <div className={styles.header}>
              <h1 className={styles.title}>Gig Helpers</h1>
              <p className={styles.subtitle}>
                Find helpers for your gigs based on their skills and preferences
              </p>
            </div>
            <TaskerListSafe />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
