// frontend/src/pages/SignupPage.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useNavigation } from 'react-router-dom'; // Use react-router-dom
import styles from './SignupPage.module.css'; // Create this CSS Module
import InputField from '../components//Shared/InputField'; // Adjust path
import apiClient from '../api/axiosConfig'; // Adjust path
import logger from '../utils/logger'; // Optional logger
// Assuming you have the logo in public/
// import logo from '/gygg-logo.svg'; // This won't work directly for public assets

function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialRole = location.state?.selectedRole || 'tasker';

  const [formData, setFormData] = useState({
    email: '',
    phoneNo: '+1', // Changed name to match backend, initialize with country code
    password: '',
    passwordConfirm: '', // Changed name to match backend/AuthForm
    dateOfBirth: '', 
    role: [initialRole] 
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Update role state if location state changes after initial mount (unlikely but safe)
  
  useEffect(() => {
    const roleFromState = location.state?.selectedRole;
    if (roleFromState && roleFromState !== formData.role[0]) {
      setFormData(prev => ({ ...prev, role: [roleFromState] }));
    }
  }, [location.state, formData.role]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password' || name === 'passwordConfirm' || name === 'dateOfBirth' || error) {
        setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // --- Frontend Validation ---
    if (!formData.email || !formData.password || !formData.phoneNo || !formData.dateOfBirth) {
        setError('Please fill in all required fields (*). Email, Password, Phone, and Date of Birth are required.');
        return;
    }
    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match.');
      return;
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
        if (age < 50) { // <<< CHECK FOR 50 YEARS
             setError('You must be at least 50 years old to sign up.');
             return;
        }
    }
    setLoading(true);

    // Prepare payload matching backend expectations
    const payload = {
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        role: formData.role,
        dateOfBirth: formData.dateOfBirth || undefined,
    };

    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    try {
        logger.info("Attempting signup for email:", payload.email);
        await apiClient.post('/users/signup', payload);
        logger.info("Signup successful on backend for:", payload.email);
        alert("Signup successful! Please check your email to verify your account.");
        navigate('/verify-email-prompt', { state: { email: payload.email } });

    } catch (err) {
        const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
        logger.error("Signup error:", err.response?.data || err.message);
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  const getMaxDateForDOB = () => {
      const today = new Date();
      const maxDate = new Date(today.getFullYear() - 50, today.getMonth(), today.getDate());
      return maxDate.toISOString().split("T")[0];
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
        <h1 className={styles.title}>Sign up as {formData.role[0] === 'tasker' ? 'a Tasker' : 'a Provider'}</h1>

        <form className={styles.form} onSubmit={handleSubmit}>

          <InputField
            label="Email*"
            name="email"
            type="email"
            placeholder="ex. email@domain.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <InputField
            label="Pick a password*"
            name="password"
            type="password"
            placeholder="Enter password (min 8 chars)"
            value={formData.password}
            onChange={handleChange}
            icon="password" // Enables show/hide
            maxLength={20} // Example limit
            required
          />

          <InputField
            label="Re-enter password*"
            name="passwordConfirm" // Correct name
            type="password"
            placeholder="Re-enter password"
            value={formData.passwordConfirm}
            onChange={handleChange}
            icon="password"
            maxLength={20}
            required
          />

          <InputField
            label="Phone number*" // Changed label, added asterisk
            name="phoneNo" // Use backend field name 'phoneNo'
            type="tel" // Use tel type
            placeholder="Enter phone number"
            value={formData.phoneNo} // Use combined value state
            onChange={handleChange} // Pass the handler
            icon="phone" // Enables country code + digit handling
            inputMode="tel" // Hint for mobile keyboards
            required
          />

          <InputField
            label="Date of Birth*"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            max={getMaxDateForDOB()} 
          />


          <footer className={styles.footer}>
             {error && <p className={styles.error || 'error-message'}>{error}</p>}

            <p className={styles.terms}>
              By registering for an account, you are consenting to our{' '}
              <Link to="/terms" className={styles.link}> {/* Use react-router Link */}
                Terms of Service
              </Link>{' '}
              and confirming that you have reviewed and accepted the{' '}
              <Link to="/privacy" className={styles.link}> {/* Use react-router Link */}
                Global Privacy Statement
              </Link>
              .
            </p>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </footer>
          <p className={styles.terms}>Already have an account? <Link to="/login" className={styles.link}>Log In</Link></p>

        </form>
      </section>
    </main>
  );
}

export default SignupPage;