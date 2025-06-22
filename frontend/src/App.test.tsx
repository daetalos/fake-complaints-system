import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the main layout and home page', async () => {
    // Render the App component, which now includes the router
    render(<App />);

    // Check for a heading from the Home component
    expect(
      await screen.findByRole('heading', { name: /welcome to the complaint management system/i })
    ).toBeInTheDocument();

    // Check for the navigation links from the Layout component
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /submit complaint/i })).toBeInTheDocument();
  });
}); 