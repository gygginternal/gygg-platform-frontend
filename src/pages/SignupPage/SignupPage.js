// frontend/src/pages/SignupPage.js (UPDATED)
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './SignupPage.module.css';
import InputField from '../../components/Shared/InputField';
import apiClient from '../../api/axiosConfig';
import logger from '../../utils/logger';
import { useToast } from '../../contexts/ToastContext';

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

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRole && selectedRole !== formData.role[0]) {
      setFormData(prev => ({ ...prev, role: [selectedRole] }));
    }
  }, [selectedRole, formData.role]);

  // --- START: SIMPLIFIED handleChange - InputField now handles phoneNo formatting ---
  const handleChange = (name, value) => {
    // InputField for phoneNo will now send the already formatted '+1XXXXXXXXXX' string
    // Or just the raw value for other fields.
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error immediately if user starts typing after an error
    if (error) {
      setError('');
    }
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
        'Phone number must be in international format (e.g., +441234567890, +919876543210, +12345678900).'
      );
    }

    // If there are any frontend validation errors, display them and stop.
    if (currentErrors.length > 0) {
      setError(currentErrors.join('\n')); // Join errors with a newline character
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
      await apiClient.post('/users/signup', payload);
      logger.info('Signup successful on backend for:', payload.email);
      showToast(
        'Signup successful! Please check your email to verify your account.',
        { type: 'success' }
      );
      navigate('/verify-email-prompt', { state: { email: payload.email } });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Signup failed. Please try again.';
      logger.error('Signup error:', err.response?.data || err.message);
      showToast(errorMessage, { type: 'error' });
      setError(errorMessage);
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
          />

          <InputField
            label="Pick a password"
            name="password"
            type="password"
            placeholder="Enter password (min 8 chars)"
            value={formData.password}
            onChange={handleChange}
            icon="password"
            maxLength={20}
            required
          />

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
          />

          <InputField
            label="Phone number"
            name="phoneNo"
            type="tel"
            value={formData.phoneNo} // Full E.164 value goes down to InputField
            onChange={handleChange} // Full E.164 value comes up from InputField
            icon="phone"
            placeholder="e.g., 2345678900" // Placeholder for local part
            required
            maxLength={10} // IMPORTANT: This maxLength is for the LOCAL number part (10 digits)
            inputMode="tel"
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
          />

          <footer className={styles.footer}>
            {/* Display errors, each on a new line */}
            {error && (
              <div className={styles.errorWrapper}>
                {error.split('\n').map((msg, index) => (
                  <p key={index} className={styles.errorMessage}>
                    {msg}
                  </p>
                ))}
              </div>
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
