// src/components/Onboarding/GigPostDetailsBudget.js
import PropTypes from 'prop-types';
import styles from './GigPostDetailsBudget.module.css';

function GigPostDetailsBudget({ formData, onInputChange }) {
  const handleSelectChange = e => onInputChange(e.target.name, e.target.value);
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
          onChange={handleSelectChange}
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
            onChange={handleSelectChange}
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
              onChange={handleSelectChange}
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
              onChange={handleSelectChange}
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
          onChange={handleSelectChange}
          rows={7}
          className={styles.textarea}
          required
          placeholder="Provide all necessary details..."
        />
      </div>
    </>
  );
}

GigPostDetailsBudget.propTypes = {
  formData: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
};

export default GigPostDetailsBudget;
