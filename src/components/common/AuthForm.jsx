import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../api/axiosConfig';
import styles from './AuthForm.module.css';
import FormInput from './Shared/FormInput';
import PropTypes from 'prop-types';
import logger from '../utils/logger'; // Optional: Adjust path

function AuthForm({ isLogin }) {
  const [formData, setFormData] = useState({
    // firstName: '',
    // lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: ['tasker'], // Default role for signup
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'role') {
      setFormData(prev => ({ ...prev, role: [value] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError(''); // Clear error on input change
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isLogin ? '/users/login' : '/users/signup';
    let payload;

    if (isLogin) {
      payload = {
        email: formData.email,
        password: formData.password,
      };

      logger.debug('Login Payload being sent:', payload.email); // Log email for privacy
      if (!payload.email || !payload.password) {
        setError('Email and password are required.');
        setLoading(false);
        return;
      }
    } else {
      // Signup
      if (formData.password !== formData.passwordConfirm) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.password
      ) {
        setError('Please fill all required fields for signup.');
        setLoading(false);
        return;
      }
      payload = {
        // firstName: formData.firstName,
        // lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        role: formData.role,
        // phoneNo: formData.phoneNo // Add if part of your signup form
      };
      logger.debug('Signup Payload being sent:', payload.email);
    }

    try {
      logger.info(
        `Attempting ${isLogin ? 'login' : 'signup'} for ${payload.email}...`
      );
      const response = await apiClient.post(url, payload);
      logger.info(`${isLogin ? 'Login' : 'Signup'} API call successful.`);

      if (isLogin) {
        // --- <<< THIS IS WHERE THE SNIPPET GOES FOR LOGIN >>> ---
        if (response.data.token && response.data.data.user) {
          login(response.data.token, response.data.data.user); // Update AuthContext
          logger.info(
            `User ${response.data.data.user.email} logged in. Checking for onboarding redirect.`
          );

          if (response.data.data.redirectToOnboarding) {
            logger.info(
              `Redirecting to onboarding: ${response.data.data.redirectToOnboarding}`
            );
            navigate(response.data.data.redirectToOnboarding); // Navigate to onboarding path
          } else {
            logger.info('No onboarding needed, redirecting to /feed.');
            navigate('/feed'); // Default to feed if no specific onboarding redirect
          }
        } else {
          logger.error(
            'Login failed: Invalid response structure from server.',
            response.data
          );
          setError('Login failed. Unexpected response from server.');
        }
        // --- <<< END OF SNIPPET INTEGRATION FOR LOGIN >>> ---
      } else {
        // Signup successful
        // Navigate to the verify email prompt page, passing email for display
        logger.info(
          `Signup successful for ${response.data.data.user.email}, redirecting to email prompt.`
        );
        navigate('/verify-email-prompt', {
          state: { email: response.data.data.user.email },
        });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        `Failed to ${isLogin ? 'login' : 'sign up'}. Please try again.`;
      logger.error(
        `Error during ${isLogin ? 'login' : 'signup'}:`,
        errorMessage,
        err.response?.data
      );
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>{isLogin ? 'Login' : 'Sign Up'}</h2>
      {!isLogin && (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.label}>
              First Name*
            </label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.label}>
              Last Name*
            </label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="role" className={styles.label}>
              Sign up as:
            </label>
            <select
              id="role"
              name="role"
              value={formData.role[0]}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="tasker">Tasker</option>
              <option value="provider">Provider</option>
            </select>
          </div>
        </>
      )}
      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email*
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className={styles.input}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>
          Password*
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className={styles.input}
        />
      </div>
      {!isLogin && (
        <div className={styles.formGroup}>
          <label htmlFor="passwordConfirm" className={styles.label}>
            Confirm Password*
          </label>
          <input
            id="passwordConfirm"
            type="password"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>
      )}
      {error && <p className={styles.errorMessage}>{error}</p>}
      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
      </button>
      {/* Links for forgot password or switch to signup/login */}
      {isLogin && (
        <p className={styles.loginLinks}>
          <Link to="/forgot-password" className={styles.link}>
            Forgot Password?
          </Link>{' '}
          | Don&apos;t have an account?{' '}
          <Link to="/join" className={styles.link}>
            Sign Up
          </Link>
        </p>
      )}
      {!isLogin && (
        <p className={styles.signupLinks}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Log In
          </Link>
        </p>
      )}
    </form>
  );
}

AuthForm.propTypes = {
  isLogin: PropTypes.bool.isRequired,
};

export default AuthForm;
