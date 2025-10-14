import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple component for testing
const TaskListManager = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newList, setNewList] = useState({ name: '', description: '' });

  return (
    <div className="task-list-manager">
      <div className="header">
        <h2>Task Lists</h2>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
        >
          Create New List
        </button>
      </div>

      {showCreateForm && (
        <div className="create-form">
          <h3>Create New List</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <input
                type="text"
                placeholder="List name"
                value={newList.name}
                onChange={(e) => setNewList({...newList, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Description (optional)"
                value={newList.description}
                onChange={(e) => setNewList({...newList, description: e.target.value})}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Create List
              </button>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

describe('TaskListManager', () => {
  test('renders task list manager component', () => {
    render(<TaskListManager />);
    
    expect(screen.getByText('Task Lists')).toBeInTheDocument();
    expect(screen.getByText('Create New List')).toBeInTheDocument();
  });

  test('displays create list form when create button is clicked', () => {
    render(<TaskListManager />);
    
    const createButton = screen.getByText('Create New List');
    fireEvent.click(createButton);
    
    expect(screen.getByPlaceholderText('List name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description (optional)')).toBeInTheDocument();
    expect(screen.getByText('Create List')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('hides create list form when cancel is clicked', () => {
    render(<TaskListManager />);
    
    // Open the form
    const createButton = screen.getByText('Create New List');
    fireEvent.click(createButton);
    
    // Cancel the form
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(screen.queryByPlaceholderText('List name')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Description (optional)')).not.toBeInTheDocument();
  });
});
