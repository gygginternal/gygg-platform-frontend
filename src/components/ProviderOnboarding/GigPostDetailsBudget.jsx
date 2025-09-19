// src/components/Onboarding/GigPostDetailsBudget.js
import PropTypes from 'prop-types';
import styles from './GigPostDetailsBudget.module.css';

function GigPostDetailsBudget({ formData, onInputChange }) {
  const handleSelectChange = e => onInputChange(e.target.name, e.target.value);
  const handleInputChange = e => onInputChange(e.target.name, e.target.value);
  const handleCheckboxChange = e => onInputChange(e.target.name, e.target.checked);
  
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
      
      {/* Location Fields */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Where is this gig located?*
        </label>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            name="gigCity"
            value={formData.gigCity || ''}
            onChange={handleInputChange}
            placeholder="City (e.g., Toronto)*"
            className={styles.input}
            style={{ flex: 1 }}
            required={!formData.isRemote}
          />
          <input
            type="text"
            name="gigState"
            value={formData.gigState || ''}
            onChange={handleInputChange}
            placeholder="Province/State (e.g., ON)*"
            className={styles.input}
            style={{ flex: 1 }}
            required={!formData.isRemote}
          />
        </div>
        <label className={styles.label} style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal' }}>
          <input
            type="checkbox"
            name="isRemote"
            checked={formData.isRemote || false}
            onChange={handleCheckboxChange}
            style={{ marginRight: '0.5rem' }}
          />
          This is a remote gig (can be done from anywhere)
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
