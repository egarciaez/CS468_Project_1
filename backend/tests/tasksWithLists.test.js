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

describe('Task Management with Lists', () => {
  let token;
  let userId;
  let listId;

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

    // Create a task list
    const listResponse = await request(app)
      .post('/api/lists')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test List', description: 'Test Description' });
    
    listId = listResponse.body.id;
  });

  describe('POST /api/tasks with list and due date', () => {
    test('should create a task with list_id and due_date', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        list_id: listId,
        due_date: '2024-12-31T23:59:59Z',
        status: 'todo'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Task');
      expect(response.body.description).toBe('Test Description');
      expect(response.body.list_id).toBe(listId);
      expect(response.body.due_date).toBe('2024-12-31T23:59:59Z');
      expect(response.body.status).toBe('todo');
    });

    test('should create a task without list_id and due_date', async () => {
      const taskData = {
        title: 'Simple Task',
        status: 'todo'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData);

      expect(response.statusCode).toBe(201);
      expect(response.body.title).toBe('Simple Task');
      expect(response.body.list_id).toBeNull();
      expect(response.body.due_date).toBeNull();
    });

    test('should reject task with invalid list_id', async () => {
      const taskData = {
        title: 'Invalid List Task',
        list_id: 999,
        status: 'todo'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData);

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/tasks with list filtering', () => {
    test('should return tasks for a specific list', async () => {
      // Create tasks in different lists
      const [otherListId] = await db('task_lists').insert({
        name: 'Other List',
        user_id: userId
      });

      // Create tasks
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Task in List 1',
          list_id: listId,
          status: 'todo'
        });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Task in List 2',
          list_id: otherListId,
          status: 'todo'
        });

      // Get tasks for specific list
      const response = await request(app)
        .get(`/api/tasks?list_id=${listId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Task in List 1');
      expect(response.body[0].list_id).toBe(listId);
    });

    test('should return all tasks when no list filter', async () => {
      // Create tasks
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Task 1',
          list_id: listId,
          status: 'todo'
        });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Task 2',
          status: 'todo'
        });

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('PUT /api/tasks/:id with list and due date updates', () => {
    test('should update task list and due date', async () => {
      // Create a task
      const createResponse = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Original Task',
          list_id: listId,
          status: 'todo'
        });

      const taskId = createResponse.body.id;

      // Create another list
      const [otherListId] = await db('task_lists').insert({
        name: 'Other List',
        user_id: userId
      });

      // Update task
      const updateData = {
        list_id: otherListId,
        due_date: '2024-12-25T12:00:00Z',
        status: 'in-progress'
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body.list_id).toBe(otherListId);
      expect(response.body.due_date).toBe('2024-12-25T12:00:00Z');
      expect(response.body.status).toBe('in-progress');
    });

    test('should update task to remove list and due date', async () => {
      // Create a task with list and due date
      const createResponse = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Task with List',
          list_id: listId,
          due_date: '2024-12-31T23:59:59Z',
          status: 'todo'
        });

      const taskId = createResponse.body.id;

      // Update task to remove list and due date
      const updateData = {
        list_id: null,
        due_date: null
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body.list_id).toBeNull();
      expect(response.body.due_date).toBeNull();
    });
  });

  describe('Task status management', () => {
    test('should mark task as completed', async () => {
      // Create a task
      const createResponse = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Task to Complete',
          list_id: listId,
          status: 'todo'
        });

      const taskId = createResponse.body.id;

      // Mark as completed
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed' });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('completed');
    });

    test('should update task status through different states', async () => {
      // Create a task
      const createResponse = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Task with Status Changes',
          list_id: listId,
          status: 'todo'
        });

      const taskId = createResponse.body.id;

      // Update to in-progress
      let response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'in-progress' });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('in-progress');

      // Update to completed
      response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed' });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('completed');
    });
  });
});
