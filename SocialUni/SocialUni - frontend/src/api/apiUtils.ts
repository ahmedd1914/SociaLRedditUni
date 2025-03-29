import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig } from 'axios';

// Get API URL from environment variables with fallback
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Custom API error class
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Ensure headers object exists
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Type guard for AxiosError
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        // You could also trigger a redirect to login page
      }
      
      // Return a structured error object
      return Promise.reject(
        new ApiError(
          error.response?.data?.message || error.message || 'Unknown error',
          error.response?.status || 500,
          error.response?.data
        )
      );
    }
    return Promise.reject(error);
  }
);

// General API response type
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

// Helper method for error handling
export const handleApiError = (error: unknown): never => {
  // Type guard for AxiosError
  const isAxiosErr = (err: unknown): err is AxiosError => {
    return axios.isAxiosError(err);
  };

  if (isAxiosErr(error)) {
    // Handle axios errors
    throw new ApiError(
      error.response?.data?.message || error.message || 'Unknown error',
      error.response?.status || 500,
      error.response?.data
    );
  }
  
  // Handle non-axios errors
  throw error instanceof Error 
    ? error 
    : new Error('Unknown error occurred');
};

// Fetch wrapper with generics for type safety
export async function fetchApi<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || 'Request failed',
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
} 