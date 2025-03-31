/// <reference types="vite/client" />

import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError } from 'axios';

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
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
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
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
      
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

interface ErrorResponse {
  message?: string;
}

// Helper method for error handling
export const handleApiError = (error: unknown): never => {
  const isAxiosErr = (err: unknown): err is AxiosError => {
    return axios.isAxiosError(err);
  };

  if (isAxiosErr(error)) {
    const errorData = error.response?.data as ErrorResponse;
    throw new ApiError(
      errorData?.message || error.message || 'Unknown error',
      error.response?.status || 500,
      error.response?.data
    );
  }
  
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
      const errorData = await response.json().catch(() => ({ message: 'Request failed' } as ErrorResponse));
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