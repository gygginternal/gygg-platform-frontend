// src/pages/GigCreateOptionsPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../components/GigCreateOptionsPage/GigCreateOptionsPage.module.css';
import { CATEGORY_ENUM } from '../utils/constants'; // Assuming categories are here
import apiClient from '../api/axiosConfig'; // Adjust path if needed
import logger from '../utils/logger';
import { useToast } from '../context/ToastContext';

function GigCreateOptionsPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    timeline: 'fixed', // Default or 'hourly', 'project'
    title: '',
    category: CATEGORY_ENUM[0], // Default to first category
    description: '',
    cost: '', // For fixed
    ratePerHour: '', // For hourly
    // Add more fields: location, skillsRequired, deadline, duration
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const showToast = useToast();

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmitFirstGig = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.title || !formData.category || !formData.description) {
      setError('Title, category, and description are required.');
      setLoading(false);
      return;
    }
    if (
      formData.timeline === 'fixed' &&
      (!formData.cost || parseFloat(formData.cost) <= 0)
    ) {
      setError('A valid fixed cost is required.');
      setLoading(false);
      return;
    }
    if (
      formData.timeline === 'hourly' &&
      (!formData.ratePerHour || parseFloat(formData.ratePerHour) <= 0)
    ) {
      setError('A valid hourly rate is required.');
      setLoading(false);
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      cost:
        formData.timeline === 'fixed' ? parseFloat(formData.cost) : undefined,
      ratePerHour:
        formData.timeline === 'hourly'
          ? parseFloat(formData.ratePerHour)
          : undefined,
      // isRemote: formData.isRemote, // Add if you have this field
    };

    logger.debug('Submitting first gig:', payload); // Now logger is defined
    try {
      const response = await apiClient.post('/gigs', payload); // Now apiClient is defined
      showToast('Your first gig has been posted!', { type: 'success' });
      navigate(`/gigs/${response.data.data.gig._id}`);
    } catch (err) {
      logger.error(
        'Error posting first gig:',
        err.response?.data || err.message
      );
      showToast(
        err.response?.data?.message || 'Failed to post your first gig.',
        { type: 'error' }
      );
      setError(err.response?.data?.message || 'Failed to post your first gig.');
    } finally {
      setLoading(false);
    }
  };

  // Simulating components from your `profilesetup5` example
  const TimelineSelector = ({ value, onChange }) => (
    <div className={styles.formGroup}>
      <label htmlFor="timeline" className={styles.label}>
        Timeline
      </label>
      <select
        id="timeline"
        name="timeline"
        value={value}
        onChange={onChange}
        className={styles.select}
      >
        <option value="fixed">Fixed Price Project</option>
        <option value="hourly">Hourly Rate</option>
        {/* Add more options as needed */}
      </select>
    </div>
  );
  const TitleInput = ({ value, onChange }) => (
    <div className={styles.formGroup}>
      <label htmlFor="title" className={styles.label}>
        Gig Title*
      </label>
      <input
        type="text"
        id="title"
        name="title"
        value={value}
        onChange={onChange}
        className={styles.input}
        required
        placeholder="e.g., Dog sitting for a day"
      />
    </div>
  );
  const CategorySelector = ({ value, onChange }) => (
    <div className={styles.formGroup}>
      <label htmlFor="category" className={styles.label}>
        Category*
      </label>
      <select
        id="category"
        name="category"
        value={value}
        onChange={onChange}
        className={styles.select}
        required
      >
        <option value="">Select a category</option>
        {CATEGORY_ENUM.map(cat => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <header className={styles.pageHeader}>
          <Link to="/profile">
            {' '}
            {/* Or "/" if dashboard is not the immediate back step */}
            <img src="/gygg-logo.svg" alt="GYGG Logo" className={styles.logo} />
          </Link>
        </header>

        {/* <ProgressBar current={1} total={1} label="Create Your First Gig" /> */}

        <main className={styles.formSection}>
          <h1 className={styles.pageTitle}>Create Your First Gig Post</h1>
          <p className={styles.pageSubtitle}>
            Let&apos;s get your first service listed!
          </p>

          <form onSubmit={handleSubmitFirstGig}>
            {/* Re-use input change handler for these custom-like components by passing name */}
            <TimelineSelector
              value={formData.timeline}
              onChange={e =>
                handleInputChange({
                  target: { name: 'timeline', value: e.target.value },
                })
              }
            />
            <TitleInput
              value={formData.title}
              onChange={e =>
                handleInputChange({
                  target: { name: 'title', value: e.target.value },
                })
              }
            />
            <CategorySelector
              value={formData.category}
              onChange={e =>
                handleInputChange({
                  target: { name: 'category', value: e.target.value },
                })
              }
            />

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="5"
                className={styles.textarea}
                required
                placeholder="Describe the service you are offering..."
              />
            </div>

            {formData.timeline === 'fixed' && (
              <div className={styles.formGroup}>
                <label htmlFor="cost" className={styles.label}>
                  Total Project Cost ($)*
                </label>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  min="1"
                  step="0.01"
                  className={styles.input}
                  required
                />
              </div>
            )}
            {formData.timeline === 'hourly' && (
              <div className={styles.formGroup}>
                <label htmlFor="ratePerHour" className={styles.label}>
                  Your Hourly Rate ($)*
                </label>
                <input
                  type="number"
                  id="ratePerHour"
                  name="ratePerHour"
                  value={formData.ratePerHour}
                  onChange={handleInputChange}
                  min="1"
                  step="0.01"
                  className={styles.input}
                  required
                />
              </div>
            )}

            {error && <p className={styles.errorMessage}>{error}</p>}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Posting Gig...' : 'Post Your Gig'}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default GigCreateOptionsPage;
