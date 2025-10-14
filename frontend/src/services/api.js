/**
 * API Service - Centralized HTTP client for backend communication
 * 
 * This module provides a configured Axios instance for making API calls to the backend.
 * It handles:
 * - Base URL configuration
 * - Automatic JWT token attachment
 * - Request/response interceptors
 * - Consistent error handling across the application
 * 
 * All frontend components should use this service instead of direct Axios calls
 * to ensure consistent authentication and error handling.
 */

import axios from 'axios';

/**
 * Configured Axios instance for API communication
 * 
 * Features:
 * - Base URL points to backend API server
 * - Automatic JWT token attachment via request interceptor
 * - Consistent configuration across all API calls
 */
const api = axios.create({
  baseURL: 'http://localhost:5000/api',   // Backend API base URL
  // Note: If using cookies for authentication, set withCredentials: true
});

/**
 * Request Interceptor - Automatically adds JWT token to all requests
 * 
 * This interceptor runs before every API request and:
 * 1. Retrieves the JWT token from localStorage
 * 2. Adds it to the Authorization header if available
 * 3. Ensures all authenticated requests include the token
 * 
 * @param {Object} config - Axios request configuration object
 * @returns {Object} Modified request configuration
 */
api.interceptors.request.use((config) => {
  // Get JWT token from browser's local storage
  const token = localStorage.getItem('token');
  
  // If token exists, add it to the Authorization header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

/**
 * Response Interceptor - Handles common API errors
 * 
 * This interceptor runs after every API response and can:
 * - Handle 401 Unauthorized responses (token expired)
 * - Handle 403 Forbidden responses (insufficient permissions)
 * - Provide consistent error handling across the app
 * 
 * @param {Object} response - Axios response object
 * @returns {Object} Response object
 * @param {Function} error - Error handler for failed requests
 */
api.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle common API errors
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Re-throw the error so components can handle it
    return Promise.reject(error);
  }
);

// Export the configured API instance for use throughout the application
export default api;
