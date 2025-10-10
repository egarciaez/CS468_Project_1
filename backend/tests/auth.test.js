//Tests registration & login endpoints with Jest and Supertest.

const request = require('supertest');
const app = require('../src/server');
const db = require('../src/db');

beforeAll(async () => {
  // run migrations on the in-memory DB
  await db.migrate.latest();
});

// Close DB after tests
afterAll(async () => {
  await db.destroy();
});

describe('Auth endpoints (register/login)', () => {
  test('registers and logs in a user', async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'password123' });
    expect(register.statusCode).toBe(201);
    expect(register.body).toHaveProperty('username', 'alice');

    const login = await request(app)
      .post('/api/auth/login')
      .send({ username: 'alice', password: 'password123' });
    expect(login.statusCode).toBe(200);
    expect(login.body).toHaveProperty('token');
  });

  test('rejects duplicate username', async () => {
    await request(app).post('/api/auth/register').send({ username: 'bob', password: 'pw' });
    const res = await request(app).post('/api/auth/register').send({ username: 'bob', password: 'pw2' });
    expect(res.statusCode).toBe(400);
  });
});

