import { logger } from './logger';

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const startTime = Date.now();
    const url = `${import.meta.env.VITE_API_BASE_URL || ''}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
      });

      const duration = Date.now() - startTime;
      
      logger.logPerformance(`API: ${endpoint}`, duration, {
        method: options.method || 'GET',
        status: response.status,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        const apiError: ApiError = {
          message: errorData.detail || `HTTP ${response.status}`,
          code: errorData.error || 'API_ERROR',
          status: response.status,
        };

        logger.error('API request failed', {
          endpoint,
          method: options.method || 'GET',
          status: response.status,
          duration,
        });
        
        throw new Error(apiError.message);
      }
      
      return response.json();
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('API request error', {
        endpoint,
        method: options.method || 'GET',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, error instanceof Error ? error : undefined);
      
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(); 