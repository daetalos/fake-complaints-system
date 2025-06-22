import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the global fetch function
globalThis.fetch = vi.fn((url) => {
  // Check if the URL string ends with the desired path, making the mock
  // independent of the base URL.
  if (String(url).endsWith('/api/message')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: 'Hello from the backend!' }),
    } as Response);
  }
  // For any other url, throw an error
  return Promise.reject(new Error(`Unhandled request: ${url}`));
}); 