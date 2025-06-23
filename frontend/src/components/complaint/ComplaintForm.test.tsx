import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ComplaintForm from './ComplaintForm';

// Since we have a global fetch mock in setup.ts, we don't need to mock it here
// for the "happy path" tests. We only need to override it if we want to test
// a specific failure case.

describe('ComplaintForm', () => {
  beforeEach(() => {
    // Reset mocks if any test overrides the global mock
    vi.restoreAllMocks();
  });

  it('should render the form and load categories', async () => {
    render(<ComplaintForm />);
    expect(screen.getByRole('heading', { name: /submit a new complaint/i })).toBeInTheDocument();

    // Wait for categories to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('Clinical')).toBeInTheDocument();
    });
  });

  it('should show a validation error if fields are not filled', async () => {
    render(<ComplaintForm />);

    // Wait for the component to be ready
    await waitFor(() => {
      expect(screen.getByText('Clinical')).toBeInTheDocument();
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    // First select patient and case to enable submit button
    const patientSelect = screen.getByLabelText('Patient:');
    fireEvent.change(patientSelect, { target: { value: 'patient-1' } });
    
    await waitFor(() => {
      expect(screen.getByLabelText('Case:')).toBeEnabled();
      expect(screen.getByText(/CASE-REF-001/)).toBeInTheDocument();
    });
    
    const caseSelect = screen.getByLabelText('Case:');
    fireEvent.change(caseSelect, { target: { value: 'case-1' } });
    
    // Wait for submit button to be enabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled();
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Error: Please fill in all fields\.?/i)).toBeInTheDocument();
  });

  it('should enable subcategory dropdown after selecting a main category', async () => {
    render(<ComplaintForm />);
    await waitFor(() => expect(screen.getByText('Clinical')).toBeInTheDocument());

    const mainCategorySelect = screen.getByLabelText(/main category/i);
    const subCategorySelect = screen.getByLabelText(/subcategory/i);

    expect(subCategorySelect).toBeDisabled();

    fireEvent.change(mainCategorySelect, { target: { value: 'Clinical' } });

    await waitFor(() => {
      expect(subCategorySelect).toBeEnabled();
      // The mock data from setup.ts has "Diagnosis" as a sub-category for "Clinical"
      expect(screen.getByText('Diagnosis')).toBeInTheDocument();
    });
  });

  it('should submit the form and show a success message', async () => {
    render(<ComplaintForm />);
    await waitFor(() => {
      expect(screen.getByText('Clinical')).toBeInTheDocument();
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    // 1. Select Main Category
    fireEvent.change(screen.getByLabelText(/main category/i), { target: { value: 'Clinical' } });
    await waitFor(() => expect(screen.getByLabelText(/subcategory/i)).toBeEnabled());

    // 2. Select Subcategory
    // The value should be the category_id from our mock data in setup.ts
    fireEvent.change(screen.getByLabelText(/subcategory/i), {
      target: { value: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
    });

    // 3. Select Patient
    const patientSelect = screen.getByLabelText('Patient:');
    fireEvent.change(patientSelect, { target: { value: 'patient-1' } });
    
    await waitFor(() => {
      expect(screen.getByLabelText('Case:')).toBeEnabled();
      expect(screen.getByText(/CASE-REF-001/)).toBeInTheDocument();
    });
    
    // 4. Select Case
    const caseSelect = screen.getByLabelText('Case:');
    fireEvent.change(caseSelect, { target: { value: 'case-1' } });

    // 5. Fill Description
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'The diagnosis was incorrect.' },
    });

    // 6. Wait for submit button to be enabled and submit
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled();
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // 7. Assert Success
    await waitFor(() => {
      // The mock ID comes from the global mock in setup.ts
      expect(screen.getByText(/Complaint submitted successfully! Complaint ID: mock-id-123/i)).toBeInTheDocument();
    });
  });

  it('should show an error message if the API call to submit fails', async () => {
    // Override the global fetch mock for this specific test case
    const errorMessage = 'Internal Server Error';
    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.endsWith('/api/complaints/')) {
        return new Response(JSON.stringify({ detail: errorMessage }), { status: 500 });
      } else if (urlStr.endsWith('/api/complaint-categories/')) {
        return new Response(
          JSON.stringify([
            {
              main_category: 'Clinical',
              sub_categories: [{ category_id: 'id-1', sub_category: 'Diagnosis' }],
            },
          ]),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } else if (urlStr.endsWith('/api/patients')) {
        return new Response(
          JSON.stringify([
            {
              patient_id: 'patient-1',
              name: 'John Doe',
              dob: '1980-01-01',
            },
          ]),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } else if (urlStr.includes('/api/cases')) {
        return new Response(
          JSON.stringify([
            {
              case_id: 'case-1',
              case_reference: 'CASE-REF-001',
              patient_id: 'patient-1',
            },
          ]),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // Fallback for any other requests
      return new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<ComplaintForm />);
    await waitFor(() => {
      expect(screen.getByText('Clinical')).toBeInTheDocument();
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByLabelText(/main category/i), { target: { value: 'Clinical' } });
    await waitFor(() => expect(screen.getByLabelText(/subcategory/i)).toBeEnabled());
    fireEvent.change(screen.getByLabelText(/subcategory/i), { target: { value: 'id-1' } });
    
    // Select patient and case
    const patientSelect = screen.getByLabelText('Patient:');
    fireEvent.change(patientSelect, { target: { value: 'patient-1' } });
    
    await waitFor(() => {
      expect(screen.getByLabelText('Case:')).toBeEnabled();
      expect(screen.getByText(/CASE-REF-001/)).toBeInTheDocument();
    });
    
    const caseSelect = screen.getByLabelText('Case:');
    fireEvent.change(caseSelect, { target: { value: 'case-1' } });
    
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'This will fail.' },
    });

    // Wait for submit button to be enabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled();
    });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Assert on the error message from the failed submission
    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('should require patient and case selection before enabling submit', async () => {
    render(<ComplaintForm />);
    await waitFor(() => expect(screen.getByText('Clinical')).toBeInTheDocument());

    // Wait for patients to load
    await waitFor(() => {
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });
    screen.debug(); // Debug after patients load

    const patientSelect = screen.getByLabelText('Patient:');
    fireEvent.change(patientSelect, { target: { value: 'patient-1' } });

    // Wait for cases to load and be enabled
    await waitFor(() => {
      expect(screen.getByText('Case:')).toBeEnabled();
      expect(screen.getByText(/CASE-REF-001/)).toBeInTheDocument();
    });
    screen.debug(); // Debug after cases load

    // Select case
    const caseSelect = screen.getByLabelText('Case:');
    fireEvent.change(caseSelect, { target: { value: 'case-1' } });
    // Fill other required fields
    fireEvent.change(screen.getByLabelText(/main category/i), { target: { value: 'Clinical' } });
    await waitFor(() => expect(screen.getByLabelText(/subcategory/i)).toBeEnabled());
    fireEvent.change(screen.getByLabelText(/subcategory/i), { target: { value: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test complaint' } });
    // Now submit should be enabled
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeEnabled();
  });

  it('should show a summary panel when patient and case are selected', async () => {
    render(<ComplaintForm />);
    await waitFor(() => expect(screen.getByText('Clinical')).toBeInTheDocument());
    await waitFor(() => {
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });
    screen.debug(); // Debug after patients load
    const patientSelect = screen.getByLabelText('Patient:');
    fireEvent.change(patientSelect, { target: { value: 'patient-1' } });
    await waitFor(() => {
      expect(screen.getByLabelText('Case:')).toBeEnabled();
      expect(screen.getByText(/CASE-REF-001/)).toBeInTheDocument();
    });
    screen.debug(); // Debug after cases load
    const caseSelect = screen.getByLabelText('Case:');
    fireEvent.change(caseSelect, { target: { value: 'case-1' } });
    expect(screen.getByText(/Selected Patient:/i)).toBeInTheDocument();
    expect(screen.getByText(/Selected Case:/i)).toBeInTheDocument();
  });
}); 