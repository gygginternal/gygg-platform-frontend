import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../api/axiosConfig';
import PropTypes from 'prop-types';
import styles from './PostCreateForm.module.css';
import FormInput from './Shared/FormInput';
import AddressInput from './Shared/AddressInput';

function PostCreateForm({ onSubmitSuccess }) {
  const [content, setContent] = useState('');
  // Add state for media URLs, tags, location later if needed
  // const [mediaUrl, setMediaUrl] = useState('');
  // const [tags, setTags] = useState('');
  // const [address, setAddress] = useState('');
  // const [coords, setCoords] = useState({ lng: null, lat: null });

  const [isLoading, setIsLoading] = useState(false);
  const [_error, setError] = useState('');
  const [_successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Post content cannot be empty.');
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
          className={styles.postInput}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          required
          disabled={isLoading}
        />
        <button
          type="submit"
          className={styles.postButton}
          disabled={isLoading || !content.trim()}
        >
          Post
        </button>
      </div>
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
