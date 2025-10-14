import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple Task component for testing
const TaskWithList = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    due_date: task.due_date || '',
    status: task.status
  });

  const handleSave = () => {
    onUpdate(task.id, editData);
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus) => {
    onUpdate(task.id, { ...editData, status: newStatus });
  };

  return (
    <div className="task-item" data-testid={`task-${task.id}`}>
      {isEditing ? (
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
          <input
            type="datetime-local"
            value={editData.due_date}
            onChange={(e) => setEditData({...editData, due_date: e.target.value})}
          />
          <select
            value={editData.status}
            onChange={(e) => setEditData({...editData, status: e.target.value})}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div className="task-display">
          <h4>{task.title}</h4>
          {task.description && <p>{task.description}</p>}
          {task.due_date && <p>Due: {task.due_date}</p>}
          <span className={`status status-${task.status}`}>{task.status}</span>
          <div className="task-actions">
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={() => handleStatusChange('completed')}>Mark Complete</button>
            <button onClick={() => onDelete(task.id)}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

describe('TaskWithList', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    due_date: '2024-12-31T23:59',
    status: 'todo',
    list_id: 1
  };

  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders task with all properties', () => {
    render(
      <TaskWithList 
        task={mockTask} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Due: 2024-12-31T23:59')).toBeInTheDocument();
    expect(screen.getByText('todo')).toBeInTheDocument();
  });

  test('enters edit mode when edit button is clicked', () => {
    render(
      <TaskWithList 
        task={mockTask} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-12-31T23:59')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('saves changes when save button is clicked', () => {
    render(
      <TaskWithList 
        task={mockTask} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    
    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    // Change the title
    const titleInput = screen.getByDisplayValue('Test Task');
    fireEvent.change(titleInput, { target: { value: 'Updated Task' } });
    
    // Save changes
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    expect(mockOnUpdate).toHaveBeenCalledWith(1, {
      title: 'Updated Task',
      description: 'Test Description',
      due_date: '2024-12-31T23:59',
      status: 'todo'
    });
  });

  test('marks task as completed when mark complete button is clicked', () => {
    render(
      <TaskWithList 
        task={mockTask} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    
    const completeButton = screen.getByText('Mark Complete');
    fireEvent.click(completeButton);
    
    expect(mockOnUpdate).toHaveBeenCalledWith(1, {
      title: 'Test Task',
      description: 'Test Description',
      due_date: '2024-12-31T23:59',
      status: 'completed'
    });
  });

  test('calls onDelete when delete button is clicked', () => {
    render(
      <TaskWithList 
        task={mockTask} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  test('cancels edit mode when cancel button is clicked', () => {
    render(
      <TaskWithList 
        task={mockTask} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    
    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    // Cancel edit
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Should be back to display mode
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });
});
