// src/pages/ProviderOnboardingPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Link might not be needed if logo is in header
import styles from './ProviderOnboardingPage.module.css';
import ProgressHeader from '../components/Onboarding/ProgressHeader'; // This is YOUR ProgressHeader
import InputField from '../components/Shared/InputField';
import PersonalityForm from '../components/Onboarding/PersonalityForm'; // Ensure this exists and is correct
import BioAndPictureForm from '../components/Onboarding/BioAndPictureForm'; // Ensure this exists
import GigPostTimelineCategory from '../components/Onboarding/GigPostTimelineCategory';
import GigPostDetailsBudget from '../components/Onboarding/GigPostDetailsBudget';
import GigPostReview from '../components/Onboarding/GigPostReview';
import { AutoComplete } from "../components/AutoComplete";// Assuming you use this for hobbies/prefs

import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig';
import logger from '../utils/logger';
import { CATEGORY_ENUM, HOBBIES_OPTIONS, PERSONALITIES_OPTIONS } from '../utils/constants';

const TOTAL_PROVIDER_STEPS = 6; // Profile (3) + Gig Post (3)

const initialProviderFormData = {
    // Profile Info - Step 1
    firstName: "",
    lastName: "",
    address: { street: "", city: "", state: "", postalCode: "", country: "" },
    dateOfBirth: "", // Added DOB

    // Personality & Preferences - Step 2
    hobbies: [], // Provider's company/personal hobbies/interests
    peoplePreference: [], // What kind of taskers they prefer (array from AutoComplete)
    // providerBioForMatching: "", // Or use a more generic "Company/Self Description"

    // Bio & Profile Picture - Step 3
    mainBio: "", // Main public bio for the provider
    profileImageFile: null,

    // First Gig Post - Steps 4, 5, 6
    gigTimeline: "fixed",
    gigTitle: "",
    gigCategory: CATEGORY_ENUM[0] || "", // Default if categories exist
    gigPaymentType: "fixed", // For budget step
    gigCost: "",
    gigRatePerHour: "",
    gigDescription: "",
    // Add other Gig fields as needed: isRemote, location (for gig), skillsRequired (from tasker)
};

