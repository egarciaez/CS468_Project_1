/**
 * Task Priority Tests
 * 
 * Tests for task priority functionality including:
 * - Creating tasks with different priorities
 * - Updating task priorities
 * - Sorting tasks by priority
 * - Priority validation
 */

const request = require('supertest');
const app = require('../src/server');
const db = require('../src/db');

describe('Task Priority Functionality', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Run migrations
    await db.migrate.latest();
  });

  afterAll(async () => {
    // Clean up
    await db.migrate.rollback();
    await db.destroy();
  });

  beforeEach(async () => {
    // Clean database
    await db('tasks').del();
    await db('users').del();
    
    // Register and login a user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'testpass123',
        email: 'test@example.com'
      });
    
    expect(registerResponse.status).toBe(201);
    userId = registerResponse.body.id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'testpass123'
      });
    
    expect(loginResponse.status).toBe(200);
    authToken = loginResponse.body.token;
  });

  describe('Creating tasks with priorities', () => {
    test('should create task with high priority', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'High Priority Task',
          description: 'This is urgent',
          priority: 'high'
        });

      expect(response.status).toBe(201);
      expect(response.body.priority).toBe('high');
      expect(response.body.title).toBe('High Priority Task');
    });

    test('should create task with medium priority (default)', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Medium Priority Task',
          description: 'This is normal'
        });

      expect(response.status).toBe(201);
      expect(response.body.priority).toBe('medium');
    });

    test('should create task with low priority', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Low Priority Task',
          description: 'This can wait',
          priority: 'low'
        });

      expect(response.status).toBe(201);
      expect(response.body.priority).toBe('low');
    });

    test('should reject invalid priority', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Priority Task',
          priority: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Priority must be high, medium, or low');
    });
  });

  describe('Updating task priorities', () => {
    let taskId;

    beforeEach(async () => {
      // Create a task first
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          priority: 'medium'
        });
      
      taskId = response.body.id;
    });

    test('should update task priority to high', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          priority: 'high'
        });

      expect(response.status).toBe(200);
      expect(response.body.priority).toBe('high');
    });

    test('should update task priority to low', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          priority: 'low'
        });

      expect(response.status).toBe(200);
      expect(response.body.priority).toBe('low');
    });

    test('should reject invalid priority update', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          priority: 'urgent'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Priority must be high, medium, or low');
    });
  });

  describe('Sorting tasks by priority', () => {
    beforeEach(async () => {
      // Create tasks with different priorities
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Low Priority Task',
          priority: 'low'
        });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'High Priority Task',
          priority: 'high'
        });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Medium Priority Task',
          priority: 'medium'
        });
    });

    test('should sort tasks by priority (high first)', async () => {
      const response = await request(app)
        .get('/api/tasks?sort_by=priority&sort_order=asc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      
      // Should be sorted: high, medium, low
      expect(response.body[0].priority).toBe('high');
      expect(response.body[1].priority).toBe('medium');
      expect(response.body[2].priority).toBe('low');
    });

    test('should sort tasks by priority (low first)', async () => {
      const response = await request(app)
        .get('/api/tasks?sort_by=priority&sort_order=desc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      
      // Should be sorted: low, medium, high
      expect(response.body[0].priority).toBe('low');
      expect(response.body[1].priority).toBe('medium');
      expect(response.body[2].priority).toBe('high');
    });

    test('should sort by other fields while maintaining priority order', async () => {
      const response = await request(app)
        .get('/api/tasks?sort_by=title&sort_order=asc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      
      // Should still prioritize by priority first, then by title
      expect(response.body[0].priority).toBe('high');
      expect(response.body[1].priority).toBe('medium');
      expect(response.body[2].priority).toBe('low');
    });
  });

  describe('Priority validation', () => {
    test('should accept all valid priorities', async () => {
      const priorities = ['high', 'medium', 'low'];
      
      for (const priority of priorities) {
        const response = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: `${priority} task`,
            priority: priority
          });

        expect(response.status).toBe(201);
        expect(response.body.priority).toBe(priority);
      }
    });

    test('should default to medium priority for empty string', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test task',
          priority: ''
        });

      expect(response.status).toBe(201);
      expect(response.body.priority).toBe('medium');
    });

    test('should default to medium priority for null', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test task',
          priority: null
        });

      expect(response.status).toBe(201);
      expect(response.body.priority).toBe('medium');
    });
  });
});
