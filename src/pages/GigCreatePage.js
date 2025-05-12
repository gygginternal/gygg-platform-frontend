import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
// import { CATEGORY_ENUM } from '../utils/constants'; // Assuming you create a constants file

function GigCreatePage() {
    const [formData, setFormData] = useState({
        title: '', description: '', category: CATEGORY_ENUM[0], // Default to first category
        cost: '', subcategory: '', isRemote: false, deadline: '', duration: ''
        // Add location fields if needed: location: { address: '', city: '', ... }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
         const { name, value, type, checked } = e.target;
         setFormData(prev => ({
             ...prev,
             [name]: type === 'checkbox' ? checked : value
         }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        // Basic validation
        if (!formData.title || !formData.description || !formData.category || !formData.cost) {
             setError('Please fill in Title, Description, Category, and Cost.');
             setLoading(false);
             return;
        }
        if (isNaN(parseFloat(formData.cost)) || parseFloat(formData.cost) <= 0) {
             setError('Cost must be a positive number.');
             setLoading(false);
             return;
        }

        // Format data (e.g., ensure cost is number, deadline is valid date)
        const payload = {
            ...formData,
            cost: parseFloat(formData.cost),
            duration: formData.duration ? parseFloat(formData.duration) : undefined,
            deadline: formData.deadline || undefined,
        };

        try {
            console.log("Submitting Gig:", payload);
            const response = await apiClient.post('/gigs', payload);
            console.log("Gig created:", response.data.data.gig);
            alert("Gig posted successfully!");
            navigate(`/gigs/${response.data.data.gig._id}`); // Navigate to the new gig detail page
        } catch (err) {
             console.error("Error creating gig:", err.response?.data || err.message);
             setError(err.response?.data?.message || 'Failed to post gig.');
        } finally {
             setLoading(false);
        }
    };

    return (
        <div className="card">
            <h2>Post a New Gig</h2>
            <form onSubmit={handleSubmit}>
                <div><label htmlFor="title">Title</label><input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required maxLength="100"/></div>
                <div><label htmlFor="description">Description</label><textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows="5"/></div>
                <div><label htmlFor="category">Category</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                         {CATEGORY_ENUM.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                {/* Add Subcategory input based on selected category if needed */}
                 <div><label htmlFor="cost">Cost ($)</label><input type="number" id="cost" name="cost" value={formData.cost} onChange={handleChange} required min="0.01" step="0.01"/></div>
                 {/* Add more fields: location, isRemote, deadline, duration, skills */}
                  <div><label><input type="checkbox" name="isRemote" checked={formData.isRemote} onChange={handleChange} /> Remote Gig</label></div>
                  <div><label htmlFor="deadline">Deadline (Optional)</label><input type="date" id="deadline" name="deadline" value={formData.deadline} onChange={handleChange} /></div>
                  <div><label htmlFor="duration">Estimated Duration (Hours, Optional)</label><input type="number" id="duration" name="duration" value={formData.duration} onChange={handleChange} min="0.1" step="0.1"/></div>


                {error && <p className="error-message">{error}</p>}
                <button type="submit" disabled={loading} style={{marginTop: '15px'}}>{loading ? 'Submitting...' : 'Post Gig'}</button>
            </form>
            <Link to="/dashboard" style={{display: 'block', marginTop: '15px'}}>Back to Dashboard</Link>
        </div>
    );
}
 // Define or import CATEGORY_ENUM
 const CATEGORY_ENUM = [ 'Household Services', 'Personal Assistant', 'Pet Care', 'Technology and Digital Assistance', 'Event Support', 'Moving and Organization', 'Creative and Costume Tasks', 'General Errands', 'Other' ];


export default GigCreatePage;