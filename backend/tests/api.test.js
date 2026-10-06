import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { pool, initDatabase } from '../src/config/db.js';

describe('Project Management System API Test Suite', () => {
  let alexToken = '';
  let jordanToken = '';
  let jordanProjectId = '';
  let jordanTaskId = '';
  let createdProjectId = '';
  let createdTaskId = '';

  before(async () => {
    await initDatabase();

    // Log in as Alex
    const alexRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex.dev@example.com', password: 'Password123!' });
    assert.equal(alexRes.status, 200);
    assert.ok(alexRes.body.data.accessToken);
    alexToken = alexRes.body.data.accessToken;

    // Log in as Jordan
    const jordanRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jordan.qa@example.com', password: 'Password123!' });
    assert.equal(jordanRes.status, 200);
    assert.ok(jordanRes.body.data.accessToken);
    jordanToken = jordanRes.body.data.accessToken;

    // Fetch Jordan's project to test IDOR
    const jordanProjectsRes = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${jordanToken}`);
    assert.equal(jordanProjectsRes.status, 200);
    assert.ok(jordanProjectsRes.body.data.length > 0);
    jordanProjectId = jordanProjectsRes.body.data[0].id;

    // Fetch Jordan's task
    const jordanTasksRes = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${jordanToken}`);
    assert.equal(jordanTasksRes.status, 200);
    assert.ok(jordanTasksRes.body.data.length > 0);
    jordanTaskId = jordanTasksRes.body.data[0].id;
  });

  after(async () => {
    await pool.end();
  });

  describe('Authentication & Security', () => {
    test('POST /api/auth/register fails with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Duplicate Alex',
          email: 'alex.dev@example.com',
          password: 'Password123!',
        });
      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
      assert.ok(res.body.error.includes('already exists'));
    });

    test('POST /api/auth/login fails with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alex.dev@example.com', password: 'WrongPassword!' });
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.ok(res.body.error.includes('Invalid email or password'));
    });

    test('GET /api/auth/me returns authenticated profile without passwordHash', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${alexToken}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.data.email, 'alex.dev@example.com');
      assert.equal(res.body.data.passwordHash, undefined);
    });

    test('Protected route fails without Authorization header', async () => {
      const res = await request(app).get('/api/projects');
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    test('Protected route fails with invalid token and returns meaningful expiration message', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', 'Bearer invalid.expired.token');
      assert.equal(res.status, 401);
      assert.equal(res.body.error, 'Your session expired. Please sign in again.');
    });
  });

  describe('Project Management & Tenancy Isolation', () => {
    test('GET /api/projects lists only owned projects with pagination', async () => {
      const res = await request(app)
        .get('/api/projects?page=1&pageSize=10')
        .set('Authorization', `Bearer ${alexToken}`);
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.pagination);
      assert.equal(res.body.pagination.page, 1);
      // Ensure Alex does not see Jordan's project in the list
      const hasJordanProject = res.body.data.some((p) => p.id === jordanProjectId);
      assert.equal(hasJordanProject, false);
    });

    test('POST /api/projects creates a new project with validation', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${alexToken}`)
        .send({
          name: 'CI/CD Automated Deployment Pipeline',
          description: 'GitHub actions workflow and automated integration testing.',
          status: 'NOT_STARTED',
          startDate: '2026-10-10',
          endDate: '2026-11-10',
        });
      assert.equal(res.status, 201);
      assert.equal(res.body.data.name, 'CI/CD Automated Deployment Pipeline');
      createdProjectId = res.body.data.id;
    });

    test('POST /api/projects rejects invalid date range (endDate < startDate)', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${alexToken}`)
        .send({
          name: 'Invalid Date Project',
          startDate: '2026-10-20',
          endDate: '2026-10-10',
        });
      assert.equal(res.status, 400);
      assert.ok(res.body.error.includes('End date must be after or equal to start date'));
    });

    test('PUT /api/projects/:id updates project details', async () => {
      const res = await request(app)
        .put(`/api/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${alexToken}`)
        .send({
          status: 'IN_PROGRESS',
          description: 'Updated pipeline with Docker staging test containers.',
        });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.status, 'IN_PROGRESS');
      assert.equal(res.body.data.description, 'Updated pipeline with Docker staging test containers.');
    });
  });

  describe('Strict IDOR Protection Scenarios', () => {
    test('IDOR: Alex CANNOT view Jordan private project (404/not found)', async () => {
      const res = await request(app)
        .get(`/api/projects/${jordanProjectId}`)
        .set('Authorization', `Bearer ${alexToken}`);
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    test('IDOR: Alex CANNOT update Jordan private project (404/not found)', async () => {
      const res = await request(app)
        .put(`/api/projects/${jordanProjectId}`)
        .set('Authorization', `Bearer ${alexToken}`)
        .send({ name: 'Hacked by Alex' });
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    test('IDOR: Alex CANNOT delete Jordan private project (404/not found)', async () => {
      const res = await request(app)
        .delete(`/api/projects/${jordanProjectId}`)
        .set('Authorization', `Bearer ${alexToken}`);
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    test('IDOR: Alex CANNOT view Jordan private task (404/not found)', async () => {
      const res = await request(app)
        .get(`/api/tasks/${jordanTaskId}`)
        .set('Authorization', `Bearer ${alexToken}`);
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    test('IDOR: Alex CANNOT update Jordan private task (404/not found)', async () => {
      const res = await request(app)
        .put(`/api/tasks/${jordanTaskId}`)
        .set('Authorization', `Bearer ${alexToken}`)
        .send({ name: 'Tampered task title' });
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    test('IDOR: Alex CANNOT delete Jordan private task (404/not found)', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${jordanTaskId}`)
        .set('Authorization', `Bearer ${alexToken}`);
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    test('IDOR: Alex CANNOT create a task in Jordan project (404/forbidden)', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${alexToken}`)
        .send({
          projectId: jordanProjectId,
          name: 'Unauthorized task injection',
          priority: 'HIGH',
        });
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });
  });

  describe('Task Management', () => {
    test('POST /api/tasks creates a task under owned project', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${alexToken}`)
        .send({
          projectId: createdProjectId,
          name: 'Configure Docker compose file',
          description: 'Define services for app, database, and test harness.',
          priority: 'HIGH',
          status: 'PENDING',
          dueDate: '2026-10-25',
        });
      assert.equal(res.status, 201);
      assert.equal(res.body.data.name, 'Configure Docker compose file');
      assert.equal(res.body.data.priority, 'HIGH');
      createdTaskId = res.body.data.id;
    });

    test('PUT /api/tasks/:id updates task status and priority', async () => {
      const res = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${alexToken}`)
        .send({
          status: 'COMPLETED',
          priority: 'LOW',
        });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.status, 'COMPLETED');
      assert.equal(res.body.data.priority, 'LOW');
    });

    test('DELETE /api/tasks/:id deletes owned task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${alexToken}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.data.deleted, true);
    });

    test('DELETE /api/projects/:id cleans up project and cascades', async () => {
      const res = await request(app)
        .delete(`/api/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${alexToken}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.data.deleted, true);
    });
  });

  describe('Dashboard Real-Time Aggregation', () => {
    test('GET /api/dashboard returns calculated metrics from MySQL', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${alexToken}`);
      assert.equal(res.status, 200);
      assert.ok(res.body.data.metrics);
      assert.ok(typeof res.body.data.metrics.totalProjects === 'number');
      assert.ok(typeof res.body.data.metrics.totalTasks === 'number');
      assert.ok(typeof res.body.data.metrics.completionPercentage === 'number');
      assert.ok(Array.isArray(res.body.data.statusBreakdown));
      assert.ok(Array.isArray(res.body.data.recentProjects));
      assert.ok(Array.isArray(res.body.data.upcomingTasks));
      assert.ok(res.body.data.metrics.totalProjects >= 1);
    });
  });
});
