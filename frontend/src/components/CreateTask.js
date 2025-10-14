import React, { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * CreateTask Component - Form for creating new tasks
 * 
 * This component provides a comprehensive form for creating tasks with:
 * - Task title and description
 * - List assignment (dropdown of user's lists)
 * - Due date selection (datetime picker)
 * - Status selection (todo, in-progress, completed)
 * - Real-time list loading and form validation
 * 
 * @param {Function} onCreated - Callback function called when task is successfully created
 * @param {number|null} selectedListId - Pre-selected list ID (optional)
 */
export default function CreateTask({ onCreated, selectedListId }) {
  // Form state - contains all task data
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    list_id: selectedListId || '', // Pre-select list if provided
    due_date: '',
    status: 'todo'
  });
  
  // Available task lists for dropdown
  const [lists, setLists] = useState([]);
  
  // Error state for displaying validation/API errors
  const [error, setError] = useState(null);
  
  // Loading state for form submission
  const [loading, setLoading] = useState(false);

  // Load available task lists when component mounts
  useEffect(() => {
    fetchLists();
  }, []);

  // Update form when selectedListId prop changes (e.g., user selects different list)
  useEffect(() => {
    setForm(prev => ({ ...prev, list_id: selectedListId || '' }));
  }, [selectedListId]);

  /**
   * Fetches all task lists for the current user
   * Populates the lists dropdown with user's available lists
   */
  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await api.get('/lists');
      setLists(response.data);
    } catch (err) {
      console.error('Error fetching lists:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles form submission for creating a new task
   * Validates required fields and sends data to API
   * 
   * @param {Event} e - Form submit event
   */
  async function submit(e) {
    e.preventDefault();
    
    // Validate required fields
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      // Prepare task data for API
      const taskData = {
        title: form.title,
        description: form.description,
        list_id: form.list_id || null, // Convert empty string to null
        due_date: form.due_date || null,
        status: form.status
      };
      
      // Send task data to backend
      await api.post('/tasks', taskData);
      
      // Reset form to initial state after successful creation
      setForm({ 
        title: '', 
        description: '', 
        list_id: selectedListId || '', // Preserve selectedListId if provided
        due_date: '',
        status: 'todo'
      });
      
      // Notify parent component to refresh task list
      onCreated && onCreated();
    } catch (err) {
      // Display error message to user
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-task">
      <h3>Create New Task</h3>
      <form onSubmit={submit}>
        <div className="form-group">
          <input 
            placeholder="Task title" 
            value={form.title} 
            onChange={e => setForm({...form, title: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <input 
            placeholder="Description (optional)" 
            value={form.description} 
            onChange={e => setForm({...form, description: e.target.value})}
          />
        </div>

        <div className="form-group">
          <select 
            value={form.list_id} 
            onChange={e => setForm({...form, list_id: e.target.value})}
          >
            <option value="">No List</option>
            {lists.map(list => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <input 
            type="datetime-local"
            value={form.due_date} 
            onChange={e => setForm({...form, due_date: e.target.value})}
          />
        </div>

        <div className="form-group">
          <select 
            value={form.status} 
            onChange={e => setForm({...form, status: e.target.value})}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Add Task'}
        </button>
        
        {error && <div className="error" style={{ color: 'red' }}>{error}</div>}
      </form>
    </div>
  );
}
