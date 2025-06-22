import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock data
const mockCategories = [
  {
    main_category: 'Clinical',
    sub_categories: [
      { category_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', sub_category: 'Diagnosis' },
    ],
  },
];

// Mock the global fetch function
global.fetch = vi.fn(async (url, options) => {
  const urlStr = String(url);

  if (urlStr.endsWith('/api/health')) {
    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (urlStr.endsWith('/api/complaint-categories/')) {
    return new Response(JSON.stringify(mockCategories), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (urlStr.endsWith('/api/complaints/') && options?.method === 'POST') {
    const body = options.body ? JSON.parse(options.body.toString()) : {};
    return new Response(
      JSON.stringify({
        complaint_id: 'mock-id-123',
        category_id: body.category_id,
        description: body.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // For any other url, throw an error to fail tests with unhandled requests.
  console.error(`Unhandled request in test setup: ${options?.method || 'GET'} ${urlStr}`);
  return new Response(JSON.stringify({ message: `Unhandled request: ${urlStr}` }), {
    status: 500,
  });
}); 