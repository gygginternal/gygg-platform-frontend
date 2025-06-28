import styles from './SocialFeedLayoutPage.module.css';
import Feed from '../../components/SocialFeedLayoutPage/Feed';
import ProfileSidebar from '../../components/Shared/ProfileSidebar';

export default function SocialFeedLayoutPage() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <aside className={styles.sidebarArea}>
          <ProfileSidebar />
        </aside>
        <main className={styles.mainFeedArea}>
          <Feed />
        </main>
      </div>
    </div>
  );
}
