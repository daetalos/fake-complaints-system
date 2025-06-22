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
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Please fill in all fields/i)).toBeInTheDocument();
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
    await waitFor(() => expect(screen.getByText('Clinical')).toBeInTheDocument());

    // 1. Select Main Category
    fireEvent.change(screen.getByLabelText(/main category/i), { target: { value: 'Clinical' } });
    await waitFor(() => expect(screen.getByLabelText(/subcategory/i)).toBeEnabled());

    // 2. Select Subcategory
    // The value should be the category_id from our mock data in setup.ts
    fireEvent.change(screen.getByLabelText(/subcategory/i), {
      target: { value: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
    });

    // 3. Fill Description
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'The diagnosis was incorrect.' },
    });

    // 4. Submit
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // 5. Assert Success
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
      }
      // Fallback to a default response for the categories call
      return new Response(
        JSON.stringify([
          {
            main_category: 'Clinical',
            sub_categories: [{ category_id: 'id-1', sub_category: 'Diagnosis' }],
          },
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });

    render(<ComplaintForm />);
    await waitFor(() => expect(screen.getByText('Clinical')).toBeInTheDocument());

    // Fill form
    fireEvent.change(screen.getByLabelText(/main category/i), { target: { value: 'Clinical' } });
    await waitFor(() => expect(screen.getByLabelText(/subcategory/i)).toBeEnabled());
    fireEvent.change(screen.getByLabelText(/subcategory/i), { target: { value: 'id-1' } });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'This will fail.' },
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Assert on the error message from the failed submission
    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });
}); 