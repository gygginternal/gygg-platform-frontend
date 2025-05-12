import React, { useState } from 'react';
import apiClient from '../api/axiosConfig';

function PostCreateForm({ onSubmitSuccess }) {
    const [content, setContent] = useState('');
    // Add state for media URLs, tags, location later if needed
    // const [mediaUrl, setMediaUrl] = useState('');
    // const [tags, setTags] = useState('');
    // const [address, setAddress] = useState('');
    // const [coords, setCoords] = useState({ lng: null, lat: null });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            setError('Post content cannot be empty.');
            return;
        }
        setLoading(true);
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
            console.log("Submitting post with payload:", payload);
            const response = await apiClient.post('/posts', payload); // POST to the posts endpoint

            console.log("Post created successfully:", response.data);
            setSuccessMessage("Post created successfully!");

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
            console.error("Error creating post:", err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to create post.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card" style={{ marginTop: '20px' }}>
            <h4>Create a New Post</h4>
            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="postContent">What's on your mind?</label>
                <textarea
                    id="postContent"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows="5"
                    required
                    maxLength="2000" // Match backend limit
                    disabled={loading}
                    placeholder="Write your post here..."
                />
            </div>

            {/* --- Optional Fields (Add inputs as needed) --- */}
            {/*
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="postMedia">Media URL (Optional):</label>
                <input type="url" id="postMedia" name="mediaUrl" value={mediaUrl} onChange={(e)=>setMediaUrl(e.target.value)} disabled={loading} placeholder="https://example.com/image.jpg"/>
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="postTags">Tags (Comma-separated, Optional):</label>
                <input type="text" id="postTags" name="tags" value={tags} onChange={(e)=>setTags(e.target.value)} disabled={loading} placeholder="e.g., coding, react, gigwork"/>
            </div>
             <div style={{ marginBottom: '15px' }}>
                 <label htmlFor="postAddress">Location Address (Optional):</label>
                 <input type="text" id="postAddress" name="address" value={address} onChange={(e)=>setAddress(e.target.value)} disabled={loading} placeholder="e.g., City Park"/>
                 <label htmlFor="postLng">Longitude:</label><input type="number" step="any" id="postLng" value={coords.lng || ''} onChange={(e)=>setCoords(c=> ({...c, lng: e.target.value ? parseFloat(e.target.value) : null}))} />
                 <label htmlFor="postLat">Latitude:</label><input type="number" step="any" id="postLat" value={coords.lat || ''} onChange={(e)=>setCoords(c=> ({...c, lat: e.target.value ? parseFloat(e.target.value) : null}))} />
             </div>
            */}


            <button type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Posting...' : 'Create Post'}
            </button>
        </form>
    );
}

export default PostCreateForm;