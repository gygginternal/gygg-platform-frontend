import React from 'react';
import styles from './ProfileSidebar.module.css'; // Your CSS module
import Button from './Button'; // Use shared Button
import { Link } from 'react-router-dom'; // Use react-router Link
import { useAuth } from '../context/AuthContext'; // Adjust path
import logger from '../utils/logger'; // Optional logger

// Removed page prop as it wasn't used effectively in example logic
function ProfileSidebar() {
    const { user } = useAuth(); // Get logged-in user data

    // --- Mock Data (Replace with dynamic data later if needed) ---
    // For "People need your help", you'd need another API call based on user's skills/location
    const recommendedGigs = [
        { id: "1", description: "Ariana. A from Thornhill needs a dog sitter", gigId: "temp1" },
        { id: "2", description: "Lia.T is from Thornhill needs a grocery Shopper", gigId: "temp2" },
        { id: "3", description: "Wilson. H from Richmondhill needs a furniture assembler", gigId: "temp3" },
    ];
    // User's skills/gigs they offer - should come from user profile
    const userSkills = user?.skills || ["Pet Sitting", "Gardening"]; // Example fallback

    if (!user) {
        return <aside className={styles.profileSidebar}><p>Loading profile...</p></aside>;
    }

    // Image error handler
    const handleImageError = (e) => { e.target.src = '/default.jpg'; };


    return (
        <aside className={styles.profileSidebar}>
            {/* Optional Heading */}
            {/* <h2 className={styles.profileTitleText}> Your Profile </h2> */}

            {/* Profile Card */}
            <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                    <img // Use standard img
                        src={user.profileImage || '/default.jpg'}
                        alt="Profile"
                        width={64}
                        height={64}
                        className={styles.profileImage}
                        onError={handleImageError}
                    />
                <div>
                        <h3 className={styles.profileName}>{user.fullName || `${user.firstName} ${user.lastName}`}</h3>
                         {/* Link to actual profile edit page */}
                        <Link to="/dashboard" className={styles.viewProfileLink}>
                            View Profile
                        </Link>
                    </div>
                </div>

                {/* Skills/Gigs Section */}
                <section className={styles.gigsSection}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionIcon}>
                            <img src="/assets/lamp-on.svg" alt="Lamp" width={20} height={20} /> {/* Icon path */}
                        </div>
                        <h4 className={styles.sectionTitle}>Gigs I can help you with</h4>
                    </div>
                    <div className={styles.gigTags}>
                        {userSkills.length > 0 ? (
                            userSkills.map((gig, index) => (
                                // Use Button or simple span? Button suggests action.
                                <span key={index} className={styles.skillTag}>
                                    {gig}
                                </span>
                            ))
                        ) : (
                            <p style={{fontSize: '0.9em', color: '#666'}}>Add skills in your profile!</p>
                        )}
                    </div>
                </section>

                 {/* Recommended Gigs Section (Needs Real Data) */}
                <section className={styles.peopleSection}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionIcon}>
                            <img src="/assets/profile-2user.svg" alt="Profile" width={20} height={20} /> {/* Icon path */}
                        </div>
                        {/* Make text dynamic */}
                        <h4 className={styles.sectionTitleUnderlined}>
                             Open Gigs You Might Like
                        </h4>
                    </div>
                    <div className={styles.peopleList}>
                         {recommendedGigs.length > 0 ? recommendedGigs.map((item) => (
                            <div key={item.id} className={styles.personItem}>
                                {/* <img src="/assets/image-placeholder.png" alt="Person" width={40} height={40} className={styles.personImage} /> */}
                                <div>
                                    <p className={styles.personDescription}>
                                         {item.description} {/* Should be gig title */}
                                    </p>
                                     {/* Link to the actual gig */}
                                    <Link to={`/gigs/${item.gigId}`} className={styles.viewGigLink}>
                                        View gig detail
                                    </Link>
                                </div>
                            </div>
                         )) : <p style={{fontSize: '0.9em', color: '#666'}}>No recommended gigs found right now.</p>}
                    </div>
                </section>
            </div>
        </aside>
    );
};

export default ProfileSidebar;