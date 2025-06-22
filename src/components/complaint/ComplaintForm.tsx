import React, { useState } from 'react';
import { apiClient } from '../../services/apiClient';
import { logger } from '../../services/logger';
import { Complaint, UUID } from '../../types';

interface ComplaintCreateResponse extends Complaint {
    complaint_id: UUID;
}


const ComplaintForm: React.FC = () => {
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        logger.logUserAction('submit_complaint_form');
        setSubmitting(true);
        setError('');
        setSuccess('');

        if (!description) {
            setError('Description cannot be empty.');
            setSubmitting(false);
            return;
        }

        try {
            const newComplaint = await apiClient.post<ComplaintCreateResponse>('/complaints', { description });
            setSuccess(`Complaint submitted successfully! Complaint ID: ${newComplaint.complaint_id}`);
            setDescription(''); // Clear the form
            logger.info('Complaint submitted successfully', { complaint_id: newComplaint.complaint_id });
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                logger.error('Failed to submit complaint', { error: err.message }, err);
            } else {
                const errorMessage = 'An unknown error occurred.';
                setError(errorMessage);
                logger.error('Failed to submit complaint with unknown error', { error: String(err) });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <h2>Submit a New Complaint</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
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