const db = require('../src/db');
const taskListModel = require('../src/models/taskListModel');

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

describe('TaskList Model', () => {
  let userId;

  beforeEach(async () => {
    // Create a test user
    const [userIdResult] = await db('users').insert({
      username: 'testuser',
      password: 'hashedpassword',
      email: 'test@example.com'
    });
    userId = userIdResult;
  });

  describe('create', () => {
    test('should create a new task list', async () => {
      const taskListData = {
        name: 'Math Homework',
        description: 'All math related tasks',
        user_id: userId
      };

      const result = await taskListModel.create(taskListData);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Math Homework');
      expect(result.description).toBe('All math related tasks');
      expect(result.user_id).toBe(userId);
    });

    test('should create a task list with minimal data', async () => {
      const taskListData = {
        name: 'Simple List',
        user_id: userId
      };

      const result = await taskListModel.create(taskListData);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Simple List');
      expect(result.description).toBeNull();
    });
  });

  describe('findByUserId', () => {
    test('should return all task lists for a user', async () => {
      // Create multiple task lists
      await taskListModel.create({
        name: 'List 1',
        user_id: userId
      });
      await taskListModel.create({
        name: 'List 2',
        user_id: userId
      });

      const result = await taskListModel.findByUserId(userId);

      expect(result).toHaveLength(2);
      expect(result[0].user_id).toBe(userId);
      expect(result[1].user_id).toBe(userId);
    });

    test('should return empty array for user with no lists', async () => {
      const result = await taskListModel.findByUserId(userId);
      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    test('should return task list by id', async () => {
      const taskListData = {
        name: 'Test List',
        user_id: userId
      };

      const created = await taskListModel.create(taskListData);
      const result = await taskListModel.findById(created.id);

      expect(result).toHaveProperty('id', created.id);
      expect(result.name).toBe('Test List');
    });

    test('should return undefined for non-existent id', async () => {
      const result = await taskListModel.findById(999);
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    test('should update task list', async () => {
      const taskListData = {
        name: 'Original Name',
        description: 'Original Description',
        user_id: userId
      };

      const created = await taskListModel.create(taskListData);
      const updates = {
        name: 'Updated Name',
        description: 'Updated Description'
      };

      const result = await taskListModel.update(created.id, updates);

      expect(result.name).toBe('Updated Name');
      expect(result.description).toBe('Updated Description');
    });
  });

  describe('delete', () => {
    test('should delete task list', async () => {
      const taskListData = {
        name: 'To Delete',
        user_id: userId
      };

      const created = await taskListModel.create(taskListData);
      const deletedCount = await taskListModel.delete(created.id);

      expect(deletedCount).toBe(1);

      const result = await taskListModel.findById(created.id);
      expect(result).toBeUndefined();
    });
  });
});
