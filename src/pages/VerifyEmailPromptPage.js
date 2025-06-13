// frontend/src/pages/VerifyEmailPromptPage.js (New or enhanced page)
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import logger from '../utils/logger';

function VerifyEmailPromptPage() {
  const location = useLocation();
  const email = location.state?.email || 'your account email';
  const [resendStatus, setResendStatus] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendStatus('');
    try {
      await apiClient.post('/users/resendVerificationEmail', { email });
      setResendStatus('Verification email re-sent successfully! Check your inbox.');
      logger.info('Resent verification email for:', email);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to re-send email. Please try again later.';
      setResendStatus(`Error: ${errorMessage}`);
      logger.error('Failed to resend verification email:', error.response?.data || error.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
      <h1>Verify Your Email</h1>
      <p>A verification email has been sent to <strong>{email}</strong>.</p>
      <p>Please check your inbox (and spam/junk folder!) to verify your account.</p>

      <div style={{ marginTop: '30px' }}>
        <h3>Didn't receive the email yet?</h3>
        <p>
          It might take a few minutes to arrive. Also, please check your spam or junk folder.
          If you still can't find it, you can request another one.
        </p>
        <button 
          onClick={handleResendEmail} 
          disabled={resendLoading}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer' 
          }}
        >
          {resendLoading ? 'Sending...' : 'Resend Verification Email'}
        </button>
        {resendStatus && <p style={{ marginTop: '10px', color: resendStatus.startsWith('Error') ? 'red' : 'green' }}>{resendStatus}</p>}
      </div>

      <p style={{ marginTop: '50px' }}>
        Already verified? <a href="/login">Login here</a>.
      </p>
    </div>
  );
}

export default VerifyEmailPromptPage;