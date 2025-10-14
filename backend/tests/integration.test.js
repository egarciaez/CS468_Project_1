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

describe('Complete Application Integration Tests', () => {
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
  });

  describe('Complete Task Management Workflow', () => {
    test('should create list, add tasks, and manage complete workflow', async () => {
      // Step 1: Create a task list
      const listResponse = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Project Alpha',
          description: 'Main project tasks'
        });

      expect(listResponse.statusCode).toBe(201);
      listId = listResponse.body.id;

      // Step 2: Create tasks in the list
      const task1Response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Design UI Mockups',
          description: 'Create wireframes and mockups for the application',
          list_id: listId,
          due_date: '2024-12-31T23:59:59Z',
          status: 'todo'
        });

      expect(task1Response.statusCode).toBe(201);
      expect(task1Response.body.title).toBe('Design UI Mockups');
      expect(task1Response.body.list_id).toBe(listId);

      const task2Response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Implement Backend API',
          description: 'Create RESTful API endpoints',
          list_id: listId,
          due_date: '2024-12-25T12:00:00Z',
          status: 'in-progress'
        });

      expect(task2Response.statusCode).toBe(201);

      // Step 3: Get tasks for the specific list
      const listTasksResponse = await request(app)
        .get(`/api/tasks?list_id=${listId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(listTasksResponse.statusCode).toBe(200);
      expect(listTasksResponse.body).toHaveLength(2);

      // Step 4: Update a task
      const updateResponse = await request(app)
        .put(`/api/tasks/${task1Response.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'completed',
          description: 'Updated description'
        });

      expect(updateResponse.statusCode).toBe(200);
      expect(updateResponse.body.status).toBe('completed');

      // Step 5: Get all tasks (should include both)
      const allTasksResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(allTasksResponse.statusCode).toBe(200);
      expect(allTasksResponse.body).toHaveLength(2);

      // Step 6: Create a task without a list
      const task3Response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Standalone Task',
          description: 'This task is not in any list',
          status: 'todo'
        });

      expect(task3Response.statusCode).toBe(201);
      expect(task3Response.body.list_id).toBeNull();

      // Step 7: Verify we now have 3 total tasks
      const finalTasksResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(finalTasksResponse.statusCode).toBe(200);
      expect(finalTasksResponse.body).toHaveLength(3);

      // Step 8: Delete a task
      const deleteResponse = await request(app)
        .delete(`/api/tasks/${task3Response.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteResponse.statusCode).toBe(204);

      // Step 9: Verify task is deleted
      const afterDeleteResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(afterDeleteResponse.statusCode).toBe(200);
      expect(afterDeleteResponse.body).toHaveLength(2);
    });

    test('should handle multiple lists and task filtering', async () => {
      // Create multiple lists
      const list1Response = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Work Tasks', description: 'Office work' });

      const list2Response = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Personal Tasks', description: 'Personal projects' });

      const list1Id = list1Response.body.id;
      const list2Id = list2Response.body.id;

      // Create tasks in different lists
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Work Task 1',
          list_id: list1Id,
          status: 'todo'
        });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Personal Task 1',
          list_id: list2Id,
          status: 'todo'
        });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Work Task 2',
          list_id: list1Id,
          status: 'in-progress'
        });

      // Get tasks for list 1 only
      const list1TasksResponse = await request(app)
        .get(`/api/tasks?list_id=${list1Id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(list1TasksResponse.statusCode).toBe(200);
      expect(list1TasksResponse.body).toHaveLength(2);
      expect(list1TasksResponse.body.every(task => task.list_id === list1Id)).toBe(true);

      // Get tasks for list 2 only
      const list2TasksResponse = await request(app)
        .get(`/api/tasks?list_id=${list2Id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(list2TasksResponse.statusCode).toBe(200);
      expect(list2TasksResponse.body).toHaveLength(1);
      expect(list2TasksResponse.body[0].list_id).toBe(list2Id);

      // Get all tasks
      const allTasksResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(allTasksResponse.statusCode).toBe(200);
      expect(allTasksResponse.body).toHaveLength(3);
    });

    test('should handle task list management', async () => {
      // Create a list
      const createListResponse = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test List',
          description: 'Test Description'
        });

      expect(createListResponse.statusCode).toBe(201);
      const listId = createListResponse.body.id;

      // Get all lists
      const getListsResponse = await request(app)
        .get('/api/lists')
        .set('Authorization', `Bearer ${token}`);

      expect(getListsResponse.statusCode).toBe(200);
      expect(getListsResponse.body).toHaveLength(1);
      expect(getListsResponse.body[0].name).toBe('Test List');

      // Update the list
      const updateListResponse = await request(app)
        .put(`/api/lists/${listId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated List Name',
          description: 'Updated Description'
        });

      expect(updateListResponse.statusCode).toBe(200);
      expect(updateListResponse.body.name).toBe('Updated List Name');

      // Delete the list
      const deleteListResponse = await request(app)
        .delete(`/api/lists/${listId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteListResponse.statusCode).toBe(200);

      // Verify list is deleted
      const afterDeleteResponse = await request(app)
        .get('/api/lists')
        .set('Authorization', `Bearer ${token}`);

      expect(afterDeleteResponse.statusCode).toBe(200);
      expect(afterDeleteResponse.body).toHaveLength(0);
    });

    test('should enforce authentication on all protected routes', async () => {
      // Test all protected routes without authentication
      const protectedRoutes = [
        { method: 'get', path: '/api/lists' },
        { method: 'post', path: '/api/lists', data: { name: 'Test' } },
        { method: 'get', path: '/api/lists/1' },
        { method: 'put', path: '/api/lists/1', data: { name: 'Updated' } },
        { method: 'delete', path: '/api/lists/1' },
        { method: 'get', path: '/api/tasks' },
        { method: 'post', path: '/api/tasks', data: { title: 'Test' } },
        { method: 'put', path: '/api/tasks/1', data: { title: 'Updated' } },
        { method: 'delete', path: '/api/tasks/1' }
      ];

      for (const route of protectedRoutes) {
        const response = await request(app)[route.method](route.path)
          .send(route.data || {});
        
        expect(response.statusCode).toBe(401);
      }
    });
  });
});
