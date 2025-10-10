// src/services/api.js

// Import Axios for making HTTP requests
import axios from 'axios';

// Create a reusable Axios instance for all API calls
const api = axios.create({
  baseURL: 'http://localhost:5000/api',   // Backend API base URL
  // If you later use cookies, set withCredentials: true
});

// Interceptor to add token automatically
// Interceptor runs before each request is sent
// It automatically attaches the JWT token to Authorization header if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Retrieve token from browser storage
  if (token) config.headers.Authorization = `Bearer ${token}`; // Add token to request
  return config;
});

// Export this configured Axios instance so all services use the same setup
export default api;
