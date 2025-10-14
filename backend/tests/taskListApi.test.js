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

describe('Task List API endpoints', () => {
  let token;
  let userId;

  beforeEach(async () => {
    // Register and login a user for testing
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'password123' });
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password123' });
    
    token = loginResponse.body.token;
    
    // Get user ID for testing
    const user = await db('users').where({ username: 'testuser' }).first();
    userId = user.id;
  });

  describe('POST /api/lists', () => {
    test('should create a new task list', async () => {
      const listData = {
        name: 'Math Homework',
        description: 'All math related tasks'
      };

      const response = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send(listData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Math Homework');
      expect(response.body.description).toBe('All math related tasks');
      expect(response.body.user_id).toBe(userId);
    });

    test('should create a task list with minimal data', async () => {
      const listData = {
        name: 'Simple List'
      };

      const response = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send(listData);

      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe('Simple List');
      expect(response.body.description).toBeNull();
    });

    test('should reject request without name', async () => {
      const listData = {
        description: 'List without name'
      };

      const response = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send(listData);

      expect(response.statusCode).toBe(400);
    });

    test('should reject unauthenticated request', async () => {
      const listData = {
        name: 'Unauthorized List'
      };

      const response = await request(app)
        .post('/api/lists')
        .send(listData);

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/lists', () => {
    test('should return all task lists for authenticated user', async () => {
      // Create some test lists
      await db('task_lists').insert([
        { name: 'List 1', user_id: userId },
        { name: 'List 2', user_id: userId }
      ]);

      const response = await request(app)
        .get('/api/lists')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body).toHaveLength(2);
    });

    test('should return empty array for user with no lists', async () => {
      const response = await request(app)
        .get('/api/lists')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    test('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/lists');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/lists/:id', () => {
    test('should return specific task list', async () => {
      const [listId] = await db('task_lists').insert({
        name: 'Test List',
        description: 'Test Description',
        user_id: userId
      });

      const response = await request(app)
        .get(`/api/lists/${listId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe('Test List');
      expect(response.body.description).toBe('Test Description');
    });

    test('should return 404 for non-existent list', async () => {
      const response = await request(app)
        .get('/api/lists/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
    });

    test('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/lists/1');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('PUT /api/lists/:id', () => {
    test('should update task list', async () => {
      const [listId] = await db('task_lists').insert({
        name: 'Original Name',
        user_id: userId
      });

      const updateData = {
        name: 'Updated Name',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/lists/${listId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.description).toBe('Updated Description');
    });

    test('should return 404 for non-existent list', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .put('/api/lists/999')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.statusCode).toBe(404);
    });

    test('should reject unauthenticated request', async () => {
      const response = await request(app)
        .put('/api/lists/1')
        .send({ name: 'Updated' });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/lists/:id', () => {
    test('should delete task list', async () => {
      const [listId] = await db('task_lists').insert({
        name: 'To Delete',
        user_id: userId
      });

      const response = await request(app)
        .delete(`/api/lists/${listId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Task list deleted successfully');

      // Verify list is deleted
      const deletedList = await db('task_lists').where({ id: listId }).first();
      expect(deletedList).toBeUndefined();
    });

    test('should return 404 for non-existent list', async () => {
      const response = await request(app)
        .delete('/api/lists/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
    });

    test('should reject unauthenticated request', async () => {
      const response = await request(app)
        .delete('/api/lists/1');

      expect(response.statusCode).toBe(401);
    });
  });
});
