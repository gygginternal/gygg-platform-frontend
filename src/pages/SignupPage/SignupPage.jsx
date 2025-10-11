// frontend/src/pages/SignupPage.js (UPDATED)
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './SignupPage.module.css';
import InputField from '../../components/common/InputField';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import apiClient from '../../api/axiosConfig';
import logger from '../../utils/logger';
import { useToast } from '../../contexts/ToastContext';
import useErrorHandler from '../../hooks/useErrorHandler';

function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
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
  const {
    errors,
    hasErrors,
    setMultipleErrors,
    handleApiError,
    clearOnInputChange,
  } = useErrorHandler();
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
    isValid: false,
  });

  const [passwordMatch, setPasswordMatch] = useState({
    isMatching: false,
    isDirty: false, // Only show match status after user has typed in confirm field
  });

  useEffect(() => {
    if (selectedRole && selectedRole !== formData.role[0]) {
      setFormData(prev => ({ ...prev, role: [selectedRole] }));
    }
  }, [selectedRole, formData.role]);

  // Check password strength
  const checkPasswordStrength = password => {
    const checks = [
      { test: password.length >= 8, message: 'At least 8 characters' },
      { test: /[A-Z]/.test(password), message: 'One uppercase letter' },
      { test: /[a-z]/.test(password), message: 'One lowercase letter' },
      { test: /\d/.test(password), message: 'One number' },
      {
        test: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        message: 'One special character',
      },
    ];

    const passed = checks.filter(check => check.test);
    const failed = checks.filter(check => !check.test);

    return {
      score: passed.length,
      feedback: failed.map(check => check.message),
      isValid: passed.length === checks.length,
    };
  };

  // --- START: Enhanced handleChange with password matching ---
  const handleChange = (name, value) => {
    // Update form data
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Check password matching whenever either password field changes
      if (name === 'password' || name === 'passwordConfirm') {
        const isMatching = newData.password === newData.passwordConfirm;
        const isDirty =
          name === 'passwordConfirm' ||
          (name === 'password' && prev.passwordConfirm.length > 0);

        setPasswordMatch({ isMatching, isDirty });
      }

      // Real-time password strength checking
      if (name === 'password') {
        setPasswordStrength(checkPasswordStrength(value));
      }

      return newData;
    });

    // Clear errors on input change
    clearOnInputChange();
  };
  // --- END: Enhanced handleChange ---

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    clearOnInputChange(); // Clear previous errors

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
        currentErrors.push(
          `Password must contain ${passwordErrors.join(', ')}.`
        );
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

    // *** Phone number validation (Frontend) - Simplified ***
    const fullPhoneNumber = formData.phoneNo; // This should now be the full formatted string from InputField

    // Very simple validation - just make sure it starts with +1 and has some digits
    const validPhoneNumber = phone => {
      return phone && phone.startsWith('+1') && phone.length >= 3;
    };

    if (!validPhoneNumber(fullPhoneNumber)) {
      currentErrors.push('Please enter a phone number starting with +1');
    }

    // If there are any frontend validation errors, display them and stop.
    if (currentErrors.length > 0) {
      setMultipleErrors(currentErrors);
      setLoading(false); // Reset loading state
      return;
    }

    const payload = {
      email: formData.email?.trim(),
      password: formData.password,
      passwordConfirm: formData.passwordConfirm,
      role: formData.role,
      dateOfBirth: formData.dateOfBirth,
      phoneNo: formData.phoneNo,
    };

    try {
      logger.info('Attempting signup for email:', payload.email);

      // Set a timeout to handle hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 15000); // 15 second timeout

      // Phone number validation passed, proceeding with signup
      const response = await apiClient.post('/users/signup', payload, {
        signal: controller.signal,
        timeout: 15000, // 15 second timeout
      });

      // Clear the timeout
      clearTimeout(timeoutId);

      logger.info('Signup successful on backend for:', payload.email);

      showToast(
        'Signup successful! Please check your email to verify your account.',
        { type: 'success' }
      );
      navigate('/verify-email-prompt', { state: { email: payload.email } });
    } catch (err) {
      logger.error('Signup error:', err.response?.data || err.message);

      // Handle specific error cases
      if (err.name === 'AbortError' || err.code === 'ECONNABORTED') {
        showToast(
          'Request timeout. The server is taking too long to respond. Please try again.',
          { type: 'error' }
        );
        setMultipleErrors([
          'The signup request timed out. This could be due to network issues or server load. Please try again.',
        ]);
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        showToast(
          'Network error. Please check your connection and try again.',
          { type: 'error' }
        );
        setMultipleErrors([
          'Network connection error. Please check your internet connection and try again.',
        ]);
      } else if (err.response?.status === 400) {
        handleApiError(err);

        // Check for specific validation errors
        if (err.response?.data?.errors?.phoneNo) {
          setMultipleErrors([
            `Phone number error: ${err.response.data.errors.phoneNo}`,
          ]);
        }
      } else if (err.response?.status === 409) {
        showToast('An account with this email already exists.', {
          type: 'error',
        });
        setMultipleErrors([
          'An account with this email already exists. Please use a different email or try logging in.',
        ]);
      } else if (err.response?.status >= 500) {
        showToast('Server error. Please try again later.', { type: 'error' });
        setMultipleErrors([
          'The server encountered an error. Our team has been notified and is working on it.',
        ]);
      } else {
        showToast(
          err.response?.data?.message || 'Signup failed. Please try again.',
          { type: 'error' }
        );
        setMultipleErrors([
          err.response?.data?.message || 'Signup failed. Please try again.',
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getMaxDateForDOB = () => {
    const today = new Date();
    // Calculate date for 50 years ago (minimum age requirement)
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
                  <span className={styles.strengthValid}>
                    ✓ Strong password
                  </span>
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

          {/* Password matching indicator */}
          {passwordMatch.isDirty && (
            <div className={styles.passwordMatch}>
              <div className={styles.matchIcon}>
                {passwordMatch.isMatching ? (
                  <span className={styles.matching}>✓</span>
                ) : (
                  <span className={styles.notMatching}>✗</span>
                )}
              </div>
              <div
                className={`${styles.matchText} ${passwordMatch.isMatching ? styles.matching : styles.notMatching}`}
              >
                {passwordMatch.isMatching
                  ? 'Passwords match'
                  : 'Passwords do not match'}
              </div>
            </div>
          )}

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
