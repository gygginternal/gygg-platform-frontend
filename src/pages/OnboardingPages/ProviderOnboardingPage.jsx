// src/pages/ProviderOnboardingPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OnboardingPages.module.css'; //
import ProgressHeader from '../../components/Shared/ProgressHeader';
import InputField from '../../components/Shared/InputField';
import AddressInput from '../../components/Shared/AddressInput';
// PersonalityForm and BioAndPictureForm are removed as their content/styling is now managed directly/inlined.
import { AutoComplete } from '../../components/Shared/AutoComplete';
import GigPostTimelineCategory from '../../components/ProviderOnboarding/GigPostTimelineCategory';
import GigPostDetailsBudget from '../../components/ProviderOnboarding/GigPostDetailsBudget';
import GigPostReview from '../../components/ProviderOnboarding/GigPostReview';

import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/axiosConfig';
import logger from '../../utils/logger';
import { CATEGORY_ENUM } from '../../constants/categories';
import { HOBBIES_OPTIONS, PERSONALITIES_OPTIONS } from '../../utils/constants';
import { useToast } from '../../contexts/ToastContext';

const TOTAL_PROVIDER_STEPS = 6; // Profile (3) + Gig Post (3)

const initialProviderFormData = {
  // Profile Info - Step 1
  firstName: '',
  lastName: '',
  address: { street: '', city: '', state: '', postalCode: '', country: '' },

  // Personality & Preferences - Step 2
  hobbies: [], // Provider's company/personal hobbies/interests
  peoplePreference: [], // What kind of taskers they prefer (array from AutoComplete)
  providerBioForMatching: '', // Added this to initial form data for step 2

  // Bio & Profile Picture - Step 3
  mainBio: '', // Main public bio for the provider
  profileImageFile: null,

  // First Gig Post - Steps 4, 5, 6
  gigTimeline: 'fixed',
  gigTitle: '',
  gigCategory: CATEGORY_ENUM[0] || '', // Default if categories exist
  gigPaymentType: 'fixed', // For budget step
  gigCost: '',
  gigRatePerHour: '',
  gigDescription: '',
  gigDuration: '',
  gigCity: '',
  gigState: '',
  isRemote: false,
  // Add other Gig fields as needed: isRemote, location (for gig), skillsRequired (from tasker)
};

function ProviderOnboardingPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialProviderFormData);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const fileInputRef = useRef(null); // Ref for hidden file input

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  // All useEffect hooks must be at the top
  useEffect(() => {
    if (user?.isProviderOnboardingComplete) {
      navigate('/feed', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      logger.debug('ProviderOnboarding: Populating formData from user:', user);
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        address: user.address
          ? { ...initialProviderFormData.address, ...user.address }
          : initialProviderFormData.address,
        hobbies: user.hobbies || [],
        peoplePreference: user.peoplePreference || [],
        mainBio: user.bio || '',
        providerBioForMatching: user.providerBioForMatching || '',
      }));
      if (user.profileImage && user.profileImage !== 'default.jpg') {
        setProfileImagePreview(user.profileImage);
      }
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  if (user?.isProviderOnboardingComplete) {
    return null;
  }

  // --- Input Handlers ---
  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };
  const handleAddressChange = newAddress => {
    setFormData(prev => ({ ...prev, address: newAddress }));
    setError('');
  };
  // The AutoComplete components handle their own change events, so these are just wrappers
  const handleHobbiesChange = newHobbies => {
    setFormData(prev => ({ ...prev, hobbies: newHobbies }));
    setError('');
  };
  const handlePeoplePreferenceChange = newPreferences => {
    setFormData(prev => ({ ...prev, peoplePreference: newPreferences }));
    setError('');
  };

  // Handler for image file input (similar to TaskerOnboardingPage)
  const handleProfileImageFileChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit example
        setError('Profile image must be less than 5MB.');
        return;
      }
      setFormData(prev => ({ ...prev, profileImageFile: file }));
      setProfileImagePreview(URL.createObjectURL(file)); // Show preview
      setError('');
    }
  };

  const handleUploadAreaClick = () => fileInputRef.current?.click();
  // Drag and drop handlers (basic)
  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile image must be less than 5MB.');
        return;
      }
      setFormData(prev => ({ ...prev, profileImageFile: file }));
      setProfileImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  // --- Navigation & Submission ---
  const handleStepNavigation = direction => {
    setError('');
    if (direction === 'back') {
      if (currentStep > 1) {
        setCurrentStep(s => s - 1);
      } else {
        navigate('/profile'); // Or previous page
      }
    } else {
      // 'next'
      // --- Step Validation ---
      let canProceed = true;
      if (currentStep === 1) {
        // Check basic info
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError('First name and last name are required.');
          canProceed = false;
        }
        // Check address fields
        else if (
          !formData.address.street.trim() ||
          !formData.address.city.trim() ||
          !formData.address.state.trim() ||
          !formData.address.postalCode.trim()
        ) {
          setError('All address fields are required.');
          canProceed = false;
        }
      } else if (
        currentStep === 2 &&
        (formData.hobbies.length === 0 ||
          formData.peoplePreference.length === 0)
      ) {
        setError('Please select your hobbies and people preferences.');
        canProceed = false;
      } else if (currentStep === 3 && !formData.mainBio.trim()) {
        setError('Your main bio is required.');
        canProceed = false;
      } else if (
        currentStep === 4 &&
        (!formData.gigTitle.trim() || !formData.gigCategory)
      ) {
        if (!formData.gigTitle.trim()) {
          setError('Gig title is required.');
        } else if (formData.gigTitle.trim().length < 5) {
          setError('Gig title must be at least 5 characters.');
        } else if (formData.gigTitle.trim().length > 100) {
          setError('Gig title cannot exceed 100 characters.');
        } else if (!formData.gigCategory) {
          setError('Gig category is required.');
        }
        canProceed = false;
      } else if (
        currentStep === 5 &&
        (!formData.gigDescription.trim() ||
          (formData.gigPaymentType === 'fixed' &&
            (!formData.gigCost || parseFloat(formData.gigCost) <= 0)) ||
          (formData.gigPaymentType === 'hourly' &&
            (!formData.gigRatePerHour ||
              parseFloat(formData.gigRatePerHour) <= 0 ||
              !formData.gigDuration ||
              parseFloat(formData.gigDuration) <= 0)))
      ) {
        if (!formData.gigDescription.trim()) {
          setError('Gig description is required.');
        } else if (formData.gigDescription.trim().length < 20) {
          setError('Gig description must be at least 20 characters.');
        } else if (formData.gigDescription.trim().length > 2000) {
          setError('Gig description cannot exceed 2000 characters.');
        } else if (
          formData.gigPaymentType === 'fixed' &&
          (!formData.gigCost || parseFloat(formData.gigCost) <= 0)
        ) {
          setError('Please enter a valid fixed cost.');
        } else if (
          formData.gigPaymentType === 'hourly' &&
          (!formData.gigRatePerHour || parseFloat(formData.gigRatePerHour) <= 0)
        ) {
          setError('Please enter a valid hourly rate.');
        }
        canProceed = false;
      }

      if (!canProceed) return;

      if (currentStep < TOTAL_PROVIDER_STEPS) {
        setCurrentStep(s => s + 1);
      } else {
        handleSubmitOnboardingAndGig();
      }
    }
  };

  const handleSkipGigPost = async () => {
    logger.info('Provider skipping initial gig post, saving profile only.');
    setLoading(true);
    setError('');
    const profilePayload = new FormData();
    profilePayload.append('firstName', formData.firstName);
    profilePayload.append('lastName', formData.lastName);
    if (formData.address)
      profilePayload.append('address', JSON.stringify(formData.address));
    (formData.hobbies || []).forEach(hobby =>
      profilePayload.append('hobbies[]', hobby)
    );
    (formData.peoplePreference || []).forEach(pref =>
      profilePayload.append('peoplePreference[]', pref)
    );
    profilePayload.append('bio', formData.mainBio);
    profilePayload.append(
      'providerBioForMatching',
      formData.providerBioForMatching
    ); // Save this bio as well

    if (formData.profileImageFile) {
      profilePayload.append(
        'profileImage',
        formData.profileImageFile,
        formData.profileImageFile.name
      );
    }

    profilePayload.append('isProviderOnboardingComplete', 'true');

    try {
      await apiClient.patch('/users/updateMe', profilePayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Provider profile setup complete!', { type: 'success' });
      if (refreshUser) await refreshUser();
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile setup.');
      logger.error(
        'Error skipping gig post and saving profile:',
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOnboardingAndGig = async () => {
    setLoading(true);
    setError('');

    // 1. Submit Profile Data
    const profilePayload = new FormData();
    profilePayload.append('firstName', formData.firstName);
    profilePayload.append('lastName', formData.lastName);
    if (formData.address)
      profilePayload.append('address', JSON.stringify(formData.address));
    (formData.hobbies || []).forEach(hobby =>
      profilePayload.append('hobbies[]', hobby)
    );
    (formData.peoplePreference || []).forEach(pref =>
      profilePayload.append('peoplePreference[]', pref)
    );
    profilePayload.append('bio', formData.mainBio);
    profilePayload.append(
      'providerBioForMatching',
      formData.providerBioForMatching
    ); // Save this bio as well

    if (formData.profileImageFile) {
      profilePayload.append(
        'profileImage',
        formData.profileImageFile,
        formData.profileImageFile.name
      );
    }
    profilePayload.append('isProviderOnboardingComplete', 'true');

    try {
      logger.info('Submitting provider profile data...');
      await apiClient.patch('/users/updateMe', profilePayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      logger.info('Provider profile data saved.');
      if (refreshUser) await refreshUser();

      // 2. Submit Gig Post Data
      const gigPayload = {
        title: formData.gigTitle.trim(),
        description: formData.gigDescription.trim(),
        category: formData.gigCategory,
        cost:
          formData.gigPaymentType === 'fixed'
            ? parseFloat(formData.gigCost)
            : undefined,
        ratePerHour:
          formData.gigPaymentType === 'hourly'
            ? parseFloat(formData.gigRatePerHour)
            : undefined,
        isHourly: formData.gigPaymentType === 'hourly',
        duration:
          formData.gigPaymentType === 'hourly'
            ? parseFloat(formData.gigDuration)
            : undefined,
        isRemote: Boolean(formData.isRemote),
      };

      // Add location if provided
      if (formData.gigCity || formData.gigState) {
        gigPayload.location = {};
        if (formData.gigCity) gigPayload.location.city = formData.gigCity.trim();
        if (formData.gigState) gigPayload.location.state = formData.gigState.trim();
      }

      Object.keys(gigPayload).forEach(
        key => gigPayload[key] === undefined && delete gigPayload[key]
      );

      logger.debug('Submitting first gig:', gigPayload);
      const gigResponse = await apiClient.post('/gigs', gigPayload);
      showToast('Profile setup complete and your first gig has been posted!', {
        type: 'success',
      });
      navigate('/feed');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save setup and post gig.'
      );
      logger.error(
        'Error during provider onboarding & gig post:',
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditGigStep = stepNumber => setCurrentStep(stepNumber);

  // --- Render Step Content ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Basic Info
        return (
          <>
            <h1 className={styles.title}>Tell us about yourself</h1>
            <p className={styles.subtitle}>
              That will help us better account setup for you.
            </p>
            <div className={styles.grid}>
              <InputField
                label="First name"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                labelColor="#ffffff"
                required
              />
              <InputField
                label="Last name"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                labelColor="#ffffff"
                required
              />
            </div>
            <AddressInput
              value={formData.address}
              onChange={handleAddressChange}
              required
            />
          </>
        );
      case 2: // Personality/Preferences
        return (
          <>
            <h1 className={styles.title}>Personality and Interests</h1>
            <p className={styles.subtitle}>
              That will help us better account setup for you.
            </p>
            <AutoComplete
              label="What are your hobbies?"
              options={HOBBIES_OPTIONS}
              values={formData.hobbies}
              onChange={handleHobbiesChange}
              placeholder="Add hobbies..."
            />
            <AutoComplete
              label="How would you describe yourself?"
              options={PERSONALITIES_OPTIONS}
              values={formData.peoplePreference}
              onChange={handlePeoplePreferenceChange}
              placeholder="e.g., Detail-oriented..."
            />
          </>
        );
      case 3: // Main Bio and Profile Picture (Inlined from TaskerOnboardingPage.js Step 5)
        return (
          <>
            <h1 className={styles.title}>Profile Picture and Bio</h1>
            <p className={styles.subtitle}>
              That will help us better account setup for you.
            </p>
            <InputField
              label="Tell us a little more about yourself? What do you enjoy most about helping others? (This will show on your profile bio on you page)"
              name="mainBio"
              type="textarea"
              value={formData.mainBio}
              onChange={handleInputChange}
              labelColor="#ffffff"
              rows={6}
            />
            <div className={styles.imageRow}>
              {' '}
              {/* Using imageRow from Tasker CSS */}
              <div
                className={styles.imagePreview}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile preview"
                    className={styles.previewImage}
                  />
                ) : (
                  <div className={styles.placeholder}>No image selected</div>
                )}
              </div>
              <div
                className={styles.imageUpload}
                onClick={handleUploadAreaClick}
                role="button"
                tabIndex={0}
                onKeyPress={e => {
                  if (e.key === 'Enter') handleUploadAreaClick();
                }}
              >
                <img
                  src="/assets/upload.svg"
                  alt="Upload"
                  className={styles.uploadIcon}
                  width={32}
                  height={32}
                />
                <p className={styles.uploadText}>
                  Drag and Drop Thumbnail or Browse
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfileImageFileChange}
                  accept="image/*"
                  className={styles.fileInput}
                />
              </div>
            </div>
          </>
        );
      case 4: // Gig Post: Timeline, Title, Category
        return (
          <>
            <h1 className={styles.title}>Create Your First Gig (Step 1/3)</h1>
            <p className={styles.subtitle}>
              Let&apos;s get your first service need posted!
            </p>
            <GigPostTimelineCategory
              formData={formData}
              onInputChange={handleInputChange}
            />
            <button
              type="button"
              onClick={handleSkipGigPost}
              className={styles.skipButton}
            >
              Skip & Finish Profile
            </button>
          </>
        );
      case 5: // Gig Post: Budget & Details
        return (
          <>
            <h1 className={styles.title}>Gig Details & Budget (Step 2/3)</h1>
            <p className={styles.subtitle}>
              Provide more information about your gig.
            </p>
            <GigPostDetailsBudget
              formData={formData}
              onInputChange={handleInputChange}
            />
            <button
              type="button"
              onClick={handleSkipGigPost}
              className={styles.skipButton}
            >
              Skip & Finish Profile
            </button>
          </>
        );
      case 6: // Gig Post: Review
        return (
          <>
            <h1 className={styles.title}>Review Your Gig Post (Step 3/3)</h1>
            <p className={styles.subtitle}>
              Make sure everything looks good before posting.
            </p>
            <GigPostReview gigData={formData} onEditStep={handleEditGigStep} />
            {/* The "Post Gig & Finish" is the 'Next' button on ProgressHeader for this last step */}
          </>
        );
      default:
        return <p>Invalid onboarding step.</p>;
    }
  };

  if (!user)
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  if (!user.role?.includes('provider')) {
    return (
      <div className={styles.container}>
        <p>This onboarding is for Providers only. Redirecting...</p>
      </div>
    );
  }

  let canGoNextForCurrentStep = true;
  if (currentStep === 1) {
    // Check basic info
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      canGoNextForCurrentStep = false;
    }
    // Check address fields
    else if (
      !formData.address.street.trim() ||
      !formData.address.city.trim() ||
      !formData.address.state.trim() ||
      !formData.address.postalCode.trim()
    ) {
      canGoNextForCurrentStep = false;
    }
  } else if (
    currentStep === 2 &&
    (formData.hobbies.length === 0 || formData.peoplePreference.length === 0)
  ) {
    canGoNextForCurrentStep = false;
  } else if (currentStep === 3 && !formData.mainBio.trim()) {
    canGoNextForCurrentStep = false;
  } else if (
    currentStep === 4 &&
    (!formData.gigTitle.trim() || !formData.gigCategory)
  ) {
    canGoNextForCurrentStep = false;
  } else if (
    currentStep === 5 &&
    (!formData.gigDescription.trim() ||
      (formData.gigPaymentType === 'fixed' &&
        (!formData.gigCost || parseFloat(formData.gigCost) <= 0)) ||
      (formData.gigPaymentType === 'hourly' &&
        (!formData.gigRatePerHour ||
          parseFloat(formData.gigRatePerHour) <= 0 ||
          !formData.gigDuration ||
          parseFloat(formData.gigDuration) <= 0)))
  ) {
    canGoNextForCurrentStep = false;
  }

  return (
    <div className={styles.fullWidthWrapper}>
      <div className={styles.container}>
        <ProgressHeader
          step={currentStep}
          totalSteps={TOTAL_PROVIDER_STEPS}
          onNavigate={handleStepNavigation}
          canGoNext={loading ? false : canGoNextForCurrentStep}
          canGoBack={currentStep > 1}
        />
        <main className={styles.formContainer}>
          <div className={styles.form}>
            {' '}
            {/* Using .form from Tasker CSS */}
            {error && <p className={styles.errorMessage}>{error}</p>}
            {renderStepContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProviderOnboardingPage;
