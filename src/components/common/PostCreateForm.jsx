import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../api/axiosConfig';
import PropTypes from 'prop-types';
import styles from './PostCreateForm.module.css';
import FormInput from './FormInput';
import AddressInput from './AddressInput';
import { validateContent } from '../../utils/contentFilter';

function PostCreateForm({ onSubmitSuccess }) {
  const [content, setContent] = useState('');
  const [contentWarning, setContentWarning] = useState(null);
  const [isContentValid, setIsContentValid] = useState(true);
  // Add state for media URLs, tags, location later if needed
  // const [mediaUrl, setMediaUrl] = useState('');
  // const [tags, setTags] = useState('');
  // const [address, setAddress] = useState('');
  // const [coords, setCoords] = useState({ lng: null, lat: null });

  const [isLoading, setIsLoading] = useState(false);
  const [_error, setError] = useState('');
  const [_successMessage, setSuccessMessage] = useState('');

  const validatePostContent = text => {
    // Skip validation if content is empty
    if (!text || text.trim().length === 0) {
      setContentWarning(null);
      setIsContentValid(true);
      return true;
    }

    // Validate content using the content filter utility
    const validation = validateContent(text, {
      minSafetyScore: 70,
      strictMode: false,
    });

    if (!validation.isValid) {
      setContentWarning({
        message: validation.message,
        suggestions: validation.suggestions,
        severity: validation.safetyScore < 30 ? 'high' : 'medium',
      });
      setIsContentValid(false);
      return false;
    } else {
      setContentWarning(null);
      setIsContentValid(true);
      return true;
    }
  };

  const handleContentChange = e => {
    const newContent = e.target.value;
    setContent(newContent);
    validatePostContent(newContent);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }

    // Check if content is valid before submitting
    if (!isContentValid) {
      setError(
        'Post contains inappropriate content. Please revise your message.'
      );
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    // --- Prepare Payload ---
    // Basic payload with just content
    const payload = {
      content: content.trim(),
      // --- Optional fields ---
      // media: mediaUrl ? [mediaUrl.trim()] : [], // Example: Single media URL
      // tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag), // Split comma-separated tags
      // location: coords.lat && coords.lng ? { coordinates: [coords.lng, coords.lat], address: address.trim() } : undefined
    };

    try {
      const response = await apiClient.post('/posts', payload); // POST to the posts endpoint

      setSuccessMessage('Post created successfully!');

      if (onSubmitSuccess) {
        onSubmitSuccess(response.data.data.post); // Pass the new post back
      }
      // Clear form after success
      setContent('');
      setContentWarning(null);
      setIsContentValid(true);
      // setMediaUrl('');
      // setTags('');
      // setAddress('');
      // setCoords({ lng: null, lat: null });

      // Optionally hide form or redirect after a short delay
      // setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.postCreateForm} onSubmit={handleSubmit}>
      <div className={styles.postCreateRow}>
        <img src="/default.png" alt="avatar" className={styles.avatar} />
        <textarea
          className={`${styles.postInput} ${contentWarning ? styles.contentWarning : ''}`}
          value={content}
          onChange={handleContentChange}
          placeholder="What's on your mind?"
          rows={3}
          required
          disabled={isLoading}
        />
        <button
          type="submit"
          className={styles.postButton}
          disabled={isLoading || !content.trim() || !isContentValid}
        >
          Post
        </button>
      </div>

      {contentWarning && (
        <div className={styles.contentWarningContainer}>
          <div
            className={`${styles.contentWarningMessage} ${styles[contentWarning.severity]}`}
          >
            <span>{contentWarning.message}</span>
          </div>
          {contentWarning.suggestions &&
            contentWarning.suggestions.length > 0 && (
              <div className={styles.contentSuggestions}>
                <p className={styles.suggestionsTitle}>Suggestions:</p>
                <ul className={styles.suggestionsList}>
                  {contentWarning.suggestions
                    .slice(0, 2)
                    .map((suggestion, index) => (
                      <li key={index} className={styles.suggestionItem}>
                        {suggestion}
                      </li>
                    ))}
                </ul>
              </div>
            )}
        </div>
      )}

      <div className={styles.postCreateActions}>
        <button
          type="button"
          className={styles.iconBtn}
          tabIndex={-1}
          aria-label="Add image"
        >
          <img src="/assets/image.svg" alt="Add" />
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          tabIndex={-1}
          aria-label="Add GIF"
        >
          <img src="/assets/gif.svg" alt="GIF" />
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          tabIndex={-1}
          aria-label="Add emoji"
        >
          <img src="/assets/emoji.svg" alt="Emoji" />
        </button>
      </div>
    </form>
  );
}

PostCreateForm.propTypes = {
  onSubmitSuccess: PropTypes.func,
};

export default PostCreateForm;
