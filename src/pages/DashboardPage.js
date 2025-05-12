// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig';
import StripeOnboarding from '../components/StripeOnboarding';
import logger from '../utils/logger'; // Assuming you have a frontend logger utility

// Define default availability for the form
const defaultAvailability = {
    monday: true, tuesday: true, wednesday: true, thursday: true,
    friday: true, saturday: false, sunday: false
};

function UserProfileForm() {
    const { user, refreshUser } = useAuth(); // Get user and refresh function
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '', // Usually not updatable directly here for security
        phoneNo: '',
        bio: '',
        hobbies: [], // Will be string input, converted to array on submit
        peoplePreference: '',
        availability: { ...defaultAvailability },
        ratePerHour: 0,
        address: { street: '', city: '', state: '', postalCode: '', country: '' }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Populate form with user data when user object is available
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '', // Display only
                phoneNo: user.phoneNo || '',
                bio: user.bio || '',
                hobbies: user.hobbies?.join(', ') || '', // Display as comma-separated string
                peoplePreference: user.peoplePreference || '',
                availability: user.availability ? { ...defaultAvailability, ...user.availability } : { ...defaultAvailability },
                ratePerHour: user.ratePerHour || 0,
                address: user.address ? { ...user.address } : { street: '', city: '', state: '', postalCode: '', country: '' }
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({ ...prev, address: { ...prev.address, [addressField]: value } }));
        } else if (name.startsWith('availability.')) {
            const day = name.split('.')[1];
            setFormData(prev => ({ ...prev, availability: { ...prev.availability, [day]: checked } }));
        } else if (name === 'hobbies') {
            setFormData(prev => ({ ...prev, [name]: value })); // Keep as string during input
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccess('');

        // Prepare payload, convert hobbies string to array
        const payload = {
            ...formData,
            hobbies: formData.hobbies.split(',').map(h => h.trim()).filter(h => h), // Split and trim
            // email is not sent for update typically
        };
        delete payload.email; // Do not attempt to update email via this form

        try {
            logger.debug("Updating profile with payload:", payload);
            await apiClient.patch('/users/updateMe', payload);
            setSuccess('Profile updated successfully!');
            logger.info('Profile updated successfully by user:', user?._id);
            if (refreshUser) refreshUser(); // Refresh user data in AuthContext
        } catch (err) {
            logger.error("Error updating profile:", err.response?.data || err.message, { userId: user?._id });
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <p>Loading profile...</p>;

    return (
        <form onSubmit={handleSubmit} className="card" style={{ marginTop: '20px' }}>
            <h4>Edit Your Profile Details</h4>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <div><label htmlFor="firstName">First Name</label><input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} /></div>
            <div><label htmlFor="lastName">Last Name</label><input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} /></div>
            <div><label htmlFor="email">Email (Display Only)</label><input type="email" id="email" name="email" value={formData.email} readOnly disabled /></div>
            <div><label htmlFor="phoneNo">Phone Number</label><input type="tel" id="phoneNo" name="phoneNo" value={formData.phoneNo} onChange={handleChange} placeholder="e.g., 1234567890" /></div>
            <div><label htmlFor="bio">Bio</label><textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows="3" /></div>
            <div><label htmlFor="hobbies">Hobbies (comma-separated)</label><input type="text" id="hobbies" name="hobbies" value={formData.hobbies} onChange={handleChange} placeholder="e.g., reading, hiking, coding" /></div>
            <div><label htmlFor="peoplePreference">People Preference</label><input type="text" id="peoplePreference" name="peoplePreference" value={formData.peoplePreference} onChange={handleChange} /></div>

            {/* Address Fields */}
            <h5>Address</h5>
            <div><label htmlFor="address.street">Street</label><input type="text" id="address.street" name="address.street" value={formData.address.street} onChange={handleChange} /></div>
            <div><label htmlFor="address.city">City</label><input type="text" id="address.city" name="address.city" value={formData.address.city} onChange={handleChange} /></div>
            <div><label htmlFor="address.state">State/Province</label><input type="text" id="address.state" name="address.state" value={formData.address.state} onChange={handleChange} /></div>
            <div><label htmlFor="address.postalCode">Postal Code</label><input type="text" id="address.postalCode" name="address.postalCode" value={formData.address.postalCode} onChange={handleChange} /></div>
            <div><label htmlFor="address.country">Country</label><input type="text" id="address.country" name="address.country" value={formData.address.country} onChange={handleChange} /></div>

            {/* Availability - Only show if Tasker? Or common field? */}
            {user.role?.includes('tasker') && (
                <>
                    <h5>Availability (for Taskers)</h5>
                    {Object.keys(defaultAvailability).map(day => (
                        <div key={day}><label><input type="checkbox" name={`availability.${day}`} checked={formData.availability[day]} onChange={handleChange} /> {day.charAt(0).toUpperCase() + day.slice(1)} </label></div>
                    ))}
                    <div><label htmlFor="ratePerHour">Rate Per Hour ($)</label><input type="number" id="ratePerHour" name="ratePerHour" value={formData.ratePerHour} onChange={handleChange} min="0" step="0.01" /></div>
                </>
            )}

            <button type="submit" disabled={loading} style={{ marginTop: '20px' }}>{loading ? 'Saving...' : 'Save Profile'}</button>
        </form>
    );
}


function DashboardPage() {
    const { user, logout } = useAuth(); // Removed refreshUser as it's now in UserProfileForm
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    if (!user) { return <p>Loading user data...</p>; }

    const isTasker = user.role?.includes('tasker');
    const isProvider = user.role?.includes('provider');

    return (
        <div> {/* No card class here, apply to sections */}
            <div className="card">
                <h2>Dashboard</h2>
                <p>Welcome back, <strong>{user.firstName} {user.lastName}</strong>!</p>
                {/* Display more user info from context */}
                <p>Email: {user.email}</p>
                <p>Role(s): {user.role?.join(', ')}</p>
                {isTasker && <p>Rating: {user.rating?.toFixed(1)}⭐ ({user.ratingCount || 0} reviews)</p>}
                {isTasker && user.ratePerHour > 0 && <p>Hourly Rate: ${user.ratePerHour.toFixed(2)}</p>}

                <hr className="section-divider"/>
                <div style={{ margin: '20px 0', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <Link to="/gigs">Browse All Gigs</Link>
                    <Link to="/feed">Social Feed</Link>
                    {isProvider && <Link to="/find-taskers">Find Taskers</Link>}
                    {isTasker && <Link to="/gigs/matched">Matched Gigs</Link>}
                    {isProvider && <Link to="/gigs/create">Post a New Gig</Link>}
                </div>
            </div>

            <UserProfileForm /> {/* Render the profile form */}

            {isTasker && ( <StripeOnboarding /> )} {/* Stripe onboarding still uses its own card */}

            <div className="card" style={{ marginTop: '20px', textAlign: 'center'}}>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
}

export default DashboardPage;