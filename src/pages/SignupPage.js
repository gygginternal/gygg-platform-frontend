// frontend/src/pages/SignupPage.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useNavigation } from 'react-router-dom'; // Use react-router-dom
import styles from './SignupPage.module.css'; // Create this CSS Module
import InputField from '../components/InputField'; // Adjust path
import apiClient from '../api/axiosConfig'; // Adjust path
import logger from '../utils/logger'; // Optional logger
// Assuming you have the logo in public/
// import logo from '/gygg-logo.svg'; // This won't work directly for public assets

function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialRole = location.state?.selectedRole || 'tasker';

  const [formData, setFormData] = useState({
    firstName: '', // Add firstName
    lastName: '', // Add lastName
    email: '',
    phoneNo: '+1', // Changed name to match backend, initialize with country code
    password: '',
    passwordConfirm: '', // Changed name to match backend/AuthForm
    // location: '', // Location might be complex (object?), handle separately or later
    // dob: '', // Date of Birth - backend needs to handle this type
    role: [initialRole] 
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Update role state if location state changes after initial mount (unlikely but safe)
  useEffect(() => {
    const roleFromState = location.state?.selectedRole;
    if (roleFromState) {
      setFormData(prev => ({ ...prev, role: [roleFromState] }));
    }
  }, [location.state]);  
  

  // Use the handler expected by InputField (name, value)
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear password match error when typing in either password field
    if (name === 'password' || name === 'passwordConfirm') {
        setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Frontend password match check
    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }
    // Basic validation (backend should handle more robustly)
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError('Please fill in all required fields (*)');
        return;
    }

    setLoading(true);

    // Prepare payload matching backend expectations
    const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        role: formData.role,
        phoneNo: formData.phoneNo, // Send combined phone number
        // Add dob and location if backend handles them
    };

    try {
        logger.info("Attempting signup with payload:", payload.email);
        // Use apiClient to call the backend signup endpoint
        await apiClient.post('/users/signup', payload);

        logger.info("Signup successful for:", payload.email);
        // Redirect to a page indicating verification email was sent
        // Or directly try to login (backend signup currently logs user in)
        alert("Signup successful! Please check your email to verify your account. You will be redirected to login.");
        navigate('/login'); // Redirect to login after successful signup

    } catch (err) {
        const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
        logger.error("Signup error:", err.response?.data || err.message);
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <Link to="/" className={styles.logo}> {/* Link logo to home */}
         {/* Use standard img tag pointing to public folder */}
         <img
             src="/assets/gygg-logo.svg"
             alt="GYGG logo"
             width={100} // Adjust size as needed
             height={60}
         />
      </Link>

      <section className={styles.formContainer}>
        <h1 className={styles.title}>Sign up</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
           {/* Add First Name and Last Name */}
           <InputField
                label="First Name*"
                name="firstName"
                type="text"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleChange}
                required // Mark as required
           />
            <InputField
                label="Last Name*"
                name="lastName"
                type="text"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleChange}
                required
           />

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

          {/* Removed DOB and Location for simplicity, add back if needed */}
          {/* <InputField label="Date of Birth*" name="dob" type="date" ... /> */}
          {/* <InputField label="Location*" name="location" type="text" ... /> */}

           {/* Role Selection (if needed beyond default) */}
           {/* <div><label htmlFor="role">Sign up as:</label><select id="role" name="role" value={formData.role[0]} onChange={(e)=>setFormData(prev => ({...prev, role: [e.target.value]}))}><option value="tasker">Tasker</option><option value="provider">Provider</option></select></div> */}


          <footer className={styles.footer}>
             {/* Display general error OR password mismatch error */}
             {error && <p className={styles.error}>{error}</p>}

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