import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import TaskList from './components/TaskList';
import CreateTask from './components/CreateTask';
import TaskListManager from './components/TaskListManager';
import ProtectedRoute from './components/ProtectedRoute';
import { logout } from './services/auth';
import api from './services/api';

/**
 * Dashboard Component - Main application interface after login
 * 
 * This component provides the main task management interface with:
 * - Task list sidebar for organization
 * - Task creation form
 * - Task display and management
 * - List-based filtering and organization
 * 
 * Features:
 * - Create and manage task lists
 * - Create tasks with list assignment and due dates
 * - Filter tasks by list or view all tasks
 * - Real-time updates across components
 */
function Dashboard() {
  // Available task lists for the current user
  const [lists, setLists] = useState([]);
  
  // Currently selected list ID (null = show all tasks)
  const [selectedListId, setSelectedListId] = useState(null);
  
  // Key for forcing TaskList component re-render when data changes
  const [refreshKey, setRefreshKey] = useState(0);

  // Load task lists when component mounts
  useEffect(() => {
    fetchLists();
  }, []);

  /**
   * Fetches all task lists for the current user
   * Updates the lists state to populate the sidebar
   */
  const fetchLists = async () => {
    try {
      const response = await api.get('/lists');
      setLists(response.data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  /**
   * Handles updates to task lists (create, edit, delete)
   * Refreshes the lists and forces task list re-render
   */
  const handleListUpdate = () => {
    fetchLists(); // Refresh the lists
    setRefreshKey(prev => prev + 1); // Force TaskList re-render
  };

  /**
   * Handles updates to tasks (create, edit, delete)
   * Forces task list re-render to show updated data
   */
  const handleTaskUpdate = () => {
    setRefreshKey(prev => prev + 1); // Force TaskList re-render
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>TaskTrack</h1>
        <button 
          onClick={() => { logout(); window.location = '/login'; }}
          className="logout-btn"
        >
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="sidebar">
          <h3>Task Lists</h3>
          <div className="list-selector">
            <button 
              onClick={() => setSelectedListId(null)}
              className={selectedListId === null ? 'active' : ''}
            >
              All Tasks
            </button>
            {lists.map(list => (
              <button
                key={list.id}
                onClick={() => setSelectedListId(list.id)}
                className={selectedListId === list.id ? 'active' : ''}
              >
                {list.name}
              </button>
            ))}
          </div>
          
          <TaskListManager onListUpdate={handleListUpdate} />
        </div>

        <div className="main-content">
          <CreateTask 
            selectedListId={selectedListId}
            onCreated={handleTaskUpdate} 
          />
          <TaskList 
            key={refreshKey}
            selectedListId={selectedListId}
            onTaskUpdate={handleTaskUpdate}
          />
        </div>
      </div>
    </div>
  );
}

// Main application with router setup
export default function App() {
  return (
    <BrowserRouter>
    {/* Simple top navigation bar */}
      <nav>
        <Link to="/">Home</Link> | <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
      </nav>

      {/* Route definitions */}
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Public login & register routes */}
        <Route path="/login" element={<Login onLogin={() => window.location = '/'} />} />
        <Route path="/register" element={<Register onRegistered={() => window.location = '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}

