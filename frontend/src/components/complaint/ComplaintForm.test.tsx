import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ComplaintForm from './ComplaintForm';

// Mock the API client
vi.mock('../../services/apiClient', () => ({
  default: {
    getComplainants: vi.fn().mockResolvedValue([]),
    createComplainant: vi.fn().mockResolvedValue({
      complainant_id: 'mock-complainant-123',
      name: 'Test User',
      email: 'test@example.com',
      address_line1: '123 Test Street',
      address_line2: null,
      city: 'Test City',
      postcode: 'T1 1AA',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
    createComplaint: vi.fn().mockResolvedValue({
      complaint_id: 'mock-complaint-123',
      description: 'Test complaint',
      category_id: 'mock-category-123',
      complainant_id: 'mock-complainant-123',
      patient_id: 'mock-patient-123',
      case_id: 'mock-case-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
    getPatients: vi.fn().mockResolvedValue([
      {
        patient_id: 'patient-123',
        name: 'John Patient',
        dob: '1990-01-01T00:00:00Z'
      }
    ]),
  },
}));

// Mock fetch for categories and cases
global.fetch = vi.fn().mockImplementation((url) => {
  const urlStr = String(url);
  
  if (urlStr.includes('/api/complaint-categories/')) {
    return Promise.resolve(new Response(JSON.stringify([
      {
        main_category: 'Clinical',
        sub_categories: [
          { category_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', sub_category: 'Diagnosis' },
          { category_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480', sub_category: 'Treatment' },
        ],
      },
      {
        main_category: 'Administrative',
        sub_categories: [
          { category_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481', sub_category: 'Billing' },
        ],
      },
    ]), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  }
  
  if (urlStr.includes('/api/cases')) {
    return Promise.resolve(new Response(JSON.stringify([
      {
        case_id: 'case-456',
        case_reference: 'CASE-2024-001',
        patient_id: 'patient-123'
      }
    ]), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  }
  
  return Promise.resolve(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
});

describe('ComplaintForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the complaint form with stepper', async () => {
    render(<ComplaintForm />);
    
    // Check for the main heading - use getAllByText to handle multiple elements
    expect(screen.getAllByText('Complaint Details')[0]).toBeInTheDocument();
    
    // Check for the stepper - use getAllByText since "Complainant Information" appears in multiple places
    const complainantInfoElements = screen.getAllByText('Complainant Information');
    expect(complainantInfoElements.length).toBeGreaterThan(0);
    
    // Check that we're on the first step - look for content that's actually rendered
    expect(screen.getByText('Search for existing complainant (optional)')).toBeInTheDocument();
  });

  it('should show form validation errors', async () => {
    render(<ComplaintForm />);
    
    // Wait for form to be ready
    await waitFor(() => {
      expect(screen.getAllByText('Complaint Details')[0]).toBeInTheDocument();
    });

    // Try to click Next without filling required fields
    const nextButton = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Complainant name is required')).toBeInTheDocument();
    });
  });

  it('should load categories on mount', async () => {
    render(<ComplaintForm />);
    
    // Wait for categories to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/complaint-categories/');
    });
  });

  it('should handle form navigation', async () => {
    render(<ComplaintForm />);
    
    // Wait for form to be ready
    await waitFor(() => {
      expect(screen.getAllByText('Complaint Details')[0]).toBeInTheDocument();
    });

    // Check that the Next button is present and can be clicked
    const nextButton = screen.getByRole('button', { name: 'Next' });
    expect(nextButton).toBeInTheDocument();
    
    // Check that the stepper is working
    expect(screen.getAllByText('Complainant Information')[0]).toBeInTheDocument();
    expect(screen.getByText('Search for existing complainant (optional)')).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error for categories
    vi.mocked(global.fetch).mockRejectedValueOnce('Network error'); // Non-Error object to trigger fallback message
    
    render(<ComplaintForm />);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch categories/)).toBeInTheDocument();
    });
  });
}); 