import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the fetched message', async () => {
    // Render the App component
    render(<App />);

    // Initially, the loading message should be present
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for the "Hello from the backend!" message to appear.
    // We use `waitFor` because the data fetching is asynchronous.
    await waitFor(() => {
      // The text must include the quotes, as rendered by the component.
      expect(screen.getByText('"Hello from the backend!"')).toBeInTheDocument();
    });

    // After the message appears, the loading text should be gone.
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
}); 