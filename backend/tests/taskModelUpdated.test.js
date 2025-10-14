const db = require('../src/db');
const taskModel = require('../src/models/taskModel');

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

describe('Updated Task Model', () => {
  let userId;
  let listId;

  beforeEach(async () => {
    // Create a test user
    const [userIdResult] = await db('users').insert({
      username: 'testuser',
      password: 'hashedpassword',
      email: 'test@example.com'
    });
    userId = userIdResult;

    // Create a test task list
    const [listIdResult] = await db('task_lists').insert({
      name: 'Test List',
      user_id: userId
    });
    listId = listIdResult;
  });

  describe('create with list and due date', () => {
    test('should create a task with list_id and due_date', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        assignee_id: userId,
        list_id: listId,
        due_date: '2024-12-31T23:59:59Z',
        status: 'todo'
      };

      const result = await taskModel.create(taskData);

      expect(result).toHaveProperty('id');
      expect(result.title).toBe('Test Task');
      expect(result.description).toBe('Test Description');
      expect(result.assignee_id).toBe(userId);
      expect(result.list_id).toBe(listId);
      expect(result.due_date).toBe('2024-12-31T23:59:59Z');
      expect(result.status).toBe('todo');
    });

    test('should create a task without list_id and due_date', async () => {
      const taskData = {
        title: 'Simple Task',
        assignee_id: userId,
        status: 'todo'
      };

      const result = await taskModel.create(taskData);

      expect(result).toHaveProperty('id');
      expect(result.title).toBe('Simple Task');
      expect(result.list_id).toBeNull();
      expect(result.due_date).toBeNull();
    });
  });

  describe('getAllForUser with list filtering', () => {
    test('should return tasks for a specific list', async () => {
      // Create tasks in different lists
      const [otherListId] = await db('task_lists').insert({
        name: 'Other List',
        user_id: userId
      });

      await taskModel.create({
        title: 'Task in List 1',
        assignee_id: userId,
        list_id: listId,
        status: 'todo'
      });

      await taskModel.create({
        title: 'Task in List 2',
        assignee_id: userId,
        list_id: otherListId,
        status: 'todo'
      });

      const tasks = await taskModel.getAllForUser(userId, listId);

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Task in List 1');
      expect(tasks[0].list_id).toBe(listId);
    });

    test('should return all tasks for user when no list specified', async () => {
      await taskModel.create({
        title: 'Task 1',
        assignee_id: userId,
        list_id: listId,
        status: 'todo'
      });

      await taskModel.create({
        title: 'Task 2',
        assignee_id: userId,
        status: 'todo'
      });

      const tasks = await taskModel.getAllForUser(userId);

      expect(tasks).toHaveLength(2);
    });
  });

  describe('update with list and due date', () => {
    test('should update task list and due date', async () => {
      const taskData = {
        title: 'Original Task',
        assignee_id: userId,
        list_id: listId,
        status: 'todo'
      };

      const created = await taskModel.create(taskData);

      const [otherListId] = await db('task_lists').insert({
        name: 'Other List',
        user_id: userId
      });

      const updates = {
        list_id: otherListId,
        due_date: '2024-12-25T12:00:00Z',
        status: 'in-progress'
      };

      const result = await taskModel.update(created.id, updates);

      expect(result.list_id).toBe(otherListId);
      expect(result.due_date).toBe('2024-12-25T12:00:00Z');
      expect(result.status).toBe('in-progress');
    });
  });
});
