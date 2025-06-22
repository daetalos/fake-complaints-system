import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ComplaintForm from './ComplaintForm';

describe('ComplaintForm', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.restoreAllMocks();
  });

  it('should render the form correctly', () => {
    render(<ComplaintForm />);
    expect(screen.getByRole('heading', { name: /submit a new complaint/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should show a validation error if description is empty', async () => {
    render(<ComplaintForm />);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/description cannot be empty/i)).toBeInTheDocument();
    });
  });

  it('should submit the form and show a success message', async () => {
    const mockComplaintId = '123e4567-e89b-12d3-a456-426614174000';
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ complaint_id: mockComplaintId }),
    } as Response);

    render(<ComplaintForm />);

    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(descriptionInput, { target: { value: 'This is a test complaint.' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(`Complaint submitted successfully! Complaint ID: ${mockComplaintId}`)).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/complaints/', expect.any(Object));
  });

  it('should show an error message if the API call fails', async () => {
    const errorMessage = 'Something went wrong';
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ detail: errorMessage }),
    } as Response);

    render(<ComplaintForm />);

    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(descriptionInput, { target: { value: 'This will fail.' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/complaints/', expect.any(Object));
  });
}); 