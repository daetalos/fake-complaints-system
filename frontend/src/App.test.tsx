import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock fetch for API health check
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ status: 'healthy' }),
});

describe('App', () => {
  it('renders the main layout and home page', async () => {
    // Render the App component, which now includes the router
    render(<App />);

    // Check for content that's actually rendered - the layout navigation
    expect(screen.getAllByText('SpectrumCare')[0]).toBeInTheDocument();

    // Check for the navigation buttons from the Layout component
    expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new complaint/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();

    // Check that the app renders without crashing and shows the layout
    expect(screen.getAllByText('Healthcare Management')[0]).toBeInTheDocument();
  });
}); 