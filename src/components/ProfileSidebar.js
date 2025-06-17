import React from "react";
// import cn from "classnames"; // For conditional classnames
import styles from "./ProfileSidebar.module.css"; // Your CSS module
import { Link } from "react-router-dom"; // Use react-router Link
import { useAuth } from "../context/AuthContext"; // Adjust path
import RecommendedGigs from "./RecommendedGigs"; // Import the new component
import RecommendedAppliances from "./RecommendedAppliances";
import AwaitedPostedGigs from "./AwaitedPostedGigs"; // Import the AwaitedPostedGigs component

function ProfileSidebar() {
  const { user } = useAuth(); // Get logged-in user data

  // User's skills/gigs they offer - should come from user profile
  const userSkills = user?.skills || ["Pet Sitting", "Gardening"]; // Example fallback

  if (!user) {
    return (
      <aside className={styles.profileSidebar}>
        <p>Loading profile...</p>
      </aside>
    );
  }

  const iCanHelp = (
    <section className={styles.gigsSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>
          <img src="/assets/lamp-on.svg" alt="Lamp" width={20} height={20} />
        </div>
        <h4 className={styles.sectionTitle}>Gigs I can help you with</h4>
      </div>
      <div className={styles.gigTags}>
        {userSkills.length > 0 ? (
          userSkills.map((gig, index) => (
            <span key={index} className={styles.skillTag}>
              {gig}
            </span>
          ))
        ) : (
          <p className={styles.addSkillsMessage}>
            Add skills in your profile!
          </p>
        )}
      </div>
    </section>
  );

  return (
    <aside className={styles.profileSidebar}>
      {/* Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <img
            src={user.profileImage || "/default.jpg"}
            alt="Profile"
            width={64}
            height={64}
            className={styles.profileImage}
          />
          <div>
            <h3 className={styles.profileName}>
              {user.fullName || `${user.firstName} ${user.lastName}`}
            </h3>
            <Link to="/profile" className={styles.viewProfileLink}>
              View Profile
            </Link>
          </div>
        </div>

        {/* Render Recommended Gigs Section if user is a tasker */}
        {user.role?.includes("provider") && (
          <>
            <AwaitedPostedGigs />
            <RecommendedAppliances />
          </>
        )}

        {/* Render Recommended Gigs Section if user is a tasker */}
        {user.role?.includes("tasker") && (
          <>
            {iCanHelp}
            <RecommendedGigs />
          </>
        )}
      </div>
    </aside>
  );
}

export default ProfileSidebar;
