// src/components/Settings/PersonalInfoForm.js
import React, { useState, useEffect } from "react";
import styles from "./PersonalInfoForm.module.css"; // Make sure this CSS Module exists and is styled
import { useAuth } from "../context/AuthContext"; // Adjust path as needed
import apiClient from "../api/axiosConfig"; // Adjust path as needed
import logger from "../utils/logger"; // Optional logger, adjust path as needed

function PersonalInfoForm() {
    const { user, refreshUser } = useAuth(); // Get user and refresh function
    const [activeTab, setActiveTab] = useState("personal"); // 'personal' or 'withdraw'

    // --- State for Forms ---
    const [personalInfo, setPersonalInfo] = useState({
        firstName: "", lastName: "", email: "", // Email displayed, not editable usually
        address: "", city: "", state: "", postalCode: "", country: "" // Address fields flattened for form state
    });
    const [passwordInfo, setPasswordInfo] = useState({
        currentPassword: "", newPassword: "", confirmNewPassword: ""
    });

    // --- State for Stripe ---
    const [stripeStatus, setStripeStatus] = useState(null); // null=unknown, false=not connected/incomplete, object=details
    const [stripeLoading, setStripeLoading] = useState(false);
    const [stripeError, setStripeError] = useState('');

    // --- General Loading & Feedback State ---
    const [loading, setLoading] = useState(false); // For saving personal/password info
    const [error, setError] = useState(''); // For personal info errors
    const [success, setSuccess] = useState(''); // For personal info success
    const [passwordError, setPasswordError] = useState(''); // Specific password error
    const [passwordSuccess, setPasswordSuccess] = useState(''); // Specific password success

    // --- Populate forms when user data loads ---
    useEffect(() => {
        if (user) {
            logger.debug("Populating form data from user context:", user);
            setPersonalInfo({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                // Map nested address from user object to flattened form state
                address: user.address?.street || "",
                city: user.address?.city || "",
                state: user.address?.state || "",
                postalCode: user.address?.postalCode || "",
                country: user.address?.country || ""
            });
            // Clear password fields whenever user data reloads
            setPasswordInfo({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
        }
    }, [user]); // Rerun when user object changes

    // --- Fetch Stripe Status (only for taskers) ---
    const fetchStripeStatus = async () => {
         // Ensure user object exists and has roles before proceeding
         if (!user || !user.role || !Array.isArray(user.role) || !user.role.includes('tasker')) {
             setStripeStatus(null); // Clear status if not a tasker or user not loaded
             logger.debug("User not loaded or not a tasker, skipping Stripe status fetch.");
             return;
         };
        setStripeLoading(true); setStripeError(''); setStripeStatus(null);
        try {
            logger.debug("Settings: Fetching Stripe account status...");
            const response = await apiClient.get('/users/stripe/account-status');
            if (response.data.data && response.data.data.stripeAccountId) {
                setStripeStatus(response.data.data);
                logger.debug("Settings: Stripe status received:", response.data.data);
            } else {
                setStripeStatus(false); // Explicitly no account linked
                logger.debug("Settings: Stripe status check returned no account ID.");
            }
        } catch (err) {
            logger.error("Settings: Error fetching Stripe status:", err.response?.data || err.message);
            if (err.response?.status === 404 || err.response?.status === 400) {
                setStripeStatus(false); // Backend confirmed no account/error related to fetching non-existent
            } else {
                setStripeError('Failed to fetch Stripe payout status.');
                setStripeStatus(null);
            }
        } finally {
            setStripeLoading(false);
        }
    };

    // Fetch Stripe status when user loads (only if they are a tasker)
    useEffect(() => {
         fetchStripeStatus();
         // Dependency array includes user to refetch if the user object changes (e.g., after login)
    }, [user]);

    // --- Input Change Handlers ---
    const handlePersonalInfoChange = (e) => {
        const { name, value } = e.target;
        setPersonalInfo((prev) => ({ ...prev, [name]: value }));
        setError(''); setSuccess(''); // Clear feedback on change
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordInfo((prev) => ({ ...prev, [name]: value }));
        setPasswordError(''); setPasswordSuccess(''); // Clear feedback on change
    };

    // --- Stripe Action Handlers ---
    const handleStripeConnect = async () => {
        setStripeLoading(true); setStripeError('');
        try {
            logger.info("Settings: Calling create-account endpoint...");
            const response = await apiClient.post('/users/stripe/create-account');
            if (response.data.url) { window.location.href = response.data.url; } // Redirect
            else { setStripeError('Could not get onboarding link.'); setStripeLoading(false); }
        } catch (err) {
             logger.error("Stripe Connect initiation error:", err.response?.data || err.message);
             setStripeError(err.response?.data?.message || 'Failed to initiate Stripe connection.');
             setStripeLoading(false);
        }
    };

    const handleStripeUpdateLink = async () => {
        if (!stripeStatus || !stripeStatus.stripeAccountId) { setStripeError("Cannot get update link: Stripe Account ID missing."); return; }
        setStripeLoading(true); setStripeError('');
        try {
            logger.info("Settings: Calling create-account-link endpoint...");
            const response = await apiClient.get('/users/stripe/create-account-link');
            if (response.data.url) { window.location.href = response.data.url; } // Redirect
            else { setStripeError('Could not get update link.'); setStripeLoading(false); }
        } catch (err) {
             logger.error("Stripe Update Link error:", err.response?.data || err.message);
             setStripeError(err.response?.data?.message || 'Failed to get update link.');
             setStripeLoading(false);
        }
    };

    // --- Form Submission (Handles Personal Info + Password Save) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Clear all feedback messages
        setError(''); setSuccess(''); setPasswordError(''); setPasswordSuccess('');

        // Only proceed if the active tab is 'personal' for this button
        if (activeTab !== "personal") {
            logger.warn("Save Changes clicked while Withdraw tab was active. No action taken.");
            // Optionally show a message or switch tab, but better to disable button
            return;
        }

        setLoading(true);
        let profileUpdated = false;
        let passwordAttempted = false;
        let passwordUpdated = false;
        let encounteredError = false;

        // 1. --- Save Personal Info ---
        // Prepare address object for backend
        const addressPayload = {
            street: personalInfo.address, // Map form 'address' to 'street'
            city: personalInfo.city,
            state: personalInfo.state,
            postalCode: personalInfo.postalCode,
            country: personalInfo.country,
        };
        const personalPayload = {
            firstName: personalInfo.firstName,
            lastName: personalInfo.lastName,
            address: addressPayload
            // DO NOT SEND EMAIL - handle separately if needed
        };
        try {
            logger.info("Updating personal info...", personalPayload);
            await apiClient.patch('/users/updateMe', personalPayload);
            setSuccess("Personal information saved."); // Intermediate success
            profileUpdated = true;
            if (refreshUser) refreshUser(); // Update context immediately
        } catch (err) {
            logger.error("Error updating personal info:", err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to save personal info.');
            encounteredError = true; // Mark that an error occurred
        }

        // 2. --- Save Password (Only if new password field has input) ---
        if (passwordInfo.newPassword.trim()) { // Only attempt if new password is not empty
            passwordAttempted = true;
            if (!passwordInfo.currentPassword) {
                setPasswordError("Please enter current password to set a new one.");
                encounteredError = true;
            } else if (passwordInfo.newPassword.length < 8) {
                setPasswordError("New password must be at least 8 characters.");
                encounteredError = true;
            } else if (passwordInfo.newPassword !== passwordInfo.confirmNewPassword) {
                setPasswordError("New passwords do not match.");
                encounteredError = true;
            } else {
                // Proceed with password update API call
                try {
                    const passwordPayload = {
                        passwordCurrent: passwordInfo.currentPassword,
                        password: passwordInfo.newPassword,
                        passwordConfirm: passwordInfo.confirmNewPassword
                    };
                    logger.info("Updating password...");
                    await apiClient.patch('/users/updateMyPassword', passwordPayload);
                    setPasswordSuccess("Password updated successfully!");
                    setPasswordInfo({ currentPassword: "", newPassword: "", confirmNewPassword: "" }); // Clear fields
                    passwordUpdated = true;
                } catch (err) {
                    logger.error("Error updating password:", err.response?.data || err.message);
                    setPasswordError(err.response?.data?.message || 'Failed to update password.');
                    encounteredError = true;
                }
            }
        } else if (passwordInfo.currentPassword || passwordInfo.confirmNewPassword) {
             // User typed in current or confirm but not new password
             passwordAttempted = true; // It was attempted
             setPasswordError("Please enter the new password and confirm it if you wish to change it.");
             encounteredError = true;
        }


        // Final composite success message if no errors occurred anywhere
        if (!encounteredError && (profileUpdated || passwordUpdated)) {
             setSuccess("All changes saved successfully!");
        } else if (profileUpdated && !encounteredError) {
             setSuccess("Personal information saved."); // If only profile saved and no pw error
        }
        // Error messages are displayed individually

        setLoading(false);
    };


    // --- Render Stripe Section ---
    const renderStripeSection = () => {
        if (!user?.role?.includes('tasker')) return null;

        if (stripeLoading) return <p>Loading Payout Status...</p>;
        // Show error first if it exists
        if (stripeError) return <p className="error-message">{stripeError}</p>;

        if (stripeStatus === false) { // No account found
             return (
                 <>
                     <p>Connect a bank account via Stripe to receive payouts for completed gigs.</p>
                     <button type="button" onClick={handleStripeConnect} disabled={stripeLoading}>
                         {stripeLoading ? 'Connecting...' : 'Connect with Stripe'}
                     </button>
                 </>
             );
        }

        if (stripeStatus && stripeStatus.stripeAccountId) { // Account exists
            const isOnboardingComplete = stripeStatus.payoutsEnabled && stripeStatus.detailsSubmitted;
            return (
                 <div>
                     <p style={{marginBottom:'5px'}}>Stripe Account: <code style={{ fontSize: '0.85em', background:'#f0f0f0', padding:'2px 4px', borderRadius:'3px' }}>{stripeStatus.stripeAccountId}</code></p>
                     <p style={{marginBottom:'15px'}}>Status: {isOnboardingComplete
                         ? <span style={{ color: 'green', fontWeight: 'bold' }}>✓ Connected & Active</span>
                         : <span style={{ color: 'orange', fontWeight: 'bold' }}>! Action Required</span>}
                     </p>
                     {!isOnboardingComplete ? (
                         <>
                            <p>Your Stripe account setup is incomplete or needs updates to enable payouts.</p>
                            <button type="button" onClick={handleStripeUpdateLink} disabled={stripeLoading}>
                                {stripeLoading ? 'Getting Link...' : 'Complete/Update Onboarding'}
                            </button>
                         </>
                     ) : (
                         <p>Your account is ready to receive payouts.</p>
                     )}
                     <button type="button" onClick={fetchStripeStatus} disabled={stripeLoading} style={{ marginLeft: '10px', background: '#eee', color: '#333' }}>
                         {stripeLoading ? 'Refreshing...' : 'Refresh Status'}
                     </button>
                 </div>
             );
        }

        // Fallback if status is still null after initial load and no error
        return <p>Could not determine Stripe Payout status.</p>;
    };

    // --- Main Return ---
    return (
        <div className={`${styles.container} card`}> {/* Add card class */}
            {/* Tabs */}
            <div className={styles.tabs}>
                <div
                    className={activeTab === "personal" ? styles.activeTab : styles.inactiveTab}
                    onClick={() => setActiveTab("personal")} role="tab" tabIndex={0}
                    aria-selected={activeTab === "personal"}
                >
                    Personal Information
                </div>
                {/* Only show Withdraw tab for taskers */}
                 {user?.role?.includes('tasker') && (
                    <div
                        className={activeTab === "withdraw" ? styles.activeTab : styles.inactiveTab}
                        onClick={() => setActiveTab("withdraw")} role="tab" tabIndex={0}
                        aria-selected={activeTab === "withdraw"}
                    >
                        Withdraw Information
                    </div>
                 )}
            </div>

            {/* Use a single form tag - Submit button is specific to Personal tab */}
            <form className={styles.form} onSubmit={handleSubmit}>
                {activeTab === "personal" ? (
                    <div className={styles.tabContent}>
                        <h2>Personal Information</h2>
                         {error && <p className="error-message">{error}</p>}
                         {success && <p className="success-message">{success}</p>}

                        <h4 className={styles.subheading}>Basic Info</h4>
                         <div className={styles.row}>
                            <div className={styles.inputGroup}><label htmlFor="p-firstName">First Name</label><input id="p-firstName" name="firstName" value={personalInfo.firstName} onChange={handlePersonalInfoChange} /></div>
                            <div className={styles.inputGroup}><label htmlFor="p-lastName">Last Name</label><input id="p-lastName" name="lastName" value={personalInfo.lastName} onChange={handlePersonalInfoChange} /></div>
                         </div>
                         <div className={styles.inputGroup}><label htmlFor="p-email">Email Address</label><input id="p-email" name="email" value={personalInfo.email} readOnly disabled title="Email cannot be changed here"/></div>

                         <h4 className={styles.subheading}>Address</h4>
                         <div className={styles.inputGroup}><label htmlFor="p-address">Street Address</label><input id="p-address" name="address" value={personalInfo.address} onChange={handlePersonalInfoChange} /></div>
                         <div className={styles.row}>
                             <div className={styles.inputGroup}><label htmlFor="p-city">City</label><input id="p-city" name="city" value={personalInfo.city} onChange={handlePersonalInfoChange} /></div>
                             <div className={styles.inputGroup}><label htmlFor="p-state">State/Province</label><input id="p-state" name="state" value={personalInfo.state} onChange={handlePersonalInfoChange} /></div>
                         </div>
                          <div className={styles.row}>
                            <div className={styles.inputGroup}><label htmlFor="p-postalCode">Postal Code</label><input id="p-postalCode" name="postalCode" value={personalInfo.postalCode} onChange={handlePersonalInfoChange} /></div>
                            <div className={styles.inputGroup}><label htmlFor="p-country">Country</label><input id="p-country" name="country" value={personalInfo.country} onChange={handlePersonalInfoChange} /></div>
                          </div>

                         <h4 className={styles.subheading}>Change Password (Optional)</h4>
                         {passwordError && <p className="error-message">{passwordError}</p>}
                         {passwordSuccess && <p className="success-message">{passwordSuccess}</p>}
                          <div className={styles.row}>
                            <div className={styles.inputGroup}><label htmlFor="currentPassword">Current Password</label><input id="currentPassword" type="password" name="currentPassword" value={passwordInfo.currentPassword} onChange={handlePasswordChange} placeholder="Required to change"/></div>
                             <div className={styles.inputGroup}><label htmlFor="newPassword">New Password</label><input id="newPassword" type="password" name="newPassword" value={passwordInfo.newPassword} onChange={handlePasswordChange} placeholder="Min. 8 characters"/></div>
                         </div>
                         <div className={styles.inputGroup} style={{maxWidth: 'calc(50% - 5px)'}}>{/* Half width approx */}
                              <label htmlFor="confirmNewPassword">Confirm New Password</label>
                              <input id="confirmNewPassword" type="password" name="confirmNewPassword" value={passwordInfo.confirmNewPassword} onChange={handlePasswordChange} />
                          </div>

                        {/* Save button only for this tab */}
                         <button type="submit" className={styles.saveButton} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Personal Info'}
                         </button>
                    </div>
                ) : ( // Withdraw Tab Content
                    <div className={styles.tabContent}>
                        <h2>Withdraw Information</h2>
                        <div className={styles.stripeSection}>
                             <h4 className={styles.subheading}>Payout Method (via Stripe Connect)</h4>
                             {renderStripeSection()} {/* Renders Stripe status and buttons */}
                        </div>
                        {/* No save button needed here as actions are Stripe connect/update */}
                    </div>
                )}

            </form>
        </div>
    );
}

export default PersonalInfoForm;