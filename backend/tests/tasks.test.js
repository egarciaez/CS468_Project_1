//Tests protected task endpoints.

const request = require('supertest');
const app = require('../src/server');
const db = require('../src/db');

beforeAll(async () => {
  await db.migrate.latest();
});

afterAll(async () => {
  await db.destroy();
});

describe('Task endpoints (protected)', () => {
  let token;
  beforeAll(async () => {
    // Register + login user for testing
    await request(app).post('/api/auth/register').send({ username: 'testuser', password: 'pw' });
    const login = await request(app).post('/api/auth/login').send({ username: 'testuser', password: 'pw' });
    token = login.body.token;
  });

  test('create and fetch tasks', async () => {
    // Create task
    const create = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'First task', description: 'do this' });
    expect(create.statusCode).toBe(201);
    expect(create.body).toHaveProperty('title', 'First task');

    // Get task list
    const list = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);
    expect(list.statusCode).toBe(200);
    expect(Array.isArray(list.body)).toBeTruthy();
    expect(list.body.length).toBeGreaterThanOrEqual(1);
  });

  test('rejects unauthenticated access', async () => {
    // Without token should be rejected
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(401);
  });
});
