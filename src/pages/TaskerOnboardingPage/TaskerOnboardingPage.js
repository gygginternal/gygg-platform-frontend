// src/pages/TaskerOnboardingPage/TaskerOnboardingPage.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../OnboardingPages/OnboardingPages.module.css'; // Create this CSS for overall page
import ProgressHeader from '../../components/Shared/ProgressHeader';
import InputField from '../../components/Shared/InputField';
import { AutoComplete } from '../../components/Shared/AutoComplete';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/axiosConfig';
import logger from '../../utils/logger';
import {
  HOBBIES_OPTIONS,
  PERSONALITIES_OPTIONS,
  SKILL_OPTIONS,
} from '../../utils/constants';
import { useToast } from '../../contexts/ToastContext';
// Import FaUpload if using react-icons
// import { FaUpload } from 'react-icons/fa';

const TOTAL_STEPS = 5;

// Define structure for form data across steps
const initialFormData = {
  // Step 1
  firstName: '',
  lastName: '',
  // Step 2 (This will be skills selected from TaskSelector)
  skills: [], // Store selected skills/tasks as an array of strings
  // Step 3
  hobbies: [], // Will be from searchable dropdown
  // personality
  peoplePreference: [],
  // Step 4
  ratePerHour: 0, // Or string '20-25' and parse later
  availability: {
    // For the complex availability object
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  },
  // Step 5
  bioStep5: '', // If there's a bio field specific to step 5 different from selfDescription
  profileImageFile: null, // Store the File object for upload
};

function TaskerOnboardingPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [error, setError] = useState('');
  const showToast = useToast();

  // Populate with existing user data if available (e.g., if they partially completed)
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        skills: user.skills || [], // Assuming 'skills' is the field for TaskSelector
        hobbies: user.hobbies || [],
        peoplePreference: user.peoplePreference || [],
        ratePerHour: user.ratePerHour || 0,
        availability: user.availability
          ? { ...initialFormData.availability, ...user.availability }
          : initialFormData.availability,
        // Bio for step 5 - if it's the same as selfDescription, merge them
        bioStep5: user.bio || '', // Or a different field if needed
      }));
      if (user.profileImage && user.profileImage !== 'default.jpg') {
        setProfileImagePreview(user.profileImage); // Show existing S3 URL
      }
    }
  }, [user]);

  // Generic InputField handler (name, value)
  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error on change
  };
  // Specific handler for direct event if InputField sends 'e'
  const handleDirectEventChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };
  const handleHobbiesChange = newHobbies => {
    setFormData(prev => ({ ...prev, hobbies: newHobbies }));
  };
  const handleSkillsChange = newSkills => {
    // For TaskSelector
    setFormData(prev => ({ ...prev, skills: newSkills }));
  };
  const handleAvailabilityChange = (day, checked) => {
    setFormData(prev => ({
      ...prev,
      availability: { ...prev.availability, [day]: checked },
    }));
  };

  const handleNavigation = direction => {
    setError(''); // Clear errors on navigation
    if (direction === 'back') {
      if (currentStep > 1) setCurrentStep(s => s - 1);
      else navigate('/profile'); // Or wherever they came from
    } else {
      // 'next'
      // Add validation per step if needed before proceeding
      if (currentStep === 1 && (!formData.firstName || !formData.lastName)) {
        setError('First and last name are required.');
        return;
      }
      // Add more step-specific validations...

      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(s => s + 1);
      } else {
        // Final step: Submit data
        handleSubmitOnboarding();
      }
    }
  };

  // --- Step 5 Image Upload Logic ---
  const handleImageFileChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit example
        setError('Profile image must be less than 5MB.');
        return;
      }
      setFormData(prev => ({ ...prev, profileImageFile: file }));
      setProfileImagePreview(URL.createObjectURL(file)); // Show preview
    }
  };
  useEffect(() => {
    return () => {
      if (profileImagePreview && profileImagePreview.startsWith('blob:'))
        URL.revokeObjectURL(profileImagePreview);
    };
  }, [profileImagePreview]); // Cleanup blob URL

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
      setFormData(prev => ({ ...prev, profileImageFile: file }));
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };
  // --- End Step 5 Image Logic ---

  // --- Final Submit ---
  const handleSubmitOnboarding = async () => {
    setError('');
    // Consolidate all data from formData into payload for PATCH /users/updateMe
    const payload = new FormData(); // Use FormData for file upload

    // Append text fields
    payload.append('firstName', formData.firstName);
    payload.append('lastName', formData.lastName);
    // Skills
    (formData.skills || []).forEach(hobby => payload.append('skills[]', hobby));
    // Hobbies
    (formData.hobbies || []).forEach(hobby =>
      payload.append('hobbies[]', hobby)
    );
    // Bio from step 5 (or selfDescription from step 3, decide which to use or combine)
    payload.append('bio', formData.bioStep5 || formData.selfDescription);
    payload.append('peoplePreference', formData.peoplePreference);
    if (formData.ratePerHour)
      payload.append('ratePerHour', formData.ratePerHour.toString());

    // Append availability object (Express needs qs or similar to parse nested objects from FormData, or send as JSON string)
    // Simplest for now: send as JSON string if backend expects object
    if (formData.availability)
      payload.append('availability', JSON.stringify(formData.availability));

    // Append profile image file if selected
    if (formData.profileImageFile) {
      payload.append(
        'profileImage',
        formData.profileImageFile,
        formData.profileImageFile.name
      );
    }

    logger.debug(
      'Submitting onboarding data:',
      Object.fromEntries(payload.entries())
    ); // Log FormData content

    try {
      // Call the backend to update the user profile
      await apiClient.patch('/users/updateMe', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }, // Important for file uploads
      });
      logger.info(
        'Tasker onboarding data submitted successfully for user:',
        user?._id
      );
      showToast('Profile setup complete!', { type: 'success' });
      if (refreshUser) await refreshUser(); // Refresh user data in context
      navigate('/profile'); // Or to social feed/profile page
    } catch (err) {
      logger.error(
        'Error submitting onboarding data:',
        err.response?.data || err.message,
        { userId: user?._id }
      );
      showToast(
        err.response?.data?.message || 'Failed to save profile setup.',
        { type: 'error' }
      );
      setError(err.response?.data?.message || 'Failed to save profile setup.');
    }
  };

  // --- Render current step ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Tell us about yourself (Name)
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
                onChange={(name, val) => handleInputChange(name, val)}
                required
              />
              <InputField
                label="Last name"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={(name, val) => handleInputChange(name, val)}
                required
              />
            </div>
            {/* TaskSelector might be better in step 2 if it's about general categories */}
            {/* <TaskSelector selectedSkills={formData.skills} onSkillsChange={handleSkillsChange}/> */}
          </>
        );
      case 2: // Skills and Task Preferences
        return (
          <>
            <h1 className={styles.title}>Skills and Task Preferences</h1>
            <p className={styles.subtitle}>
              That will help us better account setup for you.
            </p>
            <AutoComplete
              label="What type of tasks can you help with?"
              options={SKILL_OPTIONS}
              values={formData.skills}
              onChange={handleSkillsChange}
            />
            {/* Add specific task checkboxes as in your example if needed, or integrate into TaskSelector */}
          </>
        );
      case 3: // Personality and Interests
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
            />

            <AutoComplete
              label="What kind of people do you enjoy spending time with?"
              options={PERSONALITIES_OPTIONS}
              values={formData.peoplePreference}
              onChange={newPeoplePreference =>
                handleInputChange('peoplePreference', newPeoplePreference)
              }
            />
          </>
        );
      case 4: {
        // Availability and Rate
        const rateRanges = [];
        for (let start = 15; start < 100; start += 5) {
          rateRanges.push({ value: start, label: `${start}-${start + 5}` });
        }
        rateRanges.push({ value: 100, label: '100+' });
        return (
          <>
            <h1 className={styles.title}>Availability and Rate</h1>
            <p className={styles.subtitle}>
              That will help us better account setup for you.
            </p>
            <div className={styles.inputField}>
              <label htmlFor="ratePerHour" className={styles.inputLabel}>
                What is your task rate range ($)? We recommend picking a
                reasonable rate so you can get hired.
              </label>
              <select
                id="ratePerHour"
                className={styles.inputDropdown}
                name="ratePerHour"
                value={formData.ratePerHour}
                onChange={handleDirectEventChange}
              >
                <option value="">Select rate range</option>
                {rateRanges.map(range => (
                  <option key={range.label} value={range.value}>
                    ${range.label}/hr
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.inputField}>
              <label htmlFor="availability" className={styles.inputLabel}>
                How often are you available for tasks?
              </label>
              <div id="availability">
                {Object.keys(initialFormData.availability).map(day => (
                  <div key={day} className={styles.availabilityRow}>
                    <input
                      type="checkbox"
                      id={`avail-${day}`}
                      name={`availability.${day}`}
                      checked={formData.availability[day]}
                      onChange={e =>
                        handleAvailabilityChange(day, e.target.checked)
                      }
                      className={styles.availabilityCheckbox}
                    />
                    <label
                      htmlFor={`avail-${day}`}
                      className={styles.availabilityLabel}
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            {/* <InputField label="How often are you available for tasks? (e.g., Weekends, Evenings)" name="textAvailability" type="text" value={formData.textAvailability} onChange={(name,val)=>handleInputChange(name,val)} /> */}
          </>
        );
      }
      case 5: // Profile Picture and Bio (if bio is distinct for step 5)
        return (
          <>
            <h1 className={styles.title}>Profile Picture and Final Bio</h1>
            <p className={styles.subtitle}>
              That will help us better account setup for you.
            </p>
            <InputField
              label="Tell us a little more about yourself? What do you enjoy most about helping others? (This will show on your profile bio on you page)"
              name="bioStep5"
              type="textarea"
              value={formData.bioStep5}
              onChange={(name, val) => handleInputChange(name, val)}
            />
            <div className={styles.imageRow}>
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
                <p className={styles.uploadText}>Max 10 MB files are allowed</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className={styles.fileInput}
                />
              </div>
            </div>
          </>
        );
      default:
        return <p>Invalid step.</p>;
    }
  };

  // --- Main Render ---
  if (!user) return <p>Loading user data...</p>; // Or redirect if not tasker

  return (
    <div className={styles.container}>
      <ProgressHeader
        step={currentStep}
        totalSteps={TOTAL_STEPS}
        onNavigate={handleNavigation}
        canGoNext
      />
      <main className={styles.formContainer}>
        <form className={styles.form} onSubmit={e => e.preventDefault()}>
          {' '}
          {/* Prevent default on main form, handle submit via button */}
          {error && <p className={styles['error-message']}>{error}</p>}
          {renderStepContent()}
          {/* Navigation buttons are now in ProgressHeader */}
        </form>
      </main>
    </div>
  );
}

export default TaskerOnboardingPage;
