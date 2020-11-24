/* eslint-disable no-unused-vars */
const mockSdk = {
  Logger: jest.fn(() => ({
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),

  })),
};
jest.mock('@dojot/microservice-sdk', () => mockSdk);

const mockGetQueryRows = jest.fn();
const mockInflux = {
  InfluxDB: jest.fn().mockImplementation(() => ({
    getQueryApi: jest.fn().mockImplementation(() => ({
      queryRows: mockGetQueryRows,
    })),
  })),
  flux: jest.fn((a) => a),
  fluxExpression: jest.fn((a) => a),
  fluxDateTime: jest.fn((a) => a),
  fluxInteger: jest.fn((a) => a),
  fluxString: jest.fn((a) => a),
};
jest.mock('@influxdata/influxdb-client', () => mockInflux);

const mockHttpError = jest.fn((statusCode, message) => {
  const error = {
    message,
    statusCode,
  };
  error.prototype = Error.prototype;
  return error;
});
jest.mock('http-errors', () => mockHttpError);

const DataQuery = require('../../app/influx/DataQuery');

describe('Test the root path', () => {
  let dataQuery = null;
  beforeAll(() => {
    dataQuery = null;
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
    dataQuery = new DataQuery('url', 'token', 'defaultBucket');
  });

  test('instantiate class and init', async () => {
    const tableMeta1 = { toObject: jest.fn(() => ({ _time: 'ts-time', _value: '"value"' })) };
    const tableMeta2 = { toObject: jest.fn(() => ({ _time: 'ts-time', _value: 10 })) };
    const tableMeta3 = { toObject: jest.fn(() => ({ _time: 'ts-time', _value: true })) };
    mockGetQueryRows.mockImplementationOnce(
      (fluxQuery, { next, error, complete }) => {
        next('x1', tableMeta1);
        next('x2', tableMeta2);
        next('x3', tableMeta3);
        complete();
      },
    );

    const x = await dataQuery.queryByField('org', 'measurement', 'field', {}, {}, 'desc');
    expect(x).toStrictEqual({
      result: [{ ts: 'ts-time', value: 'value' }, {
        ts: 'ts-time',
        value: 10,
      }, {
        ts: 'ts-time',
        value: true,
      }],
      totalItems: 3,
    });
  });

  test('instantiate class and init', async () => {
    expect.assertions(2);
    mockGetQueryRows.mockImplementationOnce(
      (fluxQuery, { next, error }) => {
        const error2 = {
          body: JSON.stringify({ message: 'message' }),
          statusMessage: 'statusMessage',
          statusCode: 500,
        };
        error2.prototype = Error.prototype;
        error(error2);
      },
    );

    try {
      await dataQuery.queryByField('org', 'measurement', 'field');
    } catch (e) {
      expect(e.statusCode).toBe(500);
      expect(e.message).toBe('InfluxDB: statusMessage -> message');
    }
  });

  test('instantiate class and init', async () => {
    expect.assertions(1);
    mockGetQueryRows.mockImplementationOnce(
      (fluxQuery, { next, error }) => {
        error(new Error('Generic error'));
      },
    );

    try {
      await dataQuery.queryByField('org', 'measurement', 'field', {}, {}, 'desc');
    } catch (e) {
      expect(e.message).toBe('Generic error');
    }
  });

  test('instantiate class and init', async () => {
    const tableMeta1 = { toObject: jest.fn(() => ({ _time: 'ts-time', _value: '"value"' })) };
    mockGetQueryRows.mockImplementationOnce(
      (fluxQuery, { next, error, complete }) => {
        next('x1', tableMeta1);
        complete();
      },
    );

    const x = await dataQuery.queryByField('org', 'measurement', 'field', { dateFrom: 'x', dateTo: 'y' }, { limit: 10, page: 1 }, 'asc');
    expect(x).toStrictEqual({
      result: [{ ts: 'ts-time', value: 'value' }],
      totalItems: 1,
    });
  });
});
