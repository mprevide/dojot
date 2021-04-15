
const mockConfig = {
  express: { trustproxy: true },
  graphql: {
    graphiql: false,
  },
  session: {
    secret: 'aabcdeddd',
    cookieName: 'dojot-backstage-cookie',
    cookieHTTPS: false,
    cookiePath: '/',
    proxy: true,
    domain: 'localhost',
    'redis.max.life.time.sec': 86400,
    'redis.max.idle.time.sec': 1800,
  },
  app: {
    'base.url': 'http://localhost:8000',
    'internal.base.url': 'http://apigw:8000',
  },
  gui: {
    'return.url': 'http://localhost:8000/return',
    'home.url': 'http://localhost:8000',
  },
  proxy: {
    target: 'http://apigw:8000',
    'log.level': 'debug',
    'log.secure': false,
  },
};

const { WebUtils } = jest.requireActual('@dojot/microservice-sdk');

const mockSdk = {
  ConfigManager: {
    getConfig: jest.fn(() => mockConfig),
    transformObjectKeys: jest.fn((obj) => obj),
  },
  Logger: jest.fn(() => ({
    // debug: jest.fn(),
    debug: (a, b, c, d) => console.log(a, b, c, d),
    // error: jest.fn(),
    error: (a, b, c, d) => console.log(a, b, c, d),
    info: (a, b, c, d) => console.log(a, b, c, d),
    warn: (a, b, c, d) => console.log(a, b, c, d),
    // info: jest.fn(),
    // warn: jest.fn(),
  })),
  WebUtils,
};
jest.mock('@dojot/microservice-sdk', () => mockSdk);

const mockRedis = {
  initialized: true,
  getManagementInstance: jest.fn(() => ({
    setFuncToCallBeforeDestroy: jest.fn(),
    set: jest.fn(),
    get: jest.fn().mockImplementation(() => Promise.resolve({realm : 'realm',
        codeVerifier: 'codeVerifier'})),
    expires: jest.fn().mockImplementation(() => Promise.resolve('ok')),
  })),
};

const mockKeycloakLogout = jest.fn();
const mockKey = {
  initialized: true,
  getRequestsInstance: jest.fn(() => ({
    logout: mockKeycloakLogout,
    getTokenByAuthorizationCode: jest.fn().mockResolvedValue({
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      refreshExpiresAt: 'refreshExpiresAt',
      accessTokenExpiresAt: 'accessTokenExpiresAt',
    }),
  })),
  buildUrlLogin: jest.fn(() => ('http://buildUrlLogin:8000')),
};
// jest.mock('../../app/keycloak', () => mockKey);

const request = require('supertest');
// const session = require('supertest-session');
// const myApp = require('../../app/express/interceptors/session/SessionStore');

// const testSession = session(myApp);

const express = require('../../app/express');

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
  isReady: jest.fn(() => (true)),
  createBeacon: jest.fn(() => ({
    die: () => jest.fn(),
  })),
};

const app = express(
  serviceStateMock,
  '/backstage/v1',
  {
    redis: mockRedis,
    keycloak: mockKey,
  },
);


