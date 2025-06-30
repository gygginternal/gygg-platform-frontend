import { useState } from 'react';
import apiClient from '../api/axiosConfig';
import { useToast } from '../contexts/ToastContext';
import styles from './ResendVerificationButton.module.css';

function ResendVerificationButton({ email }) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleResend = async () => {
    setLoading(true);
    try {
      await apiClient.post('/users/resendVerificationEmail', { email });
      showToast('Verification email resent!', 'success');
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to resend email.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className={styles.button} onClick={handleResend} disabled={loading}>
      {loading ? 'Resending...' : 'Resend Verification Email'}
    </button>
  );
}

export default ResendVerificationButton;
