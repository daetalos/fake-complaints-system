import React, { useState, useEffect } from 'react';
import type { components } from '../../types/api';
import apiClient from '../../services/apiClient';

type ComplaintCategory = components['schemas']['ComplaintCategory'];
type SubCategory = components['schemas']['SubCategory'];
type PatientSummary = components['schemas']['PatientSummary'];
type CaseSummary = components['schemas']['CaseSummary'];

const ComplaintForm = () => {
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState<ComplaintCategory[]>([]);
    const [selectedMainCategory, setSelectedMainCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [patients, setPatients] = useState<PatientSummary[]>([]);
    const [patientQuery, setPatientQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null);
    const [cases, setCases] = useState<CaseSummary[]>([]);
    const [selectedCase, setSelectedCase] = useState<CaseSummary | null>(null);

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

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await apiClient.getPatients(patientQuery);
                setPatients(data);
            } catch (err) {
                setError('Failed to fetch patients');
            }
        };
        fetchPatients();
    }, [patientQuery]);

    useEffect(() => {
        if (selectedPatient) {
            const fetchCases = async () => {
                try {
                    const data = await apiClient.getCases(selectedPatient.patient_id);
                    setCases(data);
                } catch (err) {
                    setError('Failed to fetch cases');
                }
            };
            fetchCases();
        } else {
            setCases([]);
            setSelectedCase(null);
        }
    }, [selectedPatient]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        if (!description || !selectedSubCategory || !selectedPatient || !selectedCase) {
            setError('Please fill in all fields.');
            setSubmitting(false);
            return;
        }

        try {
            const data = {
                description,
                category_id: selectedSubCategory,
                patient_id: selectedPatient.patient_id,
                case_id: selectedCase.case_id,
            };
            const response = await apiClient.createComplaint(data);
            setSuccess(`Complaint submitted successfully! Complaint ID: ${response.complaint_id}`);
            setDescription('');
            setSelectedMainCategory('');
            setSelectedSubCategory('');
            setSelectedPatient(null);
            setSelectedCase(null);
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
                    <label htmlFor="patient-select">Patient:</label>
                    <input
                        id="patient-search"
                        type="text"
                        value={patientQuery}
                        onChange={(e) => setPatientQuery(e.target.value)}
                        placeholder="Search by name or ID"
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                    <select
                        id="patient-select"
                        value={selectedPatient?.patient_id || ''}
                        onChange={(e) => {
                            const patient = patients.find(p => p.patient_id === e.target.value) || null;
                            setSelectedPatient(patient);
                        }}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    >
                        <option value="">Select a Patient</option>
                        {patients.map((patient) => (
                            <option key={patient.patient_id} value={patient.patient_id}>
                                {patient.name} (DOB: {patient.dob})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="case-select">Case:</label>
                    <select
                        id="case-select"
                        value={selectedCase?.case_id || ''}
                        onChange={(e) => {
                            const c = cases.find(cs => cs.case_id === e.target.value) || null;
                            setSelectedCase(c);
                        }}
                        disabled={!selectedPatient}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    >
                        <option value="">Select a Case</option>
                        {cases.map((c) => (
                            <option key={c.case_id} value={c.case_id}>
                                {c.case_reference}
                            </option>
                        ))}
                    </select>
                </div>
                {selectedPatient && selectedCase && (
                    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                        <strong>Selected Patient:</strong> {selectedPatient.name} (DOB: {selectedPatient.dob})<br />
                        <strong>Selected Case:</strong> {selectedCase.case_reference}
                    </div>
                )}
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
                <button type="submit" disabled={submitting || !selectedPatient || !selectedCase}>
                    {submitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
    );
};

export default ComplaintForm; 