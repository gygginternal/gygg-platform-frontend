// src/components/Onboarding/PersonalityForm.js
import React from 'react';
import styles from './PersonalityForm.module.css'; // Create this
import FormInput from './FormInput'; // Or your global InputField

function PersonalityForm({ peoplePreference, onPreferenceChange, bio, onBioChange }) {
  return (
    <div className={styles.personalityFormContainer}>
      {/* From profilesetup3.js (was hobbies/description for tasker) */}
      <FormInput
          label="What kind of people do you prefer to work with or hire?"
          name="peoplePreference"
          type="textarea" // Use textarea for longer input
          value={peoplePreference}
          onChange={onPreferenceChange} // Expects (name, value)
          placeholder="e.g., Punctual, communicative, detail-oriented..."
          rows={4}
      />
      <FormInput
          label="Briefly describe your typical projects or needs (Optional)."
          name="bio" // This can contribute to Provider's bio
          type="textarea"
          value={bio}
          onChange={onBioChange} // Expects (name, value)
          placeholder="e.g., I often need help with graphic design for marketing materials."
          rows={4}
      />
    </div>
  );
}
export default PersonalityForm;