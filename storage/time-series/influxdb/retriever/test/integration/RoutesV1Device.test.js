
const mockConfig = {
  paginate: { 'default.max.limit': 20 },
  express: { trustproxy: true },
};
const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlIjoidGVuYW50MSIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMn0.pmuFC9u1K3oxHlf4nUsjJp1KyRz-JxWN1QS7L5AJMno';
const tokenWithoutTenant = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
// const mockLogError = jest.fn();
const mockSdk = {
  ConfigManager: {
    getConfig: jest.fn(() => mockConfig),
    transformObjectKeys: jest.fn((obj) => obj),
  },
  // ServiceStateManager:
  //   jest.fn().mockImplementation(() => ({
  //     signalReady: mockSignalReady,
  //     signalNotReady: mockNotSignalReady,
  //     registerShutdownHandler: mockRegisterShutdownHandler,
  //     shutdown: mockShutdown,
  //   })),
  Logger: jest.fn(() => ({
    debug: jest.fn(),
    // error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    // debug: (a, b, c, d) => console.log(a, b, c, d),
    error: (a, b, c, d) => console.log(a, b, c, d),
    // info: (a, b, c, d) => console.log(a, b, c, d),
    // warn: (a, b, c, d) => console.log(a, b, c, d),
  })),
};
jest.mock('@dojot/microservice-sdk', () => mockSdk);

const request = require('supertest');
const path = require('path');
const express = require('../../app/express');
const devicesRoutes = require('../../app/express/routes/v1/Devices');

const openApiPath = path.join(__dirname, '../../api/v1.yml');

const mockSignalReady = jest.fn();
const mockNotSignalReady = jest.fn();
const mockRegisterShutdownHandler = jest.fn();
const mockShutdown = jest.fn();
const serviceStateMock = {
  signalReady: mockSignalReady,
  signalNotReady: mockNotSignalReady,
  registerShutdownHandler: mockRegisterShutdownHandler,
  shutdown: mockShutdown,
  isServerShuttingDown: jest.fn(),
  createBeacon: jest.fn(() => ({
    die: () => jest.fn(),
  })),
};

const mockQueryDataByField = jest.fn();
const mockQueryDataByMeasurement = jest.fn();
const app = express(
  [
    devicesRoutes({
      mountPoint: '/tss/v1',
      queryDataByField: mockQueryDataByField,
      queryDataByMeasurement: mockQueryDataByMeasurement,
    }),
  ],
  serviceStateMock,
  openApiPath,
);

describe('Test the root path', () => {
  test('It should response the GET method', (done) => {
    mockQueryDataByField.mockResolvedValueOnce({
      result: [
        {
          ts: '2020-11-25T16:37:10.590Z',
          value: 'string',
        },
      ],
      totalItems: 1,
    });
    request(app)
      .get('/tss/v1/devices/1234/attrs/1234/data?dateTo=2020-11-25T20%3A03%3A06.108Z')
      .set('Authorization', `Bearer ${validToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({
          data: [{ ts: '2020-11-25T16:37:10.590Z', value: 'string' }],
          paging: {
            previous: null,
            current: {
              number: 1,
              url: '/tss/v1/devices/1234/attrs/1234/data?dateTo=2020-11-25T20%3A03%3A06.108Z&page=1&limit=20&order=desc',
            },
            next: null,
          },
        });
        done();
      });
  });

  test('It 2 should response the GET method', (done) => {
    mockQueryDataByField.mockResolvedValueOnce({
      result: [
        {
          ts: '2020-11-25T16:37:10.590Z',
          value: 'string',
        },
      ],
      totalItems: 1,
    });
    request(app)
      .get('/tss/v1/devices/1234/attrs/1234/data?dateTo=2020-11-25T20%3A03%3A06.108Z&limit=0')
      .set('Authorization', `Bearer ${validToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({
          data: [{ ts: '2020-11-25T16:37:10.590Z', value: 'string' }],
          paging: {
            previous: null,
            current: {
              number: 1,
              url: '/tss/v1/devices/1234/attrs/1234/data?dateTo=2020-11-25T20%3A03%3A06.108Z&limit=20&page=1&order=desc',
            },
            next: null,
          },
        });
        done();
      });
  });

  test('It should response the GET method', (done) => {
    request(app)
      .get('/tss/v1/devices/1234/attrs/1234/data?limit=21')
      .set('Authorization', `Bearer ${validToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(400);
        done();
      });
  });


  test('It should response the GET method', (done) => {
    request(app)
      .get('/tss/v1/devices/1234/attrs/1234/data')
      .then((response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });

  test('It should response the GET method', (done) => {
    request(app)
      .get('/tss/v1/devices/1234/attrs/1234/data')
      .set('Authorization', 'Bearer XXXX')
      .then((response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });

  test('It should response the GET method', (done) => {
    mockQueryDataByField.mockRejectedValueOnce(new Error());
    request(app)
      .get('/tss/v1/devices/1234/attrs/1234/data')
      .set('Authorization', `Bearer ${validToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(500);
        done();
      });
  });

  test('It should response the GET method', (done) => {
    request(app)
      .get('/tss/v1/devices/1234/attrs/1234/data')
      .set('Authorization', `Bearer ${tokenWithoutTenant}`)
      .then((response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });

  test('It should response the GET method', (done) => {
    expect.assertions(2);
    request(app)
      .get('/tss/v1/api-docs')
      .then((response) => {
        expect(response.statusCode).toBeGreaterThanOrEqual(200);
        expect(response.statusCode).toBeLessThan(500);
        done();
      });
  });


  test('It should response the GET method', (done) => {
    mockQueryDataByField.mockResolvedValueOnce({
      result: [
        {
          ts: '2020-11-25T16:37:10.590Z',
          value: 'string',
        },
      ],
      totalItems: 1,
    });
    request(app)
      .get('/tss/v1/devices/1234/attrs/1234/data?dateTo=2020-11-25T20%3A03%3A06.108Z')
      .set('Authorization', `Bearer ${validToken}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({
          data: [{ ts: '2020-11-25T16:37:10.590Z', value: 'string' }],
          paging: {
            previous: null,
            current: {
              number: 1,
              url: '/tss/v1/devices/1234/attrs/1234/data?dateTo=2020-11-25T20%3A03%3A06.108Z&page=1&limit=20&order=desc',
            },
            next: null,
          },
        });
        done();
      });
  });
});
