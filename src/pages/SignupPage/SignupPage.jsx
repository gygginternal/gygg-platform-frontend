// frontend/src/pages/SignupPage.js (UPDATED)
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './SignupPage.module.css';
import InputField from '../../components/Shared/InputField';
import ErrorDisplay from '../../components/Shared/ErrorDisplay';
import apiClient from '../../api/axiosConfig';
import logger from '../../utils/logger';
import { useToast } from '../../contexts/ToastContext';
import useErrorHandler from '../../hooks/useErrorHandler';

function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();
  const selectedRole = location.state?.selectedRole || 'tasker';

  const [formData, setFormData] = useState({
    email: '',
    phoneNo: '+1',
    password: '',
    passwordConfirm: '',
    dateOfBirth: '',
    role: [selectedRole],
  });

  const [loading, setLoading] = useState(false);
  const { errors, hasErrors, setMultipleErrors, handleApiError, clearOnInputChange } = useErrorHandler();
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
    isValid: false
  });

  useEffect(() => {
    if (selectedRole && selectedRole !== formData.role[0]) {
      setFormData(prev => ({ ...prev, role: [selectedRole] }));
    }
  }, [selectedRole, formData.role]);

  // Check password strength
  const checkPasswordStrength = (password) => {
    const checks = [
      { test: password.length >= 8, message: 'At least 8 characters' },
      { test: /[A-Z]/.test(password), message: 'One uppercase letter' },
      { test: /[a-z]/.test(password), message: 'One lowercase letter' },
      { test: /\d/.test(password), message: 'One number' },
      { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), message: 'One special character' }
    ];
    
    const passed = checks.filter(check => check.test);
    const failed = checks.filter(check => !check.test);
    
    return {
      score: passed.length,
      feedback: failed.map(check => check.message),
      isValid: passed.length === checks.length
    };
  };

  // --- START: SIMPLIFIED handleChange - InputField now handles phoneNo formatting ---
  const handleChange = (name, value) => {
    // InputField for phoneNo will now send the already formatted '+1XXXXXXXXXX' string
    // Or just the raw value for other fields.
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time password strength checking
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    // Clear errors on input change
    clearOnInputChange();
  };
  // --- END: SIMPLIFIED handleChange ---

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const currentErrors = []; // Collect all frontend validation errors

    // --- Frontend Validation ---
    if (
      !formData.email ||
      !formData.password ||
      !formData.phoneNo ||
      !formData.dateOfBirth
    ) {
      currentErrors.push(
        'Please fill in all required fields (*). Email, Password, Phone, and Date of Birth are required.'
      );
    }

    // Password strength validation
    if (formData.password) {
      const passwordErrors = [];
      
      if (formData.password.length < 8) {
        passwordErrors.push('at least 8 characters');
      }
      if (!/[A-Z]/.test(formData.password)) {
        passwordErrors.push('one uppercase letter');
      }
      if (!/[a-z]/.test(formData.password)) {
        passwordErrors.push('one lowercase letter');
      }
      if (!/\d/.test(formData.password)) {
        passwordErrors.push('one number');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        passwordErrors.push('one special character (!@#$%^&*(),.?":{}|<>)');
      }
      
      if (passwordErrors.length > 0) {
        currentErrors.push(`Password must contain ${passwordErrors.join(', ')}.`);
      }
    }

    if (formData.password !== formData.passwordConfirm) {
      currentErrors.push('Passwords do not match.');
    }

    // Client-side age check (UX enhancement, backend is authoritative)
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 50) {
        currentErrors.push('You must be at least 50 years old to sign up.');
      }
    }

    // *** Phone number validation (Frontend) - Enforce E.164 format (international) ***
    const fullPhoneNumber = formData.phoneNo; // This should now be the full formatted string from InputField

    // Regex for E.164: + followed by 8 to 15 digits
    const phoneRegexE164 = /^\+\d{8,15}$/;

    if (!phoneRegexE164.test(fullPhoneNumber)) {
      currentErrors.push(
        'Phone number must be in international format (e.g., +14165551234, +919876543210, +441234567890).'
      );
    }

    // If there are any frontend validation errors, display them and stop.
    if (currentErrors.length > 0) {
      setMultipleErrors(currentErrors);
      return;
    }

    const payload = {
      email: formData.email,
      password: formData.password,
      passwordConfirm: formData.passwordConfirm,
      role: formData.role,
      dateOfBirth: formData.dateOfBirth,
      phoneNo: formData.phoneNo,
    };

    try {
      logger.info('Attempting signup for email:', payload.email);
      // Phone number validation passed, proceeding with signup
      await apiClient.post('/users/signup', payload);
      logger.info('Signup successful on backend for:', payload.email);
      showToast(
        'Signup successful! Please check your email to verify your account.',
        { type: 'success' }
      );
      navigate('/verify-email-prompt', { state: { email: payload.email } });
    } catch (err) {
      logger.error('Signup error:', err.response?.data || err.message);
      handleApiError(err);
      showToast(err.response?.data?.message || 'Signup failed. Please try again.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getMaxDateForDOB = () => {
    const today = new Date();
    const maxDate = new Date(
      today.getFullYear() - 50,
      today.getMonth(),
      today.getDate()
    );
    return maxDate.toISOString().split('T')[0];
  };

  const getMinDateForDOB = () => {
    return '1900-01-01'; // January 1, 1900
  };

  return (
    <main className={styles.container}>
      <Link to="/" className={styles.logo}>
        <img
          src="/assets/gygg-logo.svg"
          alt="GYGG logo"
          width={100}
          height={60}
        />
      </Link>

      <section className={styles.formContainer}>
        <h1 className={styles.title}>
          Sign up as {selectedRole === 'tasker' ? 'a Tasker' : 'a Provider'}
        </h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <InputField
            label="Email"
            name="email"
            type="email"
            placeholder="ex. email@domain.com"
            value={formData.email}
            onChange={handleChange}
            required
            labelColor="white"
          />

          <InputField
            label="Pick a password"
            name="password"
            type="password"
            placeholder="Password (8+ chars, A-z, 0-9, !@#$)"
            value={formData.password}
            onChange={handleChange}
            icon="password"
            maxLength={20}
            required
            labelColor="white"
          />
          
          {/* Password strength indicator */}
          {formData.password && (
            <div className={styles.passwordStrength}>
              <div className={styles.strengthBar}>
                <div 
                  className={`${styles.strengthFill} ${styles[`strength${passwordStrength.score}`]}`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              <div className={styles.strengthText}>
                {passwordStrength.isValid ? (
                  <span className={styles.strengthValid}>✓ Strong password</span>
                ) : (
                  <div className={styles.strengthRequirements}>
                    {passwordStrength.feedback.map((req, index) => (
                      <span key={index} className={styles.strengthRequirement}>
                        • {req}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <InputField
            label="Re-enter password"
            name="passwordConfirm"
            type="password"
            placeholder="Re-enter password"
            value={formData.passwordConfirm}
            onChange={handleChange}
            icon="password"
            maxLength={20}
            required
            labelColor="white"
          />

          <InputField
            label="Phone Number"
            name="phoneNo"
            variant="phone"
            value={formData.phoneNo}
            onChange={handleChange}
            placeholder="Enter phone number"
            maxLength={15}
            required
            labelColor="white"
          />

          <InputField
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            max={getMaxDateForDOB()}
            min={getMinDateForDOB()}
            labelColor="white"
          />

          <footer className={styles.footer}>
            {/* Display errors using standardized component */}
            {hasErrors && (
              <ErrorDisplay 
                errors={errors} 
                variant="default"
                onDismiss={() => clearOnInputChange()}
              />
            )}

            <p className={styles.terms}>
              By registering for an account, you are consenting to our{' '}
              <Link to="/terms" className={styles.link}>
                Terms of Use
              </Link>{' '}
              and confirming that you have reviewed and accepted the{' '}
              <Link to="/privacy" className={styles.link}>
                Privacy Policy
              </Link>
              .
            </p>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading
                ? 'Signing up...'
                : `Sign up as ${
                    selectedRole === 'tasker' ? 'Tasker' : 'Provider'
                  }`}
            </button>
          </footer>
          <p className={styles.terms}>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>
              Log In
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default SignupPage;
