import { API_BASE_URL, APP_CONFIG } from '@/constants';
import type { ApiError, RequestConfig } from '@/types';

/**
 * Modern fetch wrapper with interceptors
 * Follows React 19 patterns - no memoization needed
 */
class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Get auth token from localStorage
   */
  private getToken(): string | null {
    return localStorage.getItem(APP_CONFIG.TOKEN_KEY);
  }

  /**
   * Build full URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  /**
   * Build request headers with auth token
   */
  private buildHeaders(config?: RequestConfig): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge config headers if provided
    if (config?.headers) {
      Object.entries(config.headers).forEach(([key, value]) => {
        if (value) headers[key] = String(value);
      });
    }

    // Add auth token if required (default true)
    const requiresAuth = config?.requiresAuth !== false;
    if (requiresAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Handle API errors with proper typing
   */
  private async handleError(response: Response, requiresAuth: boolean = true): Promise<never> {
    let errorData: ApiError;

    try {
      const data = await response.json();
      errorData = {
        message: data.message || 'An error occurred',
        code: data.code,
        status: response.status,
        errors: data.errors,
      };
    } catch {
      errorData = {
        message: response.statusText || 'An error occurred',
        status: response.status,
      };
    }

    // Handle specific status codes
    // Solo limpiar y redirigir si la petición requería autenticación
    if (response.status === 401 && requiresAuth) {
      // Clear auth data on unauthorized
      localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.REFRESH_TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.USER_KEY);
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    throw errorData;
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    const headers = this.buildHeaders(config);
    const requiresAuth = config?.requiresAuth !== false;

    try {
      const response = await fetch(url, {
        ...config,
        headers,
      });

      if (!response.ok) {
        await this.handleError(response, requiresAuth);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const responseData = await response.json();
      
      // Backend envuelve respuestas en { data: T, message, timestamp, path, method }
      return responseData.data || responseData;
    } catch (error) {
      // Re-throw ApiError as-is
      if ((error as ApiError).status) {
        throw error;
      }

      // Wrap network errors
      throw {
        message: error instanceof Error ? error.message : 'Network error',
        status: 0,
      } as ApiError;
    }
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  post<T, D = unknown>(endpoint: string, data?: D, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  put<T, D = unknown>(endpoint: string, data?: D, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  patch<T, D = unknown>(endpoint: string, data?: D, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const httpClient = new HttpClient(API_BASE_URL);

// Export class for testing
export { HttpClient };
