// src/components/GigCreate/GigCreateForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GigCreateForm.module.css'; // CREATE THIS CSS MODULE
import ProgressBar from '../ProviderOnboarding/ProgressBar';
import NavigationButtons from '../ProviderOnboarding/NavigationButtons';
import GigPostTimelineCategory from '../ProviderOnboarding/GigPostTimelineCategory';
import GigPostDetailsBudget from '../ProviderOnboarding/GigPostDetailsBudget';
import GigPostReview from '../ProviderOnboarding/GigPostReview';
import InputField from '../Shared/InputField'; // Your global InputField
import { useAuth } from '../../context/AuthContext'; // Relative path
import apiClient from '../../api/axiosConfig'; // Relative path
import logger from '../../utils/logger'; // Relative path
import { CATEGORY_ENUM } from '../../utils/constants'; // Relative path
import { useToast } from '../../context/ToastContext';

const TOTAL_GIG_CREATE_STEPS = 3; // Define steps for gig creation only

const initialGigFormData = {
  gigTimeline: 'fixed',
  gigTitle: '',
  gigCategory: CATEGORY_ENUM[0] || '',
  gigPaymentType: 'fixed',
  gigCost: '',
  gigRatePerHour: '',
  gigDescription: '',
  isRemote: false,
  gigLocation: {
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  },
  skillsRequired: [], // Skills provider is looking for in a tasker
};

function GigCreateForm({ onGigCreated }) {
  // Callback for when gig is successfully created
  const { user } = useAuth(); // To associate gig with user
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialGigFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const showToast = useToast();

  // Input Handlers (same as before, ensure InputField calls onChange with name, value)
  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };
  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
    setError('');
  };
  const handleLocationChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      gigLocation: { ...prev.gigLocation, [fieldName]: value },
    }));
    setError('');
  };
  // Add handleSkillsRequiredChange if using AutoComplete for skills

  const handleStepNavigation = direction => {
    setError('');
    if (direction === 'back') {
      if (currentStep > 1) setCurrentStep(s => s - 1);
      // No navigate elsewhere, parent page handles "cancel" or "back from step 1"
    } else {
      // 'next'
      // Step-specific validation
      if (
        currentStep === 1 &&
        (!formData.gigTitle.trim() || !formData.gigCategory)
      ) {
        setError('Gig title and category are required.');
        return;
      }
      if (
        currentStep === 2 &&
        (!formData.gigDescription.trim() ||
          (formData.gigPaymentType === 'fixed' &&
            (!formData.gigCost || parseFloat(formData.gigCost) <= 0)) ||
          (formData.gigPaymentType === 'hourly' &&
            (!formData.gigRatePerHour ||
              parseFloat(formData.gigRatePerHour) <= 0)))
      ) {
        setError('Gig description and valid budget details are required.');
        return;
      }

      if (currentStep < TOTAL_GIG_CREATE_STEPS) {
        setCurrentStep(s => s + 1);
      } else {
        handleGigSubmit();
      }
    }
  };

  const handleGigSubmit = async () => {
    if (!user) {
      setError('You must be logged in to post a gig.');
      return;
    }
    setLoading(true);
    setError('');

    const payload = {
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
      isRemote: formData.isRemote,
      location:
        formData.isRemote ||
        Object.values(formData.gigLocation).every(val => !val)
          ? undefined
          : formData.gigLocation,
      skills: formData.skillsRequired, // Assuming this is an array
      // postedBy will be set by backend
    };
    Object.keys(payload).forEach(
      key => payload[key] === undefined && delete payload[key]
    );

    logger.debug('Submitting new gig from GigCreateForm:', payload);
    try {
      const response = await apiClient.post('/gigs', payload);
      showToast('Your gig has been posted successfully!', { type: 'success' });
      logger.info('Gig posted successfully:', response.data.data.gig._id);
      if (onGigCreated) {
        onGigCreated(response.data.data.gig); // Notify parent
      } else {
        navigate(`/gigs/${response.data.data.gig._id}`); // Default navigation
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post your gig.');
      logger.error('Error posting gig:', err.response?.data || err.message);
      showToast(err.response?.data?.message || 'Failed to post your gig.', {
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditStep = stepNumber => setCurrentStep(stepNumber);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <GigPostTimelineCategory
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 2:
        return (
          <>
            <GigPostDetailsBudget
              formData={formData}
              onInputChange={handleInputChange}
            />
            <InputField
              label="Skills you're looking for in a Tasker (comma-separated, optional)"
              name="skillsRequired"
              type="textarea"
              value={
                Array.isArray(formData.skillsRequired)
                  ? formData.skillsRequired.join(', ')
                  : formData.skillsRequired
              }
              onChange={(name, value) =>
                handleInputChange(
                  name,
                  value.split(',').map(s => s.trim())
                )
              }
              rows={3}
            />
          </>
        );
      case 3:
        return <GigPostReview gigData={formData} onEditStep={handleEditStep} />;
      default:
        return <p>Invalid step.</p>;
    }
  };

  // Validation for enabling "Next" or "Post Gig" button
  let canGoNextForCurrentStep = true;
  if (
    currentStep === 1 &&
    (!formData.gigTitle.trim() || !formData.gigCategory)
  ) {
    canGoNextForCurrentStep = false;
  } else if (
    currentStep === 2 &&
    (!formData.gigDescription.trim() ||
      (formData.gigPaymentType === 'fixed' &&
        (!formData.gigCost || parseFloat(formData.gigCost) <= 0)) ||
      (formData.gigPaymentType === 'hourly' &&
        (!formData.gigRatePerHour || parseFloat(formData.gigRatePerHour) <= 0)))
  ) {
    canGoNextForCurrentStep = false;
  }

  return (
    <div className={styles.gigCreateFormContainer}>
      {' '}
      {/* Main wrapper for this component */}
      <ProgressBar
        current={currentStep}
        total={TOTAL_GIG_CREATE_STEPS}
        label="Create New Gig"
      />
      <form className={styles.form} onSubmit={e => e.preventDefault()}>
        {error && <p className={styles.errorMessage}>{error}</p>}
        {renderStepContent()}
      </form>
      <NavigationButtons
        onBack={() => handleStepNavigation('back')}
        onNext={() => handleStepNavigation('next')}
        isFirstStep={currentStep === 1}
        isLastStep={currentStep === TOTAL_GIG_CREATE_STEPS}
        nextLabel={currentStep === TOTAL_GIG_CREATE_STEPS ? 'Post Gig' : 'Next'}
        canGoNext={loading ? false : canGoNextForCurrentStep}
      />
    </div>
  );
}

export default GigCreateForm;
