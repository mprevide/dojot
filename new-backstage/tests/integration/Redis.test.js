const mockConfig = {
  app: {
    'base.url': 'http://localhost:8000',
    'internal.base.url': 'http://apigw:8000',
  },
  redis: {
    host: 'redis-backstage',
    port: 6379,
    db: 0,
    connect_timeout: 3600000,
    'reconnect.after': 5000,
  },
  session: {
    'redis.max.life.time.sec': 86400,
    'redis.max.idle.time.sec': 1800,
  },
};

const mockSdk = {
  ConfigManager: {
    getConfig: jest.fn(() => mockConfig),
    transformObjectKeys: jest.fn((obj) => obj),
  },
  Logger: jest.fn(() => ({
    debug: () => jest.fn(),
    // error: () => jest.fn(),
    error: (a, b, c, d) => console.log(a, b, c, d),
    info: () => jest.fn(),
    warn: () => jest.fn(),
  })),
};
jest.mock('@dojot/microservice-sdk', () => mockSdk);
const reqEventMapMock = {};
const mockSendCommand = jest.fn();
const mockSubscribe = jest.fn((cannel, callback) => callback(null, true));

// https://github.com/dojot/dojot/blob/afb17ae4ef0fd20ee600332d681fa12adce0180e/tools/cert-sidecar/test/integration/OpensslWrapper.test.js#L49
const mockRedis = {
  createClient: jest.fn(() => ({
    on: jest.fn().mockImplementation((event, onCallback) => {
      if (!reqEventMapMock[event]) {
        reqEventMapMock[event] = [];
      }
      reqEventMapMock[event].push(onCallback);
    }), // not promisify
    quit: jest.fn((callback) => callback()), // this.redisSubAsync.quit();
    get: jest.fn((key, callback) => callback(null, true)), // this.get(sid);
    // // redisPub.set(this.prefixSession + sid, value);
    set: jest.fn((key, value, callback) => callback(null, true)),
    // this.redisPub.expire(this.prefixSession + sid, this.maxLifetime);
    expire: jest.fn((key, time, callback) => callback(null, true)),
    // this.redisPub.del(this.prefixSession + sid);
    del: jest.fn((key, callback) => callback(null, true)),
    send_command: mockSendCommand, // not promisify
    // this.redisSubAsync.unsubscribe();
    unsubscribe: jest.fn((callback) => callback()),
    // set: jest.fn((a, b, c, d, callback) => callback(null, true)),
    subscribe: mockSubscribe,
  })),
};
jest.mock('redis', () => mockRedis);

const mockUtils = {
  replaceTLSFlattenConfigs: jest.fn((a) => a),
};

jest.mock('../../app/Utils', () => mockUtils);


const mockAddHealthChecker = jest.fn();
const mockRegisterShutdownHandler = jest.fn();
const mockSignalReady = jest.fn();
const mocksignalNotReady = jest.fn();
const serviceStateMock = {
  addHealthChecker: mockAddHealthChecker,
  registerShutdownHandler: mockRegisterShutdownHandler,
  signalReady: mockSignalReady,
  signalNotReady: mocksignalNotReady,
};


const redis = require('../../app/redis');

describe('redis tests', () => {
  beforeAll(() => {
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
  });
  afterEach(() => {
  });
  test('init ok', async () => {
    await redis.init(serviceStateMock);

    expect(redis.initialized).toBe(true);
    reqEventMapMock.connect[0]();
    await reqEventMapMock.connect[1]();

    reqEventMapMock.ready[0]();
    reqEventMapMock.ready[1]();


    expect(mockSendCommand)
      .toHaveBeenCalled();
    expect(mockSubscribe)
      .toHaveBeenCalled();
    expect(mockSignalReady)
      .toHaveBeenNthCalledWith(1, 'redis-pub');
    expect(mockSignalReady)
      .toHaveBeenNthCalledWith(2, 'redis-sub');
    expect(mockSignalReady)
      .toHaveBeenNthCalledWith(3, 'redis-pub');
    expect(mockSignalReady)
      .toHaveBeenNthCalledWith(4, 'redis-sub');
  });
});
