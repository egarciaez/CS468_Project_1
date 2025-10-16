import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskListManager from './TaskListManager';

// Mock the API calls
jest.mock('../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Mock the auth service
jest.mock('../services/auth', () => ({
  getToken: () => 'mock-token',
  logout: jest.fn(),
}));

describe('TaskListManager', () => {
  const mockApi = require('../services/api');
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Mock successful API response
    mockApi.get.mockResolvedValue({ data: [] });
  });

  test('renders task list manager component', async () => {
    await act(async () => {
      render(<TaskListManager />);
    });
    
    expect(screen.getByText('Task Lists')).toBeInTheDocument();
    expect(screen.getByText('Create New List')).toBeInTheDocument();
  });

  test('displays create list form when create button is clicked', async () => {
    await act(async () => {
      render(<TaskListManager />);
    });
    
    const createButton = screen.getByText('Create New List');
    fireEvent.click(createButton);
    
    expect(screen.getByPlaceholderText('List name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description (optional)')).toBeInTheDocument();
    expect(screen.getByText('Create List')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('hides create list form when cancel is clicked', async () => {
    await act(async () => {
      render(<TaskListManager />);
    });
    
    // Open the form
    const createButton = screen.getByText('Create New List');
    fireEvent.click(createButton);
    
    // Cancel the form
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(screen.queryByPlaceholderText('List name')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Description (optional)')).not.toBeInTheDocument();
  });

  test('creates a new task list', async () => {
    mockApi.post.mockResolvedValue({
      data: {
        id: 1,
        name: 'Test List',
        description: 'Test Description'
      }
    });

    await act(async () => {
      render(<TaskListManager />);
    });
    
    // Open the form
    const createButton = screen.getByText('Create New List');
    fireEvent.click(createButton);
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('List name'), {
      target: { value: 'Test List' }
    });
    fireEvent.change(screen.getByPlaceholderText('Description (optional)'), {
      target: { value: 'Test Description' }
    });
    
    // Submit the form
    const submitButton = screen.getByText('Create List');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/lists', {
        name: 'Test List',
        description: 'Test Description'
      });
    });
  });
});
