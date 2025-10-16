import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

// Displays all tasks assigned to or visible by the logged-in user
export default function TaskList({ selectedListId, onTaskUpdate }) {
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editData, setEditData] = useState({});
  // Removed sort options - using default backend sorting

  // Fetch tasks from backend
  const load = useCallback(async () => {
    try {
      setLoading(true);
      let url = selectedListId ? `/tasks?list_id=${selectedListId}` : '/tasks';
      const res = await api.get(url);
      setTasks(res.data);
    } catch (err) {
      console.error('failed to get tasks', err);
    } finally {
      setLoading(false);
    }
  }, [selectedListId]);

  // Fetch lists
  const loadLists = useCallback(async () => {
    try {
      const res = await api.get('/lists');
      setLists(res.data);
    } catch (err) {
      console.error('failed to get lists', err);
    }
  }, []);

  // Load tasks when component mounts or selectedListId changes
  useEffect(() => { 
    load(); 
    loadLists();
  }, [selectedListId, load, loadLists]);

  // Update task
  const handleUpdateTask = async (taskId, updates) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, updates);
      setTasks(tasks.map(task => 
        task.id === taskId ? res.data : task
      ));
      setEditingTask(null);
      setEditData({});
      onTaskUpdate && onTaskUpdate();
    } catch (err) {
      console.error('failed to update task', err);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
      onTaskUpdate && onTaskUpdate();
    } catch (err) {
      console.error('failed to delete task', err);
    }
  };

  // Start editing task
  const startEdit = (task) => {
    setEditingTask(task.id);
    setEditData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date ? task.due_date.slice(0, 16) : '',
      status: task.status,
      list_id: task.list_id || '',
      priority: task.priority || 'medium'
    });
  };

  // Save edit
  const saveEdit = () => {
    handleUpdateTask(editingTask, editData);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingTask(null);
    setEditData({});
  };

  // Get list name by ID
  const getListName = (listId) => {
    const list = lists.find(l => l.id === listId);
    return list ? list.name : 'No List';
  };

  // Format due date
  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    return new Date(dueDate).toLocaleDateString();
  };

  // Get priority icon and color
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'high':
        return { icon: '🔥', color: '#ff6b6b', label: 'High' };
      case 'medium':
        return { icon: '⚡', color: '#ffa726', label: 'Medium' };
      case 'low':
        return { icon: '📝', color: '#66bb6a', label: 'Low' };
      default:
        return { icon: '⚡', color: '#ffa726', label: 'Medium' };
    }
  };

  // Removed sort change handler - using default backend sorting

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h3>
          {selectedListId 
            ? `Tasks in ${getListName(selectedListId)}` 
            : 'All Tasks'
          }
        </h3>
      </div>
      
      {tasks.length === 0 ? (
        <p>No tasks found. Create your first task!</p>
      ) : (
        <div className="tasks-container">
          {tasks.map(task => (
            <div key={task.id} className={`task-item task-${task.status}`}>
              {editingTask === task.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    placeholder="Task title"
                  />
                  <input
                    type="text"
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    placeholder="Description"
                  />
                  <select
                    value={editData.list_id}
                    onChange={(e) => setEditData({...editData, list_id: e.target.value})}
                  >
                    <option value="">No List</option>
                    {lists.map(list => (
                      <option key={list.id} value={list.id}>
                        {list.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="datetime-local"
                    value={editData.due_date}
                    onChange={(e) => setEditData({...editData, due_date: e.target.value})}
                  />
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData({...editData, priority: e.target.value})}
                  >
                    <option value="high">🔥 High Priority</option>
                    <option value="medium">⚡ Medium Priority</option>
                    <option value="low">📝 Low Priority</option>
                  </select>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({...editData, status: e.target.value})}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div className="edit-actions">
                    <button onClick={saveEdit}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="task-display">
                  <div className="task-header">
                    <h4>{task.title}</h4>
                    <div className="task-badges">
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityInfo(task.priority).color }}
                      >
                        {getPriorityInfo(task.priority).icon} {getPriorityInfo(task.priority).label}
                      </span>
                      <span className={`status status-${task.status}`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  
                  <div className="task-meta">
                    {task.list_id && (
                      <span className="task-list">List: {getListName(task.list_id)}</span>
                    )}
                    {task.due_date && (
                      <span className="task-due">Due: {formatDueDate(task.due_date)}</span>
                    )}
                  </div>
                  
                  <div className="task-actions">
                    <button onClick={() => startEdit(task)}>Edit</button>
                    <button 
                      onClick={() => handleUpdateTask(task.id, { status: 'completed' })}
                      disabled={task.status === 'completed'}
                    >
                      Mark Complete
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
