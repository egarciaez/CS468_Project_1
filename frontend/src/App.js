import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import TaskList from './components/TaskList';
import CreateTask from './components/CreateTask';
import ProtectedRoute from './components/ProtectedRoute';
import { logout } from './services/auth';

// Dashboard view shown after login
function Dashboard() {
  return (
    <div>
      <h1>TaskTrack</h1>
      {/* Logout button clears token and redirects to login */}
      <button onClick={() => { logout(); window.location = '/login'; }}>Logout</button>

       {/* Create task and show task list */}
      <CreateTask onCreated={() => window.location.reload()} />
      <TaskList />
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

