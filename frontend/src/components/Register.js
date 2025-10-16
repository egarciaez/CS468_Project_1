// src/components/Register.js
import React, { useState } from 'react';
import { register } from '../services/auth';

// Registration form component
export default function Register({ onRegistered }) {
  // Track form inputs and error state
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState(null);

  // Handles form submission
  async function submit(e) {
    e.preventDefault();  // Prevent page reload
    try {
      await register(form);  // Call API to register user
      onRegistered && onRegistered();  // Callback if registration succeeds
    } catch (err) {
      // Display error message from backend or fallback
      setError(err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="auth-container">
      <form onSubmit={submit}>
        <h2>Create Account</h2>
        <p style={{ color: '#6c757d', marginBottom: '2rem' }}>Join us and start organizing your tasks</p>
        
        {/* Controlled form inputs */}
        <input 
          placeholder="Username" 
          value={form.username} 
          onChange={e => setForm({...form, username: e.target.value})} 
          required
        />
        <input 
          placeholder="Email" 
          type="email"
          value={form.email} 
          onChange={e => setForm({...form, email: e.target.value})} 
          required
        />
        <input 
          placeholder="Password" 
          type="password" 
          value={form.password} 
          onChange={e => setForm({...form, password: e.target.value})} 
          required
        />
        <button type="submit">Create Account</button>
        
        {/* Error display */}
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}


