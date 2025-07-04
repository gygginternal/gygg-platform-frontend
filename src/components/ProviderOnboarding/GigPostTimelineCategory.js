// src/components/Onboarding/GigPostTimelineCategory.js
import PropTypes from 'prop-types';
import styles from './GigPostTimelineCategory.module.css';
import { SKILL_OPTIONS } from '../../utils/constants';
import { CATEGORY_ENUM } from '../../constants/categories';

function GigPostTimelineCategory({ formData, onInputChange }) {
  const handleSelectChange = e => onInputChange(e.target.name, e.target.value);

  return (
    <>
      <div className={styles.formGroup}>
        <label htmlFor="gigTimeline" className={styles.label}>
          Task Timeline Type*
        </label>
        <select
          id="gigTimeline"
          name="gigTimeline"
          value={formData.gigTimeline}
          onChange={handleSelectChange}
          className={styles.select}
          required
        >
          <option value="fixed">Fixed Price Project</option>
        </select>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="gigTitle" className={styles.label}>
          Write your job post title*
        </label>
        <input
          type="text"
          id="gigTitle"
          name="gigTitle"
          value={formData.gigTitle}
          onChange={handleSelectChange}
          className={styles.input}
          required
          placeholder="e.g., Need a dog walker for 2 days"
          maxLength={100}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="gigCategory" className={styles.label}>
          What category does this job belong to?*
        </label>
        <select
          id="gigCategory"
          name="gigCategory"
          value={formData.gigCategory}
          onChange={handleSelectChange}
          className={styles.select}
          required
        >
          <option value="" disabled>
            Select a category
          </option>
          {CATEGORY_ENUM.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

GigPostTimelineCategory.propTypes = {
  formData: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
};

export default GigPostTimelineCategory;
