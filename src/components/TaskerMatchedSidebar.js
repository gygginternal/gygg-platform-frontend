import { LampDesk } from "lucide-react";
import { Link } from "react-router-dom"; // Use react-router Link
import { useAuth } from "../context/AuthContext"; // Adjust path
import styles from "./TaskerMatchedSidebar.module.css"; // Import CSS module

export function TaskerMatchedSidebar() {
  const { user } = useAuth(); // Get logged-in user data
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Profile Section */}
        <div className={styles.profileSection}>
          <div className={styles.profileImageContainer}>
            <img
              src="/default.png"
              alt="Profile picture"
              width={64}
              height={64}
              className={styles.profileImage}
            />
          </div>
          <div>
            <h2 className={styles.profileName}>
              {user.fullName || `${user.firstName} ${user.lastName}`}
            </h2>
            <Link
              to="/profile"
              href="#"
              className={styles.viewProfileLink}
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* Awaiting Gigs Section */}
        {/* <div className={styles.awaitingGigsSection}>
          <div className={styles.iconContainer}>
            <LampDesk size={32} />
          </div>
          <div>
            <h3 className={styles.sectionTitle}>
              Awaiting posted gigs
            </h3>
            <a href="#" className={styles.sectionLink}>
              Need a dog sitter for the weekend
            </a>
          </div>
        </div> */}

        {/* Applicants Section */}
        <div className={styles.applicantsSection}>
          {/* <div className={styles.applicantItem}>
            <div className={styles.applicantImageContainer}>
              <img
                src="/default.png?height=64&width=64"
                alt="Applicant picture"
                width={64}
                height={64}
                className={styles.applicantImage}
              />
            </div>
            <div>
              <p className={styles.applicantDescription}>
                Ariana. A from Thornhill applied to dog sitter for a w...
              </p>
              <a href="#" className={styles.viewApplicationLink}>
                View application
              </a>
            </div>
          </div> */}

          {/* Applicant 2 */}
          {/* <div className={styles.applicantItem}>
            <div className={styles.applicantImageContainer}>
              <img
                src="/default.png"
                alt="Applicant picture"
                width={64}
                height={64}
                className={styles.applicantImage}
              />
            </div>
            <div>
              <p className={styles.applicantDescription}>
                Ariana. A from Thornhill applied to dog sitter for a w...
              </p>
              <a href="#" className={styles.viewApplicationLink}>
                View application
              </a>
            </div>
          </div> */}

          {/* Applicant 3 */}
          {/* <div className={styles.applicantItem}>
            <div className={styles.applicantImageContainer}>
              <img
                src="/default.png"
                alt="Applicant picture"
                width={64}
                height={64}
                className={styles.applicantImage}
              />
            </div>
            <div>
              <p className={styles.applicantDescription}>
                Ariana. A from Thornhill applied to dog sitter for a w...
              </p>
              <a href="#" className={styles.viewApplicationLink}>
                View application
              </a>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
