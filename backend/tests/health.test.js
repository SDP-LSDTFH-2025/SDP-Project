const request = require('supertest');
const app = require('../server');

describe('Health Check Endpoint', () => {
  test('GET /health should return 200 and status OK', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  test('GET /health should return valid timestamp', async () => {
    const response = await request(app).get('/health');
    
    const timestamp = new Date(response.body.timestamp);
    expect(timestamp.getTime()).toBeGreaterThan(0);
  });

  test('GET /health should return valid uptime', async () => {
    const response = await request(app).get('/health');
    
    expect(response.body.uptime).toBeGreaterThanOrEqual(0);
  });
});

describe('API Documentation Endpoint', () => {
  test('GET /api-docs should return 200', async () => {
    const response = await request(app).get('/api-docs');
    
    expect(response.status).toBe(200);
  });
});

describe('404 Handler', () => {
  test('GET /nonexistent should return 404', async () => {
    const response = await request(app).get('/nonexistent');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Route not found');
    expect(response.body).toHaveProperty('path', '/nonexistent');
  });
}); 