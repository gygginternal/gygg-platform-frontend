// src/components/Onboarding/GigPostTimelineCategory.js
import React from "react";
import styles from '../Onboarding/GigPostForm.module.css'; // Use common or specific styles
import { CATEGORY_ENUM, SKILL_OPTIONS } from "../../utils/constants";

function GigPostTimelineCategory({ formData, onInputChange }) {
  const handleSelectChange = (e) =>
    onInputChange(e.target.name, e.target.value);

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
          {SKILL_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
export default GigPostTimelineCategory;
