import type { components } from '../types/api';
type PatientSummary = components['schemas']['PatientSummary'];
type CaseSummary = components['schemas']['CaseSummary'];
type ComplaintCreate = components['schemas']['ComplaintCreate'];
type Complaint = components['schemas']['Complaint'];
type ComplainantCreate = components['schemas']['ComplainantCreate'];
type Complainant = components['schemas']['Complainant'];
type ComplainantSummary = components['schemas']['ComplainantSummary'];

const apiClient = {
  post: async <T>(url: string, data: Record<string, unknown>): Promise<T> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: 'API request failed with non-JSON response',
      }));
      throw new Error(errorData.detail || 'API request failed');
    }

    return response.json();
  },
  getPatients: async (q?: string): Promise<PatientSummary[]> => {
    const url = q ? `/api/patients?q=${encodeURIComponent(q)}` : '/api/patients';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch patients');
    return response.json();
  },
  getCases: async (patient_id?: string): Promise<CaseSummary[]> => {
    const url = patient_id ? `/api/cases?patient_id=${encodeURIComponent(patient_id)}` : '/api/cases';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch cases');
    return response.json();
  },
  createComplaint: async (data: ComplaintCreate): Promise<Complaint> => {
    return apiClient.post<Complaint>('/api/complaints/', data);
  },
  getComplainants: async (q?: string): Promise<ComplainantSummary[]> => {
    const url = q ? `/api/complainants?q=${encodeURIComponent(q)}` : '/api/complainants';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch complainants');
    return response.json();
  },
  createComplainant: async (data: ComplainantCreate): Promise<Complainant> => {
    return apiClient.post<Complainant>('/api/complainants/', data);
  },
};

export default apiClient;