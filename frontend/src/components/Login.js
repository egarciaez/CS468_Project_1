import React, { useState } from 'react';
import { login } from '../services/auth';

// Login form component
export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);

  // When user submits the form
  async function submit(e) {
    e.preventDefault();
    try {
      await login(form); // Call backend to authenticate user
      onLogin && onLogin(); // Callback to parent (usually redirects)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Login</h2>
      {/* Controlled form fields */}
      <input placeholder="username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
      <input placeholder="password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
      <button type="submit">Login</button>

      {/* Show error if login fails */}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}


