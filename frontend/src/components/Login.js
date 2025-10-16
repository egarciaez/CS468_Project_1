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
    <div className="auth-container">
      <form onSubmit={submit}>
        <h2>Welcome Back</h2>
        <p style={{ color: '#6c757d', marginBottom: '2rem' }}>Sign in to your account</p>
        
        {/* Controlled form fields */}
        <input 
          placeholder="Username" 
          value={form.username} 
          onChange={e => setForm({...form, username: e.target.value})} 
          required
        />
        <input 
          placeholder="Password" 
          type="password" 
          value={form.password} 
          onChange={e => setForm({...form, password: e.target.value})} 
          required
        />
        <button type="submit">Sign In</button>

        {/* Show error if login fails */}
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}


