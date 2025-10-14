import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TaskListManager = () => {
  const [lists, setLists] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newList, setNewList] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await api.get('/lists');
      setLists(response.data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newList.name.trim()) return;

    try {
      const response = await api.post('/lists', newList);
      setLists([...lists, response.data]);
      setNewList({ name: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;

    try {
      await api.delete(`/lists/${listId}`);
      setLists(lists.filter(list => list.id !== listId));
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const handleEditList = async (listId, updatedData) => {
    try {
      const response = await api.put(`/lists/${listId}`, updatedData);
      setLists(lists.map(list => 
        list.id === listId ? response.data : list
      ));
    } catch (error) {
      console.error('Error updating list:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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
          <form onSubmit={handleCreateList}>
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

      <div className="lists-container">
        {lists.length === 0 ? (
          <p>No task lists yet. Create your first list!</p>
        ) : (
          lists.map(list => (
            <div key={list.id} className="list-item">
              <div className="list-info">
                <h3>{list.name}</h3>
                {list.description && <p>{list.description}</p>}
              </div>
              <div className="list-actions">
                <button 
                  onClick={() => handleEditList(list.id, { name: list.name + ' (edited)' })}
                  className="btn btn-sm btn-secondary"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteList(list.id)}
                  className="btn btn-sm btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskListManager;
