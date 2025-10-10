import React from 'react';
import { Navigate } from 'react-router-dom';

// Wrapper for routes that require authentication
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token'); // Check for saved token
  // If not logged in, redirect to login page
  if (!token) return <Navigate to="/login" replace />;
  // If logged in, render the requested route's content
  return children;
}