describe('Test Devices Routes', () => {
//   test('Data from device - Test endpoint', (done) => {
//     // 'set-cookie': [
//     //     'connect.sid=s%3AFNfkC5bUtnYtLebjlrd2qCOebtm8RG7x.uuvZ1uhzIAoCUxLpaQ5Xn4KxCYn2LyHXmWrBr6DFo3k; HttpOnly; SameSite=Strict'
//     //   ],
//     request(app)
//       .get('/backstage/v1/auth?tenant=admin')
//       .then((response) => {
//         //   console.log('response', response);
//         expect(response.statusCode).toBe(303);
//         expect(response.redirect).toBe(true);
//         expect(response.header.location).toBe('http://buildUrlLogin:8000');
//         done();
//       });
//   });

  test('Data from device - Test endpoint', (done) => {
    // 'set-cookie': [
    //     'connect.sid=s%3AFNfkC5bUtnYtLebjlrd2qCOebtm8RG7x.uuvZ1uhzIAoCUxLpaQ5Xn4KxCYn2LyHXmWrBr6DFo3k; HttpOnly; SameSite=Strict'
    //   ],

    request(app)
      .get('/backstage/v1/auth/return?code=code&state=state&session_state=session_state')
    //   .set('cookie', ['my-session=' + cookie + '; ' + 'my-session.sig=' + hash + ';'])
      .set('cookie', 'connect.sid=s:zgXBmYLSRMj3Q5-5QHr3zsBLHQjtKk1Q.IvnJwKWG8YQFULg9jWOFkSl5T85H+F39m+fKBWEUV+I; io=SZb6mtzgm-0XGwAfAAAB; dojot-backstage-cookie=s:TnAFTgC9eMs9Pb459i2-nnLVwMRzW25p.hO2NUytwcprR1zany4m6aZTmkqfkFs+igxXYEfNMAgY; Expires=Wed, 30 Aug 2019 00:00:00 GMT')
      .then((response) => {
       // console.log('response', response);
        expect(response.statusCode).toBe(303);
        expect(response.redirect).toBe(true);
        expect(response.header.location).toBe('http://buildUrlLogin:8000');
        done();
      });
  });

  //   test('Data from device - Error query data', (done) => {
  //     mockQueryDataByMeasurement.mockRejectedValueOnce(new Error());
  //     request(app)
  //       .get('/tss/v1/devices/1234/data')
  //       .set('Authorization', `Bearer ${validToken}`)
  //       .then((response) => {
  //         expect(response.statusCode).toBe(500);
  //         done();
  //       });
  //   });

  //   test('Data from attr on a device -  Test endpoint  1', (done) => {
  //     mockQueryDataByField.mockResolvedValueOnce({
  //       result: [
  //         {
  //           ts: '2020-11-25T16:37:10.590Z',
  //           value: 'string',
  //         },
  //       ],
  //       totalItems: 1,
  //     });
  //     request(app)
  //       .get('/tss/v1/devices/1234/attrs/1234/data?dateTo=2020-11-25T20%3A03%3A06.108Z')
  //       .set('Authorization', `Bearer ${validToken}`)
  //       .then((response) => {
  //         expect(response.statusCode).toBe(200);
  //         expect(response.body).toStrictEqual({
  //           data: [{ ts: '2020-11-25T16:37:10.590Z', value: 'string' }],
  //           paging: {
  //             previous: null,
  //             current: {
  //               number: 1,
  //               url: '/tss/v1/devices/1234/attrs/1234/data?dateTo=2020-11-25T20%3A03%3A06.108Z&page=1&limit=20&order=desc',
  //             },
  //             next: null,
  //           },
  //         });
  //         done();
  //       });
  //   });

  //   test('Data from attr on a device -  More results then limit and page 2', (done) => {
  //     mockQueryDataByField.mockResolvedValueOnce({
  //       result: [
  //         {
  //           ts: '2020-11-25T16:37:10.590Z',
  //           value: 'string',
  //         },
  //       ],
  //       totalItems: 1,
  //     });
  //     request(app)
  //       .get('/tss/v1/devices/1234/attrs/1234/data?page=2&limit=1&dateTo=2020-11-25T20%3A03%3A06.108Z')
  //       .set('Authorization', `Bearer ${validToken}`)
  //       .then((response) => {
  //         expect(response.statusCode).toBe(200);
  //         expect(response.body).toStrictEqual({
  //           data: [{ ts: '2020-11-25T16:37:10.590Z', value: 'string' }],
  //           paging: {
  //             previous: {
  //               number: 1,
  //               url: '/tss/v1/devices/1234/attrs/1234/data?page=1&limit=1&dateTo=2020-11-25T20%3A03%3A06.108Z&order=desc',
  //             },
  //             current: {
  //               number: 2,
  //               url: '/tss/v1/devices/1234/attrs/1234/data?page=2&limit=1&dateTo=2020-11-25T20%3A03%3A06.108Z&order=desc',
  //             },
  //             next: {
  //               number: 3,
  //               url: '/tss/v1/devices/1234/attrs/1234/data?page=3&limit=1&dateTo=2020-11-25T20%3A03%3A06.108Z&order=desc',
  //             },
  //           },
  //         });
  //         done();
  //       });
  //   });

  //   test('Data from attr on a device -  Test endpoint 2', (done) => {
  //     mockQueryDataByField.mockResolvedValueOnce({
  //       result: [
  //         {
  //           ts: '2020-11-25T16:37:10.590Z',
  //           value: 'string',
  //         },
  //       ],
  //       totalItems: 1,
  //     });
  //     request(app)
  //       .get('/tss/v1/devices/1234/attrs/1234/data?dateTo=2020-11-25T20%3A03%3A06.108Z&limit=0')
  //       .set('Authorization', `Bearer ${validToken}`)
  //       .then((response) => {
  //         expect(response.statusCode).toBe(200);
  //         expect(response.body).toStrictEqual({
  //           data: [{ ts: '2020-11-25T16:37:10.590Z', value: 'string' }],
  //           paging: {
  //             previous: null,
  //             current: {
  //               number: 1,
  //               url: '/tss/v1/devices/1234/attrs/1234/data?dateTo=2020-11-25T20%3A03%3A06.108Z&limit=20&page=1&order=desc',
  //             },
  //             next: null,
  //           },
  //         });
  //         done();
  //       });
  //   });

  //   test('Data from attr on a device - Error query data', (done) => {
  //     mockQueryDataByField.mockRejectedValueOnce(new Error());
  //     request(app)
  //       .get('/tss/v1/devices/1234/attrs/1234/data')
  //       .set('Authorization', `Bearer ${validToken}`)
  //       .then((response) => {
  //         expect(response.statusCode).toBe(500);
  //         done();
  //       });
  //   });

  //   test('Limit higher than configured', (done) => {
  //     request(app)
  //       .get('/tss/v1/devices/1234/attrs/1234/data?limit=21')
  //       .set('Authorization', `Bearer ${validToken}`)
  //       .then((response) => {
  //         expect(response.statusCode).toBe(400);
  //         done();
  //       });
  //   });


  //   test('No token', (done) => {
  //     request(app)
  //       .get('/tss/v1/devices/1234/attrs/1234/data')
  //       .then((response) => {
  //         expect(response.statusCode).toBe(401);
  //         done();
  //       });
  //   });

  //   test('Non-standard JWT Token', (done) => {
  //     request(app)
  //       .get('/tss/v1/devices/1234/attrs/1234/data')
  //       .set('Authorization', 'Bearer XXXX')
  //       .then((response) => {
  //         expect(response.statusCode).toBe(401);
  //         done();
  //       });
  //   });


  //   test('Test with a valid token without tenant', (done) => {
  //     request(app)
  //       .get('/tss/v1/devices/1234/attrs/1234/data')
  //       .set('Authorization', `Bearer ${tokenWithoutTenant}`)
  //       .then((response) => {
  //         expect(response.statusCode).toBe(401);
  //         done();
  //       });
  //   });

//   test('Check if API-docs loads', (done) => {
//     expect.assertions(2);
//     request(app)
//       .get('/tss/v1/api-docs')
//       .then((response) => {
//         expect(response.statusCode).toBeGreaterThanOrEqual(200);
//         expect(response.statusCode).toBeLessThan(500);
//         done();
//       });
//   });
});
