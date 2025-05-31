// src/pages/GigCreatePage.js
import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import styles from "./GigCreatePage.module.css"; // CREATE THIS CSS FILE
import { CATEGORY_ENUM } from '../utils/constants';
import apiClient from '../api/axiosConfig';
import logger from '../utils/logger';
// import InputField from '../components/Shared/InputField'; // If you have a global one

// Reusable FormInput for this page
const FormInput = ({ label, name, type = "text", value, onChange, required = false, placeholder = "", ...props }) => (
    <div className={styles.formGroup}>
        <label htmlFor={name} className={styles.label}>{label}</label>
        <input id={name} name={name} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} className={styles.input} {...props} />
    </div>
);
const TextAreaInput = ({ label, name, value, onChange, required = false, placeholder = "", rows = 4, ...props }) => (
    <div className={styles.formGroup}>
        <label htmlFor={name} className={styles.label}>{label}</label>
        <textarea id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} rows={rows} className={styles.textarea} {...props} />
    </div>
);
const SelectInput = ({ label, name, value, onChange, required = false, children }) => (
     <div className={styles.formGroup}>
        <label htmlFor={name} className={styles.label}>{label}</label>
        <select id={name} name={name} value={value} onChange={onChange} className={styles.select} required>{children}</select>
    </div>
);


function GigCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: CATEGORY_ENUM[0] || "",
    subcategory: "", // Add if needed
    cost: "", // For fixed
    ratePerHour: "", // For hourly
    paymentType: "fixed", // To toggle between cost and ratePerHour
    location: { address: "", city: "", state: "", postalCode: "", country: "" },
    isRemote: false,
    skills: "", // Comma-separated string
    // deadline: "",
    // duration: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("location.")) {
        const field = name.split('.')[1];
        setFormData(prev => ({ ...prev, location: { ...prev.location, [field]: value }}));
    } else {
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
    setError('');
  };

  const handleSubmitGig = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');

    if (!formData.title || !formData.category || !formData.description) {
        setError("Title, category, and description are required."); setLoading(false); return;
    }
    if (formData.paymentType === 'fixed' && (!formData.cost || parseFloat(formData.cost) <= 0)) {
        setError("A valid fixed cost is required."); setLoading(false); return;
    }
    if (formData.paymentType === 'hourly' && (!formData.ratePerHour || parseFloat(formData.ratePerHour) <= 0)) {
         setError("A valid hourly rate is required."); setLoading(false); return;
    }

    const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        subcategory: formData.subcategory.trim() || undefined,
        cost: formData.paymentType === 'fixed' ? parseFloat(formData.cost) : undefined,
        ratePerHour: formData.paymentType === 'hourly' ? parseFloat(formData.ratePerHour) : undefined,
        isRemote: formData.isRemote,
        location: Object.values(formData.location).some(val => val) ? formData.location : undefined,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
    };
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    logger.debug("Posting new gig:", payload);
    try {
        const response = await apiClient.post('/gigs', payload);
        alert("Your gig has been posted successfully!");
        logger.info("Gig posted successfully:", response.data.data.gig._id);
        navigate(`/gigs/${response.data.data.gig._id}`);
    } catch (err) {
        logger.error("Error posting gig:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to post your gig.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}> {/* Main wrapper for styling */}
        <Link to="/feed" className={styles.backLink}>&larr; Back to Feed</Link>
        <div className={styles.formWrapper}> {/* For centering and styling the form card */}
            <h1 className={styles.pageTitle}>Post a New Gig</h1>
            <p className={styles.pageSubtitle}>Describe the task you need help with.</p>

            <form onSubmit={handleSubmitGig}>
                <FormInput label="Gig Title*" name="title" value={formData.title} onChange={handleInputChange} required maxLength={100} />
                <TextAreaInput label="Detailed Description*" name="description" value={formData.description} onChange={handleInputChange} required rows={6} />

                <SelectInput label="Category*" name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="" disabled>Select category</option>
                    {CATEGORY_ENUM.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </SelectInput>
                {/* TODO: Add Subcategory based on selected category */}
                <FormInput label="Subcategory (Optional)" name="subcategory" value={formData.subcategory} onChange={handleInputChange} />

                <h3 className={styles.sectionTitle}>Payment</h3>
                <SelectInput label="Payment Type*" name="paymentType" value={formData.paymentType} onChange={handleInputChange} required>
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                </SelectInput>

                {formData.paymentType === 'fixed' && (
                    <FormInput label="Total Budget ($)*" name="cost" type="number" value={formData.cost} onChange={handleInputChange} min="1" step="0.01" required />
                )}
                {formData.paymentType === 'hourly' && (
                    <FormInput label="Hourly Rate ($/hr)*" name="ratePerHour" type="number" value={formData.ratePerHour} onChange={handleInputChange} min="1" step="0.01" required />
                )}

                <h3 className={styles.sectionTitle}>Location & Details</h3>
                <div> <label><input type="checkbox" name="isRemote" checked={formData.isRemote} onChange={handleInputChange} /> This task can be done remotely</label> </div>
                {!formData.isRemote && (
                    <>
                        <FormInput label="Street Address (Optional)" name="location.address" value={formData.location.address} onChange={handleInputChange} />
                        <div className={styles.row}>
                            <FormInput label="City (Optional)" name="location.city" value={formData.location.city} onChange={handleInputChange} />
                            <FormInput label="State/Province (Optional)" name="location.state" value={formData.location.state} onChange={handleInputChange} />
                        </div>
                        <div className={styles.row}>
                            <FormInput label="Postal Code (Optional)" name="location.postalCode" value={formData.location.postalCode} onChange={handleInputChange} />
                            <FormInput label="Country (Optional)" name="location.country" value={formData.location.country} onChange={handleInputChange} />
                        </div>
                    </>
                )}
                <FormInput label="Required Skills (comma-separated, optional)" name="skills" value={formData.skills} onChange={handleInputChange} placeholder="e.g., graphic design, writing, data entry" />

                {error && <p className="error-message">{error}</p>}
                <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? 'Posting...' : 'Post Gig'}
                </button>
            </form>
        </div>
    </div>
  );
}
export default GigCreatePage;