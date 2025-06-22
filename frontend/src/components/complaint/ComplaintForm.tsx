import React, { useState, useEffect } from 'react';
import type { components } from '../../types/api';

type ComplaintCategory = components['schemas']['ComplaintCategory'];
type SubCategory = components['schemas']['SubCategory'];

const ComplaintForm = () => {
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState<ComplaintCategory[]>([]);
    const [selectedMainCategory, setSelectedMainCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/complaint-categories/');
                if (!response.ok) {
                    throw new Error('Failed to fetch categories.');
                }
                const data: ComplaintCategory[] = await response.json();
                setCategories(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred while fetching categories.');
                }
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        if (!description || !selectedSubCategory) {
            setError('Please fill in all fields.');
            setSubmitting(false);
            return;
        }

        try {
            const apiUrl = `/api/complaints/`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description, category_id: selectedSubCategory }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to submit complaint.');
            }

            const data = await response.json();
            setSuccess(`Complaint submitted successfully! Complaint ID: ${data.complaint_id}`);
            setDescription('');
            setSelectedMainCategory('');
            setSelectedSubCategory('');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const subCategoryOptions = selectedMainCategory
        ? categories.find(c => c.main_category === selectedMainCategory)?.sub_categories
        : [];

    return (
        <div>
            <h2>Submit a New Complaint</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="main-category">Main Category:</label>
                    <select
                        id="main-category"
                        value={selectedMainCategory}
                        onChange={(e) => {
                            setSelectedMainCategory(e.target.value);
                            setSelectedSubCategory(''); // Reset sub-category
                        }}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    >
                        <option value="">Select a Main Category</option>
                        {categories.map((category) => (
                            <option key={category.main_category} value={category.main_category}>
                                {category.main_category}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="sub-category">Subcategory:</label>
                    <select
                        id="sub-category"
                        value={selectedSubCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        disabled={!selectedMainCategory}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    >
                        <option value="">Select a Subcategory</option>
                        {subCategoryOptions?.map((sub: SubCategory) => (
                            <option key={sub.category_id} value={sub.category_id}>
                                {sub.sub_category}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
    );
};

export default ComplaintForm; 