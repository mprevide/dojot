/* eslint-disable security/detect-object-injection */

// const mockConfig = {
//   server: { host: '0.0.0.0', port: 3000 },
// };

// const reqEventMapMock = {};
// const mockServerFactory = () => ({
//   on: jest.fn().mockImplementation((event, onCallback) => {
//     reqEventMapMock[event] = onCallback;
//   }),
//   listen: jest.fn(),
//   address: jest.fn(),
// });
// const mockLogError = jest.fn();
// const mockSdk = {
//   ConfigManager: {
//     // getConfig: jest.fn(() => mockConfig),
//     transformObjectKeys: jest.fn((obj) => obj),
//   },
// //   Logger: jest.fn(() => ({
// //     debug: jest.fn(),
// //     error: mockLogError,
// //     info: jest.fn(),
// //     warn: jest.fn(),
// //   })),
// //   WebUtils: {
// //     createServer: mockServerFactory,
// //   },
// };
// jest.mock('@dojot/microservice-sdk', () => mockSdk);

// const mockSignalReady = jest.fn();
// const mockNotSignalReady = jest.fn();
// const mockRegisterShutdownHandler = jest.fn();
// const mockShutdown = jest.fn();
// const serviceStateMock = {
//   signalReady: mockSignalReady,
//   signalNotReady: mockNotSignalReady,
//   registerShutdownHandler: mockRegisterShutdownHandler,
//   shutdown: mockShutdown,
// };

// jest.mock('http-errors');

// const mockTerminate = jest.fn();
// const mockHttpTerminator = {
//   createHttpTerminator: jest.fn(() => ({
//     terminate: mockTerminate,
//   })),
// };

// jest.mock('http-terminator', () => mockHttpTerminator);

// const randomString = require('randomstring');
// const crypto = require('crypto');
// const base64url = require('base64url');
// const { flatten, unflatten } = require('flat');
// const camelCase = require('lodash.camelcase');
// const {
//   ConfigManager: { transformObjectKeys },
// } = require('@dojot/microservice-sdk');
// const fs = require('fs');

const mockRandomString = {
  generate: jest.fn(() => ('randomString')),
};
jest.mock('randomstring', () => mockRandomString);

const path = require('path');
const {
  replaceTLSFlattenConfigs,
  generatePKCEChallenge,
} = require('../../app/Utils');

describe('Utils', () => {
  let server = null;
  beforeAll(() => {
    server = null;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('replaceTLSFlattenConfigs with .tls', () => {
    const x = replaceTLSFlattenConfigs({
      name: 'a',
      port: 5432,
      'name.tls': 'b',
      'tls.ca': path.join(__dirname, 'certs/ca.pem'),
      'tls.cert': path.join(__dirname, 'certs/cert.pem'),
      'tls.key': path.join(__dirname, 'certs/key.pem'),
      'tls.request.cert': true,
      'tls.reject.unauthorized': true,
    });

    expect(x).toStrictEqual({
      name: 'a',
      port: 5432,
      'name.tls': 'b',
      tls: {
        ca: 'CA',
        cert: 'CERT',
        key: 'KEY',
        requestCert: true,
        rejectUnauthorized: true,
      },
    });
  });

  test('replaceTLSFlattenConfigs without .tls or .ssl', () => {
    const configSame = {
      name: 'b',
      port: 5432,
      'name.tls': 'c',
      'name.tls.x': 'c',
    };
    const x = replaceTLSFlattenConfigs(configSame);

    expect(x).toStrictEqual(configSame);
  });

  test('replaceTLSFlattenConfigs with .ssl', () => {
    const x = replaceTLSFlattenConfigs({
      name: 'a',
      port: 5432,
      'name.name': 'b',
      'ssl.ca': path.join(__dirname, 'certs/ca.pem'),
      'ssl.cert': path.join(__dirname, 'certs/cert.pem'),
      'ssl.key': path.join(__dirname, 'certs/key.pem'),
      'ssl.request.cert': true,
      'ssl.reject.unauthorized': true,
    });

    expect(x).toStrictEqual({
      name: 'a',
      port: 5432,
      'name.name': 'b',
      ssl: {
        ca: 'CA',
        cert: 'CERT',
        key: 'KEY',
        requestCert: true,
        rejectUnauthorized: true,
      },
    });
  });

  test('generatePKCEChallenge', () => {
    expect(generatePKCEChallenge()).toStrictEqual({
      codeChallenge: 'y7SmQAY3jsJhhA05q2zHYEjz2tFuGbfbUI-xG6RZTFE',
      codeVerifier: 'randomString',
    });
  });
});