function ProviderOnboardingPage() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialProviderFormData);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Populate form with existing user data
    useEffect(() => {
        if (user) {
            logger.debug("ProviderOnboarding: Populating formData from user:", user);
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                address: user.address ? { ...initialProviderFormData.address, ...user.address } : initialProviderFormData.address,
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                hobbies: user.hobbies || [],
                peoplePreference: user.peoplePreference || [],
                mainBio: user.bio || '',
                // Don't populate gig fields from user profile
            }));
            if (user.profileImage && user.profileImage !== 'default.jpg') {
                setProfileImagePreview(user.profileImage);
            }
        }
    }, [user]);


    // --- Input Handlers ---
    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value })); setError('');
    };
    const handleAddressChange = (fieldName, value) => {
        setFormData(prev => ({ ...prev, address: { ...prev.address, [fieldName]: value } })); setError('');
    };
    const handleHobbiesChange = (newHobbies) => { setFormData(prev => ({ ...prev, hobbies: newHobbies })); };
    const handlePeoplePreferenceChange = (newPreferences) => { setFormData(prev => ({ ...prev, peoplePreference: newPreferences })); };
    const handleProfileImageChange = (file) => { setFormData(prev => ({ ...prev, profileImageFile: file })); };

    // For direct event.target changes (e.g., basic inputs not wrapped by custom onChange)
    const handleDirectEventChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    // --- Navigation & Submission ---
    const handleStepNavigation = (direction) => {
        setError('');
        if (direction === 'back') {
            if (currentStep > 1) {
                 setCurrentStep(s => s - 1);
                 // Your ProgressHeader example had router.push for back,
                 // but local step management is usually preferred for multi-step forms.
                 // If you want URL to change per step: navigate(`/onboarding/provider/step${currentStep - 1}`);
            } else {
                 navigate('/dashboard'); // Or previous page
            }
        } else { // 'next'
            // --- Step Validation (ensure this is complete) ---
            let canProceed = true;
            if (currentStep === 1 && (!formData.firstName.trim() || !formData.lastName.trim() || !formData.address.postalCode.trim() || !formData.dateOfBirth)) {
                 setError("First name, last name, postal code, and date of birth are required."); canProceed = false;
            } else if (currentStep === 2 && (formData.hobbies.length === 0 || formData.peoplePreference.length === 0)) {
                 setError("Please describe your interests and ideal Tasker preferences."); canProceed = false;
            } else if (currentStep === 3 && !formData.mainBio.trim()) {
                 setError("Your main bio is required."); canProceed = false;
            } else if (currentStep === 4 && (!formData.gigTitle.trim() || !formData.gigCategory)) {
                 setError("Gig title and category are required."); canProceed = false;
            } else if (currentStep === 5 && (!formData.gigDescription.trim() ||
                (formData.gigPaymentType === 'fixed' && (!formData.gigCost || parseFloat(formData.gigCost) <= 0)) ||
                (formData.gigPaymentType === 'hourly' && (!formData.gigRatePerHour || parseFloat(formData.gigRatePerHour) <= 0)))) {
                 setError("Gig description and valid budget details are required."); canProceed = false;
            }
            // No specific validation for step 6 (review) as it's a display step before submit

            if (!canProceed) return;

            if (currentStep < TOTAL_PROVIDER_STEPS) {
                setCurrentStep(s => s + 1);
                // If you want URL to change per step: navigate(`/onboarding/provider/step${currentStep + 1}`);
            } else { // On last step (Gig Review), "Next" button in ProgressHeader triggers this
                handleSubmitOnboardingAndGig();
            }
        }
    };

    const handleSkipGigPost = async () => {
        logger.info("Provider skipping initial gig post, saving profile only.");
        setLoading(true); setError('');
        const profilePayload = new FormData();
        profilePayload.append('firstName', formData.firstName);
        profilePayload.append('lastName', formData.lastName);
        profilePayload.append('dateOfBirth', formData.dateOfBirth);
        if (formData.address) profilePayload.append('address', JSON.stringify(formData.address));
        (formData.hobbies || []).forEach(hobby => profilePayload.append('hobbies[]', hobby));
        (formData.peoplePreference || []).forEach(pref => profilePayload.append('peoplePreference[]', pref));
        profilePayload.append('bio', formData.mainBio);
        if (formData.profileImageFile) {
            profilePayload.append('profileImage', formData.profileImageFile, formData.profileImageFile.name); // Corrected
        }
        if (formData.profileImageFile) {
        profilePayload.append('profileImage', formData.profileImageFile, formData.profileImageFile.name); // Use profilePayload
        }

        profilePayload.append('isProviderOnboardingComplete', 'true');


        try {
            await apiClient.patch('/users/updateMe', profilePayload, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert("Provider profile setup complete!");
            if (refreshUser) await refreshUser();
            navigate('/feed');
        } catch (err) { setError(err.response?.data?.message || 'Failed to save profile setup.'); }
        finally { setLoading(false); }
    };

    const handleSubmitOnboardingAndGig = async () => {
        setLoading(true); setError('');

        // 1. Submit Profile Data
        const profilePayload = new FormData();
        profilePayload.append('firstName', formData.firstName);
        profilePayload.append('lastName', formData.lastName);
        profilePayload.append('dateOfBirth', formData.dateOfBirth);
        if (formData.address) profilePayload.append('address', JSON.stringify(formData.address));
        (formData.hobbies || []).forEach(hobby => profilePayload.append('hobbies[]', hobby));
        (formData.peoplePreference || []).forEach(pref => profilePayload.append('peoplePreference[]', pref));
        profilePayload.append('bio', formData.mainBio);
        if (formData.profileImageFile) profilePayload.append('profileImage', formData.profileImageFile);
        profilePayload.append('isProviderOnboardingComplete', 'true');

        try {
            logger.info("Submitting provider profile data...");
            await apiClient.patch('/users/updateMe', profilePayload, { headers: { 'Content-Type': 'multipart/form-data' } });
            logger.info("Provider profile data saved.");
            if (refreshUser) await refreshUser();

            // 2. Submit Gig Post Data
            const gigPayload = {
                title: formData.gigTitle.trim(),
                description: formData.gigDescription.trim(),
                category: formData.gigCategory,
                // timeline: formData.gigTimeline, // Backend may infer from cost/rate
                cost: formData.gigPaymentType === 'fixed' ? parseFloat(formData.gigCost) : undefined,
                ratePerHour: formData.gigPaymentType === 'hourly' ? parseFloat(formData.gigRatePerHour) : undefined,
                // Add other gig fields from formData: location, isRemote, skillsRequired etc.
            };
            Object.keys(gigPayload).forEach(key => gigPayload[key] === undefined && delete gigPayload[key]);

            logger.debug("Submitting first gig:", gigPayload);
            const gigResponse = await apiClient.post('/gigs', gigPayload);
            alert("Profile setup complete and your first gig has been posted!");
            navigate(`/gigs/${gigResponse.data.data.gig._id}`);

        } catch (err) { setError(err.response?.data?.message || 'Failed to save setup and post gig.'); logger.error("Error during provider onboarding & gig post:", err); }
        finally { setLoading(false); }
    };

    const handleEditGigStep = (stepNumber) => setCurrentStep(stepNumber);

    // --- Render Step Content ---
    const renderStepContent = () => {
        switch (currentStep) {
            case 1: // Basic Info
                return (
                    <>
                        {/* Use styles.title, styles.formGrid, etc. */}
                        <h1 className={styles.title}>Provider Profile (1/{TOTAL_PROVIDER_STEPS})</h1>
                        <p className={styles.subtitle}>Let's start with your basic information.</p>
                        <div className={styles.grid}> {/* Example usage of styles */}
                            <InputField label="First name*" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                            <InputField label="Last name*" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                        </div>
                        <InputField label="Date of Birth*" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required />
                        <h3 className={styles.subTitle}>Your Address</h3> {/* Example */}
                        <InputField label="Street Address" name="street" value={formData.address.street} onChange={(name,val)=>handleAddressChange("street",val)} />
                        <div className={styles.grid}>
                            <InputField label="City" name="city" value={formData.address.city} onChange={(name,val)=>handleAddressChange("city",val)} />
                            <InputField label="Province/State" name="state" value={formData.address.state} onChange={(name,val)=>handleAddressChange("state",val)} />
                        </div>
                        <div className={styles.grid}>
                            <InputField label="Postal code*" name="postalCode" value={formData.address.postalCode} onChange={(name,val)=>handleAddressChange("postalCode",val)} required />
                            <InputField label="Country" name="country" value={formData.address.country} onChange={(name,val)=>handleAddressChange("country",val)} />
                        </div>
                    </>
                );
            case 2: // Personality/Preferences
                return (
                    <>
                        <h1 className={styles.title}>Interests & Tasker Preferences (2/{TOTAL_PROVIDER_STEPS})</h1>
                        <p className={styles.subtitle}>Tell us more about you and what you're looking for.</p>
                        {/* Assuming PersonalityForm is structured to take individual props and use InputField/AutoComplete internally */}
                        {/* OR pass formData directly if PersonalityForm handles its own sub-fields */}
                        <div className={styles.inputField}>
                            <AutoComplete // Example for Hobbies
                                label="Your Hobbies/Company Interests"
                                options={HOBBIES_OPTIONS}
                                values={formData.hobbies}
                                onChange={(newHobbies) => handleInputChange('hobbies', newHobbies)}
                                placeholder="Add hobbies..."
                            />
                        </div>
                        <div className={styles.inputField}>
                             <AutoComplete // Example for People Preferences
                                label="What kind of Taskers do you prefer?"
                                options={PERSONALITIES_OPTIONS} // Assuming you have this in constants
                                values={formData.peoplePreference}
                                onChange={(newPrefs) => handleInputChange('peoplePreference', newPrefs)}
                                placeholder="e.g., Detail-oriented..."
                            />
                        </div>
                        {/* If providerBioForMatching is a simple textarea: */}
                        <InputField
                            label="Briefly describe your company or project needs"
                            name="providerBioForMatching"
                            type="textarea"
                            value={formData.providerBioForMatching}
                            onChange={handleInputChange}
                            rows={4}
                        />
                    </>
                );
            case 3: // Main Bio and Profile Picture
                return (
                    <>
                        <h1 className={styles.title}>Your Public Profile (3/{TOTAL_PROVIDER_STEPS})</h1>
                        <BioAndPictureForm
                            bio={formData.mainBio}
                            onBioChange={(name, value) => handleInputChange('mainBio', value)} // Ensure BioAndPictureForm calls onChange with ('mainBio', value) or just (value)
                            profileImageFile={formData.profileImageFile}
                            onProfileImageChange={handleProfileImageChange}
                            currentImageUrl={profileImagePreview || user?.profileImage}
                        />
                    </>
                );
            case 4: // Gig Post: Timeline, Title, Category
                return (
                    <>
                        <h1 className={styles.title}>Create Your First Gig (Step 1/3)</h1>
                        <p className={styles.subtitle}>Let's get your first service need posted!</p>
                        <GigPostTimelineCategory formData={formData} onInputChange={handleInputChange} />
                        <button type="button" onClick={handleSkipGigPost} className={styles.skipButton}>Skip & Finish Profile</button>
                    </>
                );
            case 5: // Gig Post: Budget & Details
                return (
                    <>
                        <h1 className={styles.title}>Gig Details & Budget (Step 2/3)</h1>
                        <p className={styles.subtitle}>Provide more information about your gig.</p>
                        <GigPostDetailsBudget formData={formData} onInputChange={handleInputChange} />
                        <button type="button" onClick={handleSkipGigPost} className={styles.skipButton}>Skip & Finish Profile</button>
                    </>
                );
            case 6: // Gig Post: Review
                return (
                    <>
                        <h1 className={styles.title}>Review Your Gig Post (Step 3/3)</h1>
                        <p className={styles.subtitle}>Make sure everything looks good before posting.</p>
                        <GigPostReview gigData={formData} onEditStep={handleEditGigStep} />
                        {/* The "Post Gig & Finish" is the 'Next' button on ProgressHeader for this last step */}
                    </>
                );
            default: return <p>Invalid onboarding step.</p>;
        }
    };

    if (!user) return <div className={styles.pageContainer}><p>Loading...</p></div>;
    if (!user.role?.includes('provider')) {
        // navigate('/dashboard'); // Or appropriate non-provider page
        return <div className={styles.pageContainer}><p>This onboarding is for Providers only. Redirecting...</p></div>;
    }

    let canGoNextForCurrentStep = true;
    if (currentStep === 1 && (!formData.firstName.trim() || !formData.lastName.trim() || !formData.address.postalCode.trim() || !formData.dateOfBirth)) {
        canGoNextForCurrentStep = false;
    } else if (currentStep === 2 && (formData.hobbies.length === 0 || formData.peoplePreference.length === 0)) {
        canGoNextForCurrentStep = false;
    } else if (currentStep === 3 && !formData.mainBio.trim()) {
        canGoNextForCurrentStep = false;
    } else if (currentStep === 4 && (!formData.gigTitle.trim() || !formData.gigCategory)) {
        canGoNextForCurrentStep = false;
    } else if (currentStep === 5 && (!formData.gigDescription.trim() ||
        (formData.gigPaymentType === 'fixed' && (!formData.gigCost || parseFloat(formData.gigCost) <= 0)) ||
        (formData.gigPaymentType === 'hourly' && (!formData.gigRatePerHour || parseFloat(formData.gigRatePerHour) <= 0)))) {
        canGoNextForCurrentStep = false;
    }

    return (
        <div className={styles.container}> {/* Use .container from your profilesetupX.module.css */}
            {/*
              Your ProgressHeader has its own logo element positioned absolutely.
              So, the .logoTop div is not strictly needed here unless ProgressHeader is nested differently.
              If ProgressHeader is meant to be at the very top, it will handle its own logo.
            */}
            {/* <div className={styles.logoTop}><Link to="/"><img src="/gygg-logo.svg" alt="GYGG Logo" width={120}/></Link></div> */}

            <ProgressHeader
                step={currentStep}
                totalSteps={TOTAL_PROVIDER_STEPS}
                onNavigate={handleStepNavigation}
                canGoNext={loading ? false : canGoNextForCurrentStep}
                canGoBack={currentStep > 1} // Pass canGoBack explicitly
                // The title "Profile set up" is inside your ProgressHeader's JSX
            />
            <main className={styles.formContainer}> {/* .formContainer from your profilesetupX.module.css */}
                <div className={styles.form}> {/* .form from your profilesetupX.module.css */}
                    {error && <p className="error-message" style={{textAlign: 'center', marginBottom: '1rem'}}>{error}</p>}
                    {renderStepContent()}
                </div>
            </main>
            {/* --- NavigationButtons component is NOT USED HERE because ProgressHeader handles it --- */}
        </div>
    );
}

export default ProviderOnboardingPage;