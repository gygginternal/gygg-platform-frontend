// src/pages/ForgotPasswordPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Use react-router-dom Link
import styles from './ForgotPasswordPage.module.css'; // Create this CSS module
import InputField from '../components/InputField'; // Adjust path
import apiClient from '../api/axiosConfig'; // Adjust path
import logger from '../utils/logger'; // Optional logger

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(''); // For success/error feedback
    const [error, setError] = useState(''); // Separate state for errors
    const [loading, setLoading] = useState(false);

    // Handler expected by InputField
    const handleChange = (name, value) => {
        setEmail(value);
        setError(''); // Clear errors on input change
        setMessage(''); // Clear success message
    };

    // Handler for form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (!email) {
            setError('Please enter your email address.');
            return;
        }
        setLoading(true);

        try {
            logger.info("Requesting password reset for:", email);
            // Call the backend endpoint to request password reset
            const response = await apiClient.post('/users/forgotPassword', { email });

            logger.info("Password reset request response:", response.data);
            // Display success message regardless of whether email exists (for security)
            setMessage('If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder).');

        } catch (err) {
            logger.error("Forgot password error:", err.response?.data || err.message);
            // Show a generic message even on error to prevent confirming email existence
            setMessage('If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder).');
            // Optionally set a specific error state if needed for debugging, but don't reveal too much
            // setError('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Simple handler for the "Re-enter" text click (just clears fields/messages)
    const handleResendClick = () => {
        setEmail('');
        setError('');
        setMessage('');
    };

    return (
        <main className={styles.container}>
            {/* Use standard img tag for logo */}
            <Link to="/" className={styles.logo}>
                <img src="/assets/gygg-logo.svg" alt="GYGG logo" width={100} height={60}/>
            </Link>

            <section className={styles.formContainer}>
                {/* Only show title and icon if no message is displayed */}
                {!message && (
                    <>
                        <h1 className={styles.title}>Reset Your Password</h1>
                        <div className={styles.iconContainer}>
                             {/* Use standard img tag */}
                            <img src="/assets/mail-notification.svg" // Ensure this exists in public folder
                                alt="Mail Notification"
                                width={60} // Adjusted size
                                height={60}
                             />
                        </div>
                    </>
                )}

                {/* Display Success/Info Message */}
                {message && <p className={styles.infoMessage}>{message}</p>}

                {/* Hide form after success message? Optional */}
                {!message && (
                     <form className={styles.form} onSubmit={handleSubmit}>
                        <p className={styles.instructionText}>
                            Enter the email address associated with your account and we'll send you a link to reset your password.
                        </p>
                        <InputField
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="ex. email@domain.com"
                            value={email}
                            onChange={handleChange} // Pass the handler
                            required
                        />
                        {error && <p className={styles.error}>{error}</p>}
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                             {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                 {/* Text shown below the form or below the success message */}
                 <p className={styles.retryText}>
                   Didn&apos;t get an email?{' '}
                   <span onClick={handleResendClick} className={styles.retryLink}>
                     Click here to re-enter your email
                   </span>
                   {' '} and try again. You can also <Link className={styles.link} to="/login">Log In</Link> or <Link className={styles.link} to="/join">Sign Up</Link>.
                 </p>
            </section>
        </main>
    );
}

export default ForgotPasswordPage;