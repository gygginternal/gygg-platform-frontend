import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GigCreateForm.module.css';
import ProgressBar from '../ProviderOnboarding/ProgressBar';
import NavigationButtons from '../ProviderOnboarding/NavigationButtons';
import GigPostTimelineCategory from '../ProviderOnboarding/GigPostTimelineCategory';
import GigPostDetailsBudget from '../ProviderOnboarding/GigPostDetailsBudget';
import GigPostReview from '../ProviderOnboarding/GigPostReview';
import InputField from '../Shared/InputField';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/axiosConfig';
import logger from '../../utils/logger';
import { CATEGORY_ENUM } from '../../constants/categories';
import { useToast } from '../../context/ToastContext';

const TOTAL_GIG_CREATE_STEPS = 3;

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
  skillsRequired: [],
};

function Modal({ open, onClose, children }) {
  if (!open) return null;

  const handleKeyDown = e => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <button
      type="button"
      aria-label="Close modal"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        border: 'none',
        padding: 0,
        margin: 0,
        cursor: 'default',
      }}
      onClick={onClose}
      tabIndex={-1}
    >
      <div
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        style={{
          background: '#fff',
          borderRadius: 8,
          padding: 32,
          minWidth: 320,
          maxWidth: '90vw',
          boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
        }}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </button>
  );
}

function GigCreateForm({ onGigCreated }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialGigFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const showToast = useToast();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  const handleStepNavigation = direction => {
    setError('');
    if (direction === 'back') {
      if (currentStep > 1) setCurrentStep(s => s - 1);
    } else {
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

    if (!user.stripeAccountId || user.stripeChargesEnabled === false) {
      setShowPaymentModal(true);
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
      isHourly: formData.gigPaymentType === 'hourly',
      duration:
        formData.gigPaymentType === 'hourly'
          ? parseFloat(formData.gigDuration)
          : undefined,
      isRemote: formData.isRemote,
      location:
        formData.isRemote ||
        Object.values(formData.gigLocation).every(val => !val)
          ? undefined
          : formData.gigLocation,
      skills: formData.skillsRequired,
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
        onGigCreated(response.data.data.gig);
      } else {
        navigate(`/gigs/${response.data.data.gig._id}`);
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

  return (
    <div className={styles.container}>
      {/* Rest of the component content */}
    </div>
  );
}

export default GigCreateForm;