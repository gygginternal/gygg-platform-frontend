import { useState } from 'react';
import styles from './GigPostTitleDescription.module.css';
import FormInput from '../Shared/FormInput';
import PropTypes from 'prop-types';

function GigPostTitleDescription({ formData, onInputChange }) {
  return (
    <div className={styles.container}>
      <h2>Title & Description</h2>
      <FormInput
        label="Gig Title"
        name="title"
        value={formData.title || ''}
        onChange={onInputChange}
        placeholder="Enter a clear, descriptive title"
        required
      />
      <FormInput
        label="Description"
        name="description"
        value={formData.description || ''}
        onChange={onInputChange}
        placeholder="Describe what you need done..."
        type="textarea"
        rows={4}
        required
      />
    </div>
  );
}

GigPostTitleDescription.propTypes = {
  formData: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
};

export default GigPostTitleDescription;
