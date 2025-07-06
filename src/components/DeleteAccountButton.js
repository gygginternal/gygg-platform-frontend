import { useState } from 'react';
import apiClient from '../api/axiosConfig';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import styles from './DeleteAccountButton.module.css';

function DeleteAccountButton() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await apiClient.delete('/users/deleteMe');
      showToast('Account deleted.', 'success');
      localStorage.removeItem('authToken');
      navigate('/login');
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to delete account.',
        'error'
      );
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <button className={styles.button} onClick={() => setShowModal(true)}>
        Delete Account
      </button>
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <button
              className={styles.confirm}
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button
              className={styles.cancel}
              onClick={() => setShowModal(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default DeleteAccountButton;
