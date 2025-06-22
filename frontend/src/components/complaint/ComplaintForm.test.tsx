import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ComplaintForm from './ComplaintForm';

// Mock the apiClient to control API calls in tests
vi.mock('../../services/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

import { apiClient } from '../../services/apiClient';

describe('ComplaintForm', () => {

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
    const mockResponse = {
      complaint_id: '123e4567-e89b-12d3-a456-426614174000',
      description: 'Test complaint',
      created_at: new Date(),
      updated_at: new Date(),
    };
    (apiClient.post as vi.Mock).mockResolvedValue(mockResponse);

    render(<ComplaintForm />);

    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(descriptionInput, { target: { value: 'This is a test complaint.' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/complaint submitted successfully!/i)).toBeInTheDocument();
    });

    expect(apiClient.post).toHaveBeenCalledWith('/complaints', { description: 'This is a test complaint.' });
  });

  it('should show an error message if the API call fails', async () => {
    const errorMessage = 'Something went wrong';
    (apiClient.post as vi.Mock).mockRejectedValue(new Error(errorMessage));

    render(<ComplaintForm />);

    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(descriptionInput, { target: { value: 'This will fail.' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });
}); 