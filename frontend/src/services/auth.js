import api from './api';

// Function to register a new user
export async function register({ username, password, email }) {
  const res = await api.post('/auth/register', { username, password, email });
  return res.data;  // Return backend response (new user info)
}

// Function to log in existing users
export async function login({ username, password }) {
  const res = await api.post('/auth/login', { username, password }); // POST /api/auth/login
  // If successful, backend returns a JWT token
  if (res.data.token) {
    // Save the token and username in browser localStorage for session persistence
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('username', res.data.user.username);
  }
  return res.data;
}

// Function to log out the user by removing local data
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
}

// Helper to get the saved token
export function getToken() {
  return localStorage.getItem('token');
}
