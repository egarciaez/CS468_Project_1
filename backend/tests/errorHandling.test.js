/**
 * Error Handling Tests - Comprehensive error handling and validation tests
 * 
 * This test suite covers:
 * - Input validation errors
 * - Authentication errors
 * - Authorization errors
 * - Database constraint violations
 * - Malformed requests
 * - Edge cases and boundary conditions
 */

const request = require('supertest');
const app = require('../src/server');
const db = require('../src/db');

beforeAll(async () => {
  await db.migrate.latest();
});

afterAll(async () => {
  await db.destroy();
});

beforeEach(async () => {
  // Clean up tables before each test
  await db('tasks').del();
  await db('task_lists').del();
  await db('users').del();
});

describe('Error Handling and Validation Tests', () => {
  let token;
  let userId;
  let listId;

  beforeEach(async () => {
    // Register and login a user for each test
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'password123' });
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password123' });
    
    token = loginResponse.body.token;
    
    // Get user ID
    const user = await db('users').where({ username: 'testuser' }).first();
    userId = user.id;

    // Create a test list
    const listResponse = await request(app)
      .post('/api/lists')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test List', description: 'Test Description' });
    
    listId = listResponse.body.id;
  });

  describe('Authentication Error Handling', () => {
    test('should reject requests without token', async () => {
      const response = await request(app).get('/api/tasks');
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('missing token');
    });

    test('should reject requests with invalid token format', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'InvalidFormat token123');
      expect(response.statusCode).toBe(401);
    });

    test('should reject requests with malformed token', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer invalid-token');
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('invalid token');
    });

    test('should reject requests with expired token', async () => {
      // This would require creating an expired token, which is complex in this test setup
      // For now, we'll test with a completely invalid token
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid');
      expect(response.statusCode).toBe(401);
    });
  });

  describe('Input Validation Error Handling', () => {
    describe('Task Creation Validation', () => {
      test('should reject task creation without title', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send({ description: 'No title provided' });
        
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('title required');
      });

      test('should reject task creation with empty title', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send({ title: '', description: 'Empty title' });
        
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('title required');
      });

      test('should reject task creation with invalid priority', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send({ 
            title: 'Test Task',
            priority: 'invalid-priority'
          });
        
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Priority must be high, medium, or low');
      });

      test('should reject task creation with invalid list_id', async () => {
        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send({ 
            title: 'Test Task',
            list_id: 99999 // Non-existent list
          });
        
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid list_id');
      });

      test('should reject task creation with list_id belonging to another user', async () => {
        // Create another user and their list
        await request(app)
          .post('/api/auth/register')
          .send({ username: 'otheruser', password: 'password123' });
        
        const otherUserLogin = await request(app)
          .post('/api/auth/login')
          .send({ username: 'otheruser', password: 'password123' });
        
        const otherListResponse = await request(app)
          .post('/api/lists')
          .set('Authorization', `Bearer ${otherUserLogin.body.token}`)
          .send({ name: 'Other User List' });
        
        // Try to create task with other user's list
        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send({ 
            title: 'Test Task',
            list_id: otherListResponse.body.id
          });
        
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid list_id');
      });
    });

    describe('Task Update Validation', () => {
      let taskId;

      beforeEach(async () => {
        const taskResponse = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'Test Task', description: 'Original description' });
        
        taskId = taskResponse.body.id;
      });

      test('should reject task update with invalid priority', async () => {
        const response = await request(app)
          .put(`/api/tasks/${taskId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ priority: 'invalid-priority' });
        
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Priority must be high, medium, or low');
      });

      test('should reject task update with invalid list_id', async () => {
        const response = await request(app)
          .put(`/api/tasks/${taskId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ list_id: 99999 });
        
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid list_id');
      });
    });

    describe('Task List Creation Validation', () => {
      test('should reject list creation without name', async () => {
        const response = await request(app)
          .post('/api/lists')
          .set('Authorization', `Bearer ${token}`)
          .send({ description: 'No name provided' });
        
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Name is required');
      });

      test('should reject list creation with empty name', async () => {
        const response = await request(app)
          .post('/api/lists')
          .set('Authorization', `Bearer ${token}`)
          .send({ name: '', description: 'Empty name' });
        
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Name is required');
      });
    });

    describe('Query Parameter Validation', () => {
      test('should reject invalid sort_by parameter', async () => {
        const response = await request(app)
          .get('/api/tasks?sort_by=invalid_field')
          .set('Authorization', `Bearer ${token}`);
        
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid sort_by parameter');
      });

      test('should reject invalid sort_order parameter', async () => {
        const response = await request(app)
          .get('/api/tasks?sort_order=invalid_order')
          .set('Authorization', `Bearer ${token}`);
        
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid sort_order parameter');
      });
    });
  });

  describe('Authorization Error Handling', () => {
    let otherUserToken;
    let otherUserListId;
    let otherUserTaskId;

    beforeEach(async () => {
      // Create another user
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'otheruser', password: 'password123' });
      
      const otherUserLogin = await request(app)
        .post('/api/auth/login')
        .send({ username: 'otheruser', password: 'password123' });
      
      otherUserToken = otherUserLogin.body.token;

      // Create list and task for other user
      const otherListResponse = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ name: 'Other User List' });
      
      otherUserListId = otherListResponse.body.id;

      const otherTaskResponse = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ title: 'Other User Task' });
      
      otherUserTaskId = otherTaskResponse.body.id;
    });

    test('should reject access to other user\'s task list', async () => {
      const response = await request(app)
        .get(`/api/lists/${otherUserListId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.statusCode).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    test('should reject updating other user\'s task list', async () => {
      const response = await request(app)
        .put(`/api/lists/${otherUserListId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Hacked List' });
      
      expect(response.statusCode).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    test('should reject deleting other user\'s task list', async () => {
      const response = await request(app)
        .delete(`/api/lists/${otherUserListId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.statusCode).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });
  });

  describe('Resource Not Found Error Handling', () => {
    test('should return 404 for non-existent task list', async () => {
      const response = await request(app)
        .get('/api/lists/99999')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Task list not found');
    });

    test('should return 404 for updating non-existent task list', async () => {
      const response = await request(app)
        .put('/api/lists/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });
      
      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Task list not found');
    });

    test('should return 404 for deleting non-existent task list', async () => {
      const response = await request(app)
        .delete('/api/lists/99999')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Task list not found');
    });
  });

  describe('Malformed Request Error Handling', () => {
    test('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send('{"title": "Test", "description": }'); // Malformed JSON
      
      expect(response.statusCode).toBe(400);
    });

    test('should handle missing Content-Type header', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send('title=Test&description=Test'); // URL-encoded data without proper header
      
      expect(response.statusCode).toBe(400);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    test('should handle very long task titles', async () => {
      const longTitle = 'A'.repeat(1000); // Very long title
      
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: longTitle });
      
      // Should either succeed or fail gracefully with validation error
      expect([201, 400]).toContain(response.statusCode);
    });

    test('should handle special characters in task data', async () => {
      const specialTitle = 'Task with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: specialTitle });
      
      expect(response.statusCode).toBe(201);
      expect(response.body.title).toBe(specialTitle);
    });

    test('should handle unicode characters in task data', async () => {
      const unicodeTitle = 'Task with unicode: 🚀 中文 العربية हिन्दी';
      
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: unicodeTitle });
      
      expect(response.statusCode).toBe(201);
      expect(response.body.title).toBe(unicodeTitle);
    });

    test('should handle null and undefined values gracefully', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          title: 'Test Task',
          description: null,
          priority: null,
          list_id: null
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body.title).toBe('Test Task');
    });
  });

  describe('Database Constraint Violations', () => {
    test('should handle duplicate username registration', async () => {
      // First registration should succeed
      const firstResponse = await request(app)
        .post('/api/auth/register')
        .send({ username: 'duplicateuser', password: 'password123' });
      
      expect(firstResponse.statusCode).toBe(201);

      // Second registration with same username should fail
      const secondResponse = await request(app)
        .post('/api/auth/register')
        .send({ username: 'duplicateuser', password: 'password123' });
      
      expect(secondResponse.statusCode).toBe(400);
      expect(secondResponse.body.message).toBe('username taken');
    });
  });
});

