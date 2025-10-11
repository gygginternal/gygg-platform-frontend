import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../api/axiosConfig';
import ProgressBar from '../../components/features/ProviderOnboarding/ProgressBar';
import NavigationButtons from '../../components/features/ProviderOnboarding/NavigationButtons';
import GigPostTimelineCategory from '../../components/features/ProviderOnboarding/GigPostTimelineCategory';
import GigPostDetailsBudget from '../../components/features/ProviderOnboarding/GigPostDetailsBudget';
import GigPostReview from '../../components/features/ProviderOnboarding/GigPostReview';
import { CATEGORY_ENUM } from '../../constants/categories';
import { SKILL_OPTIONS } from '../../utils/constants';
import styles from './CreateGigPage.module.css';

const totalSteps = 3;

const initialFormData = {
  gigTimeline: 'fixed',
  gigTitle: '',
  gigCategory: '',
  gigPaymentType: 'fixed',
  gigCost: '',
  gigRatePerHour: '',
  gigDuration: '',
  gigDescription: '',
};

const CreateGigPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setCurrentStep(s => Math.min(s + 1, totalSteps));
  const handleBack = () => setCurrentStep(s => Math.max(s - 1, 1));
  const handleEditStep = step => setCurrentStep(step);

  const handlePost = async () => {
    setLoading(true);
    setError('');
    try {
      // Map formData to API expected fields
      const payload = {
        title: formData.gigTitle,
        description: formData.gigDescription,
        budget:
          formData.gigPaymentType === 'fixed'
            ? formData.gigCost
            : formData.gigRatePerHour,
        category: formData.gigCategory,
        duration: formData.gigTimeline,
        paymentType: formData.gigPaymentType,
        hours:
          formData.gigPaymentType === 'hourly'
            ? formData.gigDuration
            : undefined,
      };
      const response = await apiClient.post('/gigs', payload);
      showToast('Gig created successfully', 'success');
      navigate(`/gigs/${response.data.id}`);
    } catch (err) {
      setError('Failed to create gig. Please try again.');
      showToast('Failed to create gig', 'error');
    } finally {
      setLoading(false);
    }
  };

  let stepContent;
  if (currentStep === 1) {
    stepContent = (
      <GigPostTimelineCategory
        formData={formData}
        onInputChange={handleInputChange}
      />
    );
  } else if (currentStep === 2) {
    stepContent = (
      <GigPostDetailsBudget
        formData={formData}
        onInputChange={handleInputChange}
      />
    );
  } else if (currentStep === 3) {
    stepContent = (
      <GigPostReview gigData={formData} onEditStep={handleEditStep} />
    );
  }

  if (user?.role !== 'client') {
    return (
      <div className={styles.accessDeniedContainer}>
        <h1>Access Denied</h1>
        <p>
          Only clients can create gigs. Please switch to a client account to
          continue.
        </p>
        <button onClick={() => navigate('/profile')}>Go to Profile</button>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        <NavigationButtons
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={currentStep === totalSteps ? handlePost : handleNext}
          onBack={handleBack}
          isNextDisabled={
            loading ||
            (currentStep === 1 && (!formData.gigTitle || !formData.gigCategory))
          }
        />
        {stepContent}
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
};

export default CreateGigPage;
