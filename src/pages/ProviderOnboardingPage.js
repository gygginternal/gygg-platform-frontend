// src/pages/ProviderOnboardingPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProviderOnboardingPage.module.css"; // Create this
import ProgressBar from "../components/Onboarding/ProgressBar2"; // Adapted ProgressBar
import FormInput from "../components/Onboarding/FormInput"; // Adapted FormInput
import NavigationButtons from "../components/Onboarding/NavigationButtons";
import PersonalityForm from "../components/Onboarding/PersonalityForm";
import BioAndPictureForm from "../components/Onboarding/BioAndPictureForm";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/axiosConfig";
import logger from "../utils/logger";

// Define your provider onboarding steps
const TOTAL_PROVIDER_STEPS = 3; // Example: 1. Basic Info, 2. Preferences, 3. Bio/Pic

const initialProviderFormData = {
  // Step 1
  firstName: "",
  lastName: "",
  // Removed age as it's sensitive and often not needed. Add if critical.
  // For address, use object to match backend User model
  address: {
    street: "", // No postal code in your example, adding street instead for full address
    city: "",
    state: "", // Or Province
    postalCode: "", // from your example form
    country: "",
  },
  // Step 2
  peoplePreference: [],
  hobbies: [],
  providerBioForMatching: "", // Separate from main bio if desired
  // Step 3
  mainBio: "",
  profileImageFile: null,
};

function ProviderOnboardingPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialProviderFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate with existing user data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        hobbies: user.hobbies || [],
        address: user.address
          ? { ...initialProviderFormData.address, ...user.address }
          : initialProviderFormData.address,
        peoplePreference: user.peoplePreference || "",
        // If providerBioForMatching is separate from mainBio
        providerBioForMatching: user.bio || "", // Default to main bio
        mainBio: user.bio || "",
      }));
    }
  }, [user]);

  // Generic InputField handler (expects name, value from child)
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };
  // Handler for nested address fields
  const handleAddressChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [fieldName]: value },
    }));
    setError("");
  };

  const handleNavigation = (direction) => {
    setError("");
    if (direction === "back") {
      if (currentStep > 1) setCurrentStep((s) => s - 1);
      else navigate("/dashboard"); // Or previous page
    } else {
      // 'next'
      // Step-specific validation
      if (
        currentStep === 1 &&
        (!formData.firstName.trim() ||
          !formData.lastName.trim() ||
          !formData.address.postalCode.trim())
      ) {
        setError(
          "First name, last name, and postal code are required for step 1."
        );
        return;
      }
      // Add more validations for other steps if needed

      if (currentStep < TOTAL_PROVIDER_STEPS) {
        setCurrentStep((s) => s + 1);
      } else {
        handleSubmitOnboarding();
      }
    }
  };

  const handleSubmitOnboarding = async () => {
    setLoading(true);
    setError("");
    const payload = new FormData(); // For potential file upload

    payload.append("firstName", formData.firstName);
    payload.append("lastName", formData.lastName);
    // Address object
    if (formData.address) {
      Object.keys(formData.address).forEach((key) => {
        if (formData.address[key]) {
          // Only append if value exists
          payload.append(`address[${key}]`, formData.address[key]);
        }
      });
    }
    payload.append("peoplePreference", formData.peoplePreference);
    // Hobbies
    (formData.hobbies || []).forEach((hobby) =>
      payload.append("hobbies[]", hobby)
    );
    payload.append("bio", formData.mainBio || formData.providerBioForMatching); // Use one or combine

    if (formData.profileImageFile) {
      payload.append(
        "profileImage",
        formData.profileImageFile,
        formData.profileImageFile.name
      );
    }

    // Add a flag indicating provider onboarding is complete
    // This assumes backend updateMe can set this specific flag
    payload.append("isProviderOnboardingComplete", "true"); // Send as string, backend converts

    logger.debug(
      "Submitting Provider onboarding data:",
      Object.fromEntries(payload.entries())
    );
    try {
      await apiClient.patch("/users/updateMe", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Provider profile setup complete!");
      if (refreshUser) await refreshUser(); // Update user context
      // Redirect to a page to create first gig OR dashboard
      navigate("/gigs/create/options"); // Navigate to the "Create Gig Options" page
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile setup.");
    } finally {
      setLoading(false);
    }
  };

  // --- Render current step content ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Basic Info (profilesetup1)
        return (
          <>
            <h1 className={styles.formTitle}>
              Tell us about yourself (Provider)
            </h1>
            <p className={styles.formDescription}>
              This information helps Taskers understand who they might be
              working for.
            </p>
            <div className={styles.formGrid}>
              <FormInput
                label="First name*"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              <FormInput
                label="Last name*"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            {/* Address section for Provider */}
            <h3 className={styles.subTitle}>Your Location</h3>
            {/* No street in your example, assuming postal is main for broad location */}
            <FormInput
              label="Postal code*"
              name="postalCode"
              value={formData.address.postalCode}
              onChange={(name, val) => handleAddressChange(name, val)}
              required
              placeholder="e.g., A1B 2C3"
            />
            <FormInput
              label="City (Optional)"
              name="city"
              value={formData.address.city}
              onChange={(name, val) => handleAddressChange(name, val)}
              placeholder="e.g., Toronto"
            />
            <FormInput
              label="Province/State (Optional)"
              name="state"
              value={formData.address.state}
              onChange={(name, val) => handleAddressChange(name, val)}
              placeholder="e.g., Ontario"
            />
            <FormInput
              label="Country (Optional)"
              name="country"
              value={formData.address.country}
              onChange={(name, val) => handleAddressChange(name, val)}
              placeholder="e.g., Canada"
            />
          </>
        );
      case 2: // Personality/Preferences (profilesetup2)
        return (
          <>
            <h1 className={styles.formTitle}>Your Preferences</h1>
            <p className={styles.formDescription}>
              What kind of Taskers are you looking for?
            </p>
            <PersonalityForm
              peoplePreference={formData.peoplePreference}
              onPreferenceChange={(value) => {
                handleInputChange("peoplePreference", value);
              }} // Pass correct handler
              hobbies={formData.hobbies}
              onHobbiesChange={(value) => {
                handleInputChange("hobbies", value);
              }}
              bio={formData.providerBioForMatching} // Can be used for a "company bio" or "typical project needs"
              onBioChange={(name, value) => handleInputChange(name, value)}
            />
          </>
        );
      case 3: // Bio and Profile Picture (profilesetup3)
        return (
          <>
            <h1 className={styles.formTitle}>Profile Picture and Bio</h1>
            <p className={styles.formDescription}>
              Make your profile stand out.
            </p>
            <BioAndPictureForm
              bio={formData.mainBio}
              onBioChange={(name, value) => handleInputChange(name, value)} // Pass correct handler
              profileImageFile={formData.profileImageFile}
              onProfileImageChange={(file) =>
                setFormData((prev) => ({ ...prev, profileImageFile: file }))
              }
              currentImageUrl={user?.profileImage} // Pass existing image URL for preview
            />
          </>
        );
      default:
        return <p>Invalid onboarding step.</p>;
    }
  };

  if (!user) return <p>Loading...</p>; // Or redirect if not logged in
  if (!user.role?.includes("provider")) {
    // navigate('/dashboard'); // Or appropriate page
    return <p>This onboarding is for Providers. Redirecting...</p>;
  }

  return (
    <div className={styles.pageContainer}>
      {" "}
      {/* Use a wrapper to apply background */}
      <div className={styles.onboardingContentWrapper}>
        {" "}
        {/* For centering and max-width */}
        <div className={styles.logoTop}>
          <img src="/gygg-logo.svg" alt="GYGG Logo" width={120} />
        </div>
        <ProgressBar
          current={currentStep}
          total={TOTAL_PROVIDER_STEPS}
          label="Provider Profile Setup"
        />
        <main className={styles.formSection}>
          {" "}
          {/* Use styles from profilesetup1 */}
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            {error && <p className="error-message">{error}</p>}
            {renderStepContent()}
          </form>
        </main>
        <NavigationButtons
          onBack={() => handleNavigation("back")}
          onNext={() => handleNavigation("next")}
          isFirstStep={currentStep === 1}
          isLastStep={currentStep === TOTAL_PROVIDER_STEPS}
          // Add canGoNext logic based on current step's validation
          canGoNext={
            (currentStep === 1 &&
              formData.firstName &&
              formData.lastName &&
              formData.address.postalCode) ||
            currentStep > 1 // Basic: allow next if not first step and not last, refine validation
          }
        />
      </div>
    </div>
  );
}

export default ProviderOnboardingPage;
