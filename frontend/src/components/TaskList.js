import React, { useEffect, useState } from 'react';
import api from '../services/api';

// Displays all tasks assigned to or visible by the logged-in user
export default function TaskList() {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks from backend
  async function load() {
    try {
      const res = await api.get('/tasks');  // GET /api/tasks (requires token)
      setTasks(res.data);
    } catch (err) {
      console.error('failed to get tasks', err);
    }
  }

   // Load tasks when component mounts
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h3>Your tasks</h3>
      <ul>
        {tasks.map(t => (
          <li key={t.id}>
            <strong>{t.title}</strong> — {t.description || 'no description'} — {t.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
