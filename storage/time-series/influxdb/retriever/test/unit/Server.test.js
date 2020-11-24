/* eslint-disable security/detect-object-injection */

const mockConfig = {
  server: { host: '0.0.0.0', port: 3000 },
};

const mockLogError = jest.fn();
const mockSdk = {
  ConfigManager: {
    getConfig: jest.fn(() => mockConfig),
    transformObjectKeys: jest.fn((obj) => obj),
  },
  Logger: jest.fn(() => ({
    debug: jest.fn(),
    error: mockLogError,
    info: jest.fn(),
    warn: jest.fn(),
  })),
};
jest.mock('@dojot/microservice-sdk', () => mockSdk);

const mockSignalReady = jest.fn();
const mockNotSignalReady = jest.fn();
const mockRegisterShutdownHandler = jest.fn();
const mockShutdown = jest.fn();
const serviceStateMock = {
  signalReady: mockSignalReady,
  signalNotReady: mockNotSignalReady,
  registerShutdownHandler: mockRegisterShutdownHandler,
  shutdown: mockShutdown,
};

const reqEventMapMock = {};
const mockServerFactory = () => ({
  on: jest.fn().mockImplementation((event, onCallback) => {
    reqEventMapMock[event] = onCallback;
  }),
  listen: jest.fn(),
  address: jest.fn(),
});
jest.mock('../../app/sdk/web/server-factory', () => mockServerFactory);

jest.mock('http-errors');

const Server = require('../../app/Server');

/**
 * @param {string} apiResponseString
 * @param {string} httpError
 * @returns {Object}
 */
describe('Server', () => {
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

  test('instantiate class and init', () => {
    server = new Server(serviceStateMock);
    server.init(() => {});
  });


  test('check when listening was emitted ', () => {
    reqEventMapMock.listening();
    expect(serviceStateMock.signalReady).toHaveBeenCalledWith('server');
  });

  test('check when close was emitted ', () => {
    reqEventMapMock.close();
    expect(serviceStateMock.signalNotReady).toHaveBeenCalledWith('server');
  });

  test('check when error was emitted ', () => {
    const e = new Error('test');
    reqEventMapMock.error(e);
    expect(mockLogError).toHaveBeenCalledWith('Server experienced an error:', e);
  });

  test('check when error was emitted ', async () => {
    await server.registerShutdown();
    expect(mockRegisterShutdownHandler).toHaveBeenCalled();
  });
});
