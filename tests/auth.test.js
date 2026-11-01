

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const bcrypt = require('bcrypt');

const app = require('../server');
const { db, createUser } = require('../database/db');

// Unique test accounts keep these tests separate from your real accounts.
const testId = Date.now();
const userEmail = `test-user-${testId}@example.com`;
const adminEmail = `test-admin-${testId}@example.com`;
const adminPassword = 'TestAdminPassword123!';

before(async () => {
    const passwordHash = await bcrypt.hash(adminPassword, 4);
    createUser(adminEmail, passwordHash, 'Admin');
});

after(() => {
    // Remove the test accounts after the tests finish.
    db.prepare('DELETE FROM users WHERE email IN (?, ?)').run(
        userEmail,
        adminEmail
    );
});

test('Authentication and authorization security tests', async (t) => {
    const userAgent = request.agent(app);
    const adminAgent = request.agent(app);

    await t.test('Unauthenticated users cannot access Admin routes', async () => {
        const response = await request(app).get('/api/admin/users');

        assert.equal(response.status, 401);
    });

    await t.test('Public registration always creates a User role', async () => {
        const response = await userAgent
            .post('/api/auth/register')
            .send({
                email: userEmail,
                password: 'TestUserPass123!',
                role: 'Admin'
            });

        assert.equal(response.status, 201);
        assert.equal(response.body.user.role, 'User');
    });

    await t.test('Users can log in successfully', async () => {
        const response = await userAgent
            .post('/api/auth/login')
            .send({
                email: userEmail,
                password: 'TestUserPass123!'
            });

        assert.equal(response.status, 200);
        assert.equal(response.body.user.role, 'User');
    });

    await t.test('The session identifies the logged-in User', async () => {
        const response = await userAgent.get('/api/auth/me');

        assert.equal(response.status, 200);
        assert.equal(response.body.user.email, userEmail);
        assert.equal(response.body.user.role, 'User');
    });

    await t.test('Regular Users cannot access Admin routes', async () => {
        const response = await userAgent.get('/api/admin/users');

        assert.equal(response.status, 403);
    });

    await t.test('Admins can log in and access the user list', async () => {
        const loginResponse = await adminAgent
            .post('/api/auth/login')
            .send({
                email: adminEmail,
                password: adminPassword
            });

        assert.equal(loginResponse.status, 200);
        assert.equal(loginResponse.body.user.role, 'Admin');

        const usersResponse = await adminAgent.get('/api/admin/users');

        assert.equal(usersResponse.status, 200);
        assert.equal(usersResponse.body.message, 'Admin access granted.');

        assert.ok(
            usersResponse.body.users.some(user => user.email === userEmail)
        );

        // Password hashes must never appear in the Admin user list.
        assert.equal(
            Object.hasOwn(usersResponse.body.users[0], 'password_hash'),
            false
        );
    });

    await t.test('Logout destroys the login session', async () => {
        const logoutResponse = await userAgent.post('/api/auth/logout');

        assert.equal(logoutResponse.status, 200);

        const sessionResponse = await userAgent.get('/api/auth/me');

        assert.equal(sessionResponse.status, 401);
    });
});
