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
    <form onSubmit={submit}>
      <h2>Register</h2>
      {/* Controlled form inputs */}
      <input placeholder="username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
      <input placeholder="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
      <input placeholder="password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
      <button type="submit">Register</button>
      
      {/* Error display */}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}


