// src/components/Onboarding/PersonalityForm.js
import React from "react";
import styles from "./PersonalityForm.module.css"; // Create this
import FormInput from "./FormInput"; // Or your global InputField
import { AutoComplete } from "../AutoComplete";
import { HOBBIES_OPTIONS, PERSONALITIES_OPTIONS } from "../../utils/constants";

function PersonalityForm({
  peoplePreference,
  onPreferenceChange,
  bio,
  onBioChange,
  hobbies,
  onHobbiesChange,
}) {
  return (
    <div className={styles.personalityFormContainer}>
      {/* From profilesetup3.js (was hobbies/description for tasker) */}
      <AutoComplete
        label="What are your hobbies?"
        options={HOBBIES_OPTIONS}
        values={hobbies}
        onChange={onHobbiesChange}
      />
      <AutoComplete
        label="What kind of people do you enjoy spending time/working with?"
        options={PERSONALITIES_OPTIONS}
        values={peoplePreference}
        onChange={onPreferenceChange}
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
