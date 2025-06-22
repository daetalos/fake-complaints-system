const apiClient = {
  post: async <T>(url: string, data: Record<string, unknown>): Promise<T> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: 'API request failed with non-JSON response',
      }));
      throw new Error(errorData.detail || 'API request failed');
    }

    return response.json();
  },
};

export default apiClient;