import React, { useState } from 'react';
import ProgressBar from '../Shared/ProgressBar';
import NavigationButtons from '../Shared/NavigationButtons';
import GigPostTimelineCategory from '../ProviderOnboarding/GigPostTimelineCategory';
import GigPostDetailsBudget from '../ProviderOnboarding/GigPostDetailsBudget';
import GigPostReview from '../ProviderOnboarding/GigPostReview';
import apiClient from '../../api/axiosConfig';
import { CATEGORY_ENUM } from '../../constants/categories';
import styles from './GigCreateForm.module.css';

const TOTAL_STEPS = 3;
const initialGigFormData = {
  gigTimeline: 'fixed',
  gigTitle: '',
  gigCategory: CATEGORY_ENUM[0] || '',
  gigPaymentType: 'fixed',
  gigCost: '',
  gigRatePerHour: '',
  gigDuration: '',
  gigDescription: '',
};

function GigCreateForm({ onGigCreated }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialGigFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleNext = async () => {
    setError('');
    if (currentStep === 1) {
      if (!formData.gigTitle.trim() || !formData.gigCategory) {
        setError('Gig title and category are required.');
        return;
      }
    }
    if (currentStep === 2) {
      if (
        !formData.gigDescription.trim() ||
        (formData.gigPaymentType === 'fixed' &&
          (!formData.gigCost || parseFloat(formData.gigCost) <= 0)) ||
        (formData.gigPaymentType === 'hourly' &&
          (!formData.gigRatePerHour ||
            parseFloat(formData.gigRatePerHour) <= 0))
      ) {
        setError('Gig description and valid budget details are required.');
        return;
      }
    }
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(s => s + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

  const handleSubmit = async () => {
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
      isHourly: formData.gigPaymentType === 'hourly',
      duration:
        formData.gigPaymentType === 'hourly'
          ? parseFloat(formData.gigDuration)
          : undefined,
    };
    Object.keys(payload).forEach(
      key => payload[key] === undefined && delete payload[key]
    );
    try {
      const response = await apiClient.post('/gigs', payload);
      if (onGigCreated) {
        onGigCreated(response.data.data.gig);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post your gig.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.gigCreateFormBlackText}>
      <ProgressBar current={currentStep} total={TOTAL_STEPS} color="#00AABA" />
      <NavigationButtons
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={loading}
        backArrowColor="#111"
      />
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {currentStep === 1 && (
        <GigPostTimelineCategory
          formData={formData}
          onInputChange={handleInputChange}
        />
      )}
      {currentStep === 2 && (
        <GigPostDetailsBudget
          formData={formData}
          onInputChange={handleInputChange}
        />
      )}
      {currentStep === 3 && (
        <GigPostReview gigData={formData} onEditStep={setCurrentStep} />
      )}
    </div>
  );
}

export default GigCreateForm;
