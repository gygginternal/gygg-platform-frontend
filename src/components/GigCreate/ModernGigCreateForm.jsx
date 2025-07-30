import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import apiClient from '../../api/axiosConfig';
import { CATEGORY_ENUM } from '../../constants/categories';
import { useToast } from '../../contexts/ToastContext';
import styles from './ModernGigCreateForm.module.css';

const TOTAL_STEPS = 3;

const initialGigFormData = {
  gigTimeline: 'fixed',
  gigTitle: '',
  gigCategory: '',
  gigPaymentType: 'hourly',
  gigCost: '',
  gigRatePerHour: '',
  gigDuration: '',
  gigDescription: '',
  priceRange: '',
};

const exampleTitles = [
  'Looking for an experienced assembler to build furniture quickly and accurately feeding and walking',
  'Hiring a gardener to maintain and care for outdoor plants and lawns'
];

function ModernGigCreateForm({ onGigCreated }) {
  const { showToast } = useToast();
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
    
    // Validation for current step
    if (currentStep === 1) {
      if (!formData.gigTitle.trim()) {
        setError('Please write a title for your job post.');
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.gigDescription.trim()) {
        setError('Please write a detailed description about the task.');
        return;
      }
      if (!formData.gigCategory) {
        setError('Please select a category for your job.');
        return;
      }
      if (formData.gigPaymentType === 'hourly') {
        if (!formData.gigRatePerHour || parseFloat(formData.gigRatePerHour) <= 0) {
          setError('Please specify a valid hourly rate.');
          return;
        }
      }
      if (formData.gigPaymentType === 'fixed') {
        if (!formData.gigCost || parseFloat(formData.gigCost) <= 0) {
          setError('Please specify a valid fixed payment amount.');
          return;
        }
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
    
    // Prepare the payload according to backend expectations
    const payload = {
      title: formData.gigTitle.trim(),
      description: formData.gigDescription.trim(),
      category: formData.gigCategory,
      // Backend expects 'cost' field - use the appropriate value based on payment type
      cost: formData.gigPaymentType === 'fixed' 
        ? parseFloat(formData.gigCost) 
        : parseFloat(formData.gigRatePerHour),
      // Add optional fields that backend accepts
      isRemote: false, // Default value, can be made configurable later
      skills: [], // Default empty array, can be made configurable later
    };
    
    // Only include duration if it's an hourly payment and duration is specified
    if (formData.gigPaymentType === 'hourly' && formData.gigDuration) {
      payload.duration = parseFloat(formData.gigDuration);
    }
    
    console.log('Submitting gig payload:', payload);
    
    try {
      const response = await apiClient.post('/gigs', payload);
      console.log('Gig created successfully:', response.data);
      
      // Show success message
      showToast('Gig posted successfully!', { type: 'success' });
      
      if (onGigCreated) {
        onGigCreated(response.data.data.gig);
      }
    } catch (err) {
      console.error('Error creating gig:', err);
      console.error('Error response:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to post your gig. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>What is the task timeline type?</h2>
            
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="gigTimeline"
                  value="open-ended"
                  checked={formData.gigTimeline === 'open-ended'}
                  onChange={(e) => handleInputChange('gigTimeline', e.target.value)}
                />
                <span className={styles.radioLabel}>Open-ended</span>
              </label>
              
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="gigTimeline"
                  value="fixed"
                  checked={formData.gigTimeline === 'fixed'}
                  onChange={(e) => handleInputChange('gigTimeline', e.target.value)}
                />
                <span className={styles.radioLabel}>Fixed</span>
              </label>
            </div>

            <div className={styles.inputGroup}>
              <h3 className={styles.inputTitle}>Write title for your job post</h3>
              <textarea
                className={styles.titleTextarea}
                value={formData.gigTitle}
                onChange={(e) => handleInputChange('gigTitle', e.target.value)}
                placeholder="Describe what you need help with..."
                maxLength={100}
              />
            </div>

            <div className={styles.examplesSection}>
              <h4 className={styles.examplesTitle}>Example titles</h4>
              <ul className={styles.examplesList}>
                {exampleTitles.map((title, index) => (
                  <li key={index} className={styles.exampleItem}>
                    {title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>How do you want to pay for this gig?</h2>
            
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="gigPaymentType"
                  value="hourly"
                  checked={formData.gigPaymentType === 'hourly'}
                  onChange={(e) => handleInputChange('gigPaymentType', e.target.value)}
                />
                <span className={styles.radioLabel}>Hourly</span>
              </label>
              
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="gigPaymentType"
                  value="fixed"
                  checked={formData.gigPaymentType === 'fixed'}
                  onChange={(e) => handleInputChange('gigPaymentType', e.target.value)}
                />
                <span className={styles.radioLabel}>One fixed payment</span>
              </label>
            </div>

            <div className={styles.inputGroup}>
              <h3 className={styles.inputTitle}>What is the price range for this gig?</h3>
              <div className={styles.priceInputContainer}>
                {formData.gigPaymentType === 'hourly' ? (
                  <input
                    type="number"
                    className={styles.priceInput}
                    value={formData.gigRatePerHour}
                    onChange={(e) => handleInputChange('gigRatePerHour', e.target.value)}
                    placeholder="Enter hourly rate"
                    min="1"
                  />
                ) : (
                  <input
                    type="number"
                    className={styles.priceInput}
                    value={formData.gigCost}
                    onChange={(e) => handleInputChange('gigCost', e.target.value)}
                    placeholder="Enter fixed amount"
                    min="1"
                  />
                )}
                <div className={styles.priceDropdown}>
                  <select className={styles.currencySelect}>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <h3 className={styles.inputTitle}>Write a detailed description about the task you are posting</h3>
              <textarea
                className={styles.descriptionTextarea}
                value={formData.gigDescription}
                onChange={(e) => handleInputChange('gigDescription', e.target.value)}
                placeholder="Provide details about what you need help with, when you need it done, any specific requirements..."
                maxLength={2000}
              />
            </div>

            <div className={styles.inputGroup}>
              <h3 className={styles.inputTitle}>What category does this job belong to?</h3>
              <div className={styles.categoryList}>
                {CATEGORY_ENUM.map((category) => (
                  <label key={category} className={styles.categoryOption}>
                    <input
                      type="radio"
                      name="gigCategory"
                      value={category}
                      checked={formData.gigCategory === category}
                      onChange={(e) => handleInputChange('gigCategory', e.target.value)}
                    />
                    <span className={styles.categoryLabel}>{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className={styles.stepContent}>
            <div className={styles.reviewContainer}>
              {/* Gig Title */}
              <div className={styles.reviewItem}>
                <h3 className={styles.reviewLabel}>Gig Title</h3>
                <div className={styles.reviewContent}>
                  <div className={styles.reviewText}>
                    {formData.gigTitle || 'No title provided'}
                  </div>
                  <button 
                    className={styles.editButton}
                    onClick={() => setCurrentStep(1)}
                    type="button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Gig Details */}
              <div className={styles.reviewItem}>
                <h3 className={styles.reviewLabel}>Gig Details</h3>
                <div className={styles.reviewContent}>
                  <div className={styles.reviewText}>
                    {formData.gigDescription || 'No description provided'}
                  </div>
                  <button 
                    className={styles.editButton}
                    onClick={() => setCurrentStep(2)}
                    type="button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className={styles.reviewItem}>
                <h3 className={styles.reviewLabel}>Timeline</h3>
                <div className={styles.reviewContent}>
                  <div className={styles.timelineOptions}>
                    <label className={styles.timelineOption}>
                      <input
                        type="radio"
                        name="reviewTimeline"
                        value="open-ended"
                        checked={formData.gigTimeline === 'open-ended'}
                        readOnly
                      />
                      <span>Open-ended</span>
                    </label>
                    <label className={styles.timelineOption}>
                      <input
                        type="radio"
                        name="reviewTimeline"
                        value="fixed"
                        checked={formData.gigTimeline === 'fixed'}
                        readOnly
                      />
                      <span>Fixed</span>
                    </label>
                  </div>
                  <button 
                    className={styles.editButton}
                    onClick={() => setCurrentStep(1)}
                    type="button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Gig Pay Structure */}
              <div className={styles.reviewItem}>
                <h3 className={styles.reviewLabel}>Gig pay structure?</h3>
                <div className={styles.reviewContent}>
                  <div className={styles.timelineOptions}>
                    <label className={styles.timelineOption}>
                      <input
                        type="radio"
                        name="reviewPayment"
                        value="hourly"
                        checked={formData.gigPaymentType === 'hourly'}
                        readOnly
                      />
                      <span>Hourly</span>
                    </label>
                    <label className={styles.timelineOption}>
                      <input
                        type="radio"
                        name="reviewPayment"
                        value="fixed"
                        checked={formData.gigPaymentType === 'fixed'}
                        readOnly
                      />
                      <span>One fixed payment</span>
                    </label>
                  </div>
                  <button 
                    className={styles.editButton}
                    onClick={() => setCurrentStep(2)}
                    type="button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Budget Range */}
              <div className={styles.reviewItem}>
                <h3 className={styles.reviewLabel}>Budget range</h3>
                <div className={styles.reviewContent}>
                  <div className={styles.reviewText}>
                    {formData.gigPaymentType === 'hourly' 
                      ? `$${formData.gigRatePerHour || '0'}/hr` 
                      : `$${formData.gigCost || '0'}`
                    }
                  </div>
                  <button 
                    className={styles.editButton}
                    onClick={() => setCurrentStep(2)}
                    type="button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className={styles.reviewItem}>
                <h3 className={styles.reviewLabel}>What category does this job belong to?</h3>
                <div className={styles.reviewContent}>
                  <div className={styles.reviewText}>
                    {formData.gigCategory || 'No category selected'}
                  </div>
                  <button 
                    className={styles.editButton}
                    onClick={() => setCurrentStep(2)}
                    type="button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.stepIndicator}>
          {currentStep}/{TOTAL_STEPS}
        </div>
        
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.content}>
        {renderStepContent()}
      </div>

      <div className={styles.navigation}>
        <div className={styles.navigationLeft}>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className={styles.backButton}
              disabled={loading}
            >
              <ArrowLeft size={20} />
              Back
            </button>
          )}
        </div>
        
        <button
          type="button"
          onClick={handleNext}
          className={styles.nextButton}
          disabled={loading}
        >
          {loading ? 'Processing...' : currentStep === TOTAL_STEPS ? 'Post' : 'Next'}
        </button>
      </div>
    </div>
  );
}

export default ModernGigCreateForm;