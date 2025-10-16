// src/components/Onboarding/GigPostDetailsBudget.js
import PropTypes from 'prop-types';
import styles from './GigPostDetailsBudget.module.css';

function GigPostDetailsBudget({ formData, onInputChange }) {
  const handleFieldChange = e => {
    const { name, value, type, checked } = e.target;
    onInputChange(name, type === 'checkbox' ? checked : value);
  };
  return (
    <>
      <div className={styles.formGroup}>
        <label htmlFor="gigPaymentType" className={styles.label}>
          How do you want to pay?*
        </label>
        <select
          id="gigPaymentType"
          name="gigPaymentType"
          value={formData.gigPaymentType}
          onChange={handleFieldChange}
          className={styles.select}
          required
        >
          <option value="fixed">One Fixed Payment</option>
          <option value="hourly">Hourly</option>
        </select>
      </div>
      {formData.gigPaymentType === 'fixed' && (
        <div className={styles.formGroup}>
          <label htmlFor="gigCost" className={styles.label}>
            Total Project Budget ($)*
          </label>
          <input
            type="number"
            id="gigCost"
            name="gigCost"
            value={formData.gigCost}
            onChange={handleFieldChange}
            min="1"
            step="0.01"
            className={styles.input}
            required
          />
        </div>
      )}
      {formData.gigPaymentType === 'hourly' && (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="gigRatePerHour" className={styles.label}>
              Your Hourly Rate Budget ($/hr)*
            </label>
            <input
              type="number"
              id="gigRatePerHour"
              name="gigRatePerHour"
              value={formData.gigRatePerHour}
              onChange={handleFieldChange}
              min="1"
              step="0.01"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="gigDuration" className={styles.label}>
              Estimated Hours Needed*
            </label>
            <input
              type="number"
              id="gigDuration"
              name="gigDuration"
              value={formData.gigDuration || ''}
              onChange={handleFieldChange}
              min="1"
              step="1"
              className={styles.input}
              required
            />
          </div>
        </>
      )}
      <div className={styles.formGroup}>
        <label htmlFor="gigDescription" className={styles.label}>
          Detailed task description*
        </label>
        <textarea
          id="gigDescription"
          name="gigDescription"
          value={formData.gigDescription}
          onChange={handleFieldChange}
          rows={7}
          className={styles.textarea}
          required
          placeholder="Provide all necessary details..."
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Where is this gig located? (Optional)
        </label>
        <div style={{ display: 'flex', gap: '1em', marginBottom: '1em' }}>
          <input
            type="text"
            name="gigCity"
            value={formData.gigCity}
            onChange={handleFieldChange}
            className={styles.input}
            placeholder="City (e.g., Toronto)"
            style={{ flex: 1 }}
          />
          <input
            type="text"
            name="gigState"
            value={formData.gigState}
            onChange={handleFieldChange}
            className={styles.input}
            placeholder="Province/State (e.g., ON)"
            style={{ flex: 1 }}
          />
        </div>
        <label
          className={styles.label}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}
        >
          <input
            type="checkbox"
            name="isRemote"
            checked={formData.isRemote}
            onChange={handleFieldChange}
          />
          <span>This is a remote gig (can be done from anywhere)</span>
        </label>
      </div>
    </>
  );
}

GigPostDetailsBudget.propTypes = {
  formData: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
};

export default GigPostDetailsBudget;
