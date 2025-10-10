import React, { useState } from 'react';
import api from '../services/api';

// Component to create a new task
export default function CreateTask({ onCreated }) {
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState(null);

  // When the form is submitted
  async function submit(e) {
    e.preventDefault();
    try {
      await api.post('/tasks', form);  // POST /api/tasks
      setForm({ title: '', description: '' });  // Clear form after success
      onCreated && onCreated();  // Notify parent to reload tasks
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create');
    }
  }

  return (
    <form onSubmit={submit}>
      <input placeholder="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
      <input placeholder="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
      <button type="submit">Add task</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
