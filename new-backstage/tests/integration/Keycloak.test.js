const mockConfig = {
  app: {
    'base.url': 'http://localhost:8000',
    'internal.base.url': 'http://apigw:8000',
  },
  keycloak: {
    'url.api.gateway': 'http://apigw:8000/auth',
    'url.external': 'http://localhost:8000/auth',
    'healthcheck.ms': 30000,
    'public.client.id': 'gui',
    'code.challenge.method': 'S256',
  },
};

const mockSdk = {
  ConfigManager: {
    getConfig: jest.fn(() => mockConfig),
    transformObjectKeys: jest.fn((obj) => obj),
  },
  Logger: jest.fn(() => ({
    debug: () => jest.fn(),
    error: () => jest.fn(),
    info: () => jest.fn(),
    warn: () => jest.fn(),
  })),
};
jest.mock('@dojot/microservice-sdk', () => mockSdk);

const mockAddHealthChecker = jest.fn();
const mockRegisterShutdownHandler = jest.fn();
const serviceStateMock = {
  addHealthChecker: mockAddHealthChecker,
  registerShutdownHandler: mockRegisterShutdownHandler,
};

const mockAxiosGet = jest.fn();
const mockAxiosPost = jest.fn();
const mockAxios = {
  default: {
    create: () => ({
      get: mockAxiosGet,
      post: mockAxiosPost,
    }),
  },
};
jest.mock('axios', () => mockAxios);


const Keycloak = require('../../app/keycloak');

let keycloak = null;

describe('Keycloak tests', () => {
  beforeAll(() => {

  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
  });
  afterEach(() => {
  });
  test('init', () => {
    keycloak = new Keycloak(serviceStateMock);
    expect(keycloak.healthCheckMs).toBe(30000);
    expect(mockAddHealthChecker)
      .toHaveBeenCalledWith(keycloak.serviceName, expect.any(Function), 30000);
  });

  test('getTokenByAuthorizationCode: ok', async () => {
    mockAxiosPost.mockResolvedValueOnce({
      status: 200,
      data: {
        access_token: 'accessToken',
        expires_in: 30,
        refresh_expires_in: 120,
        refresh_token: 'refreshToken',
        session_state: 'sessionState',
      },
    });
    Date.now = jest.fn(() => new Date(Date.UTC(2020, 1, 1)).valueOf());

    const realm = 'admin';
    const authorizationCode = 'authorizationCode';
    const codeVerifier = 'codeVerifier';

    const returnData = await keycloak
      .getRequestsInstance()
      .getTokenByAuthorizationCode(realm, authorizationCode, codeVerifier);

    expect(mockAxiosPost).toHaveBeenCalled();
    expect(returnData).toStrictEqual({
      accessToken: 'accessToken',
      accessTokenExpiresAt: new Date('2020-02-01T00:00:28.000Z'),
      refreshExpiresAt: new Date('2020-02-01T00:01:58.000Z'),
      refreshToken: 'refreshToken',
      sessionState: 'sessionState',
    });
  });

  test('getTokenByAuthorizationCode: reject', async () => {
    expect.assertions(2);
    mockAxiosPost.mockRejectedValueOnce(new Error('a'));
    try {
      const realm = 'admin';
      const authorizationCode = 'authorizationCode';
      const codeVerifier = 'codeVerifier';
      await keycloak
        .getRequestsInstance()
        .getTokenByAuthorizationCode(realm, authorizationCode, codeVerifier);
    } catch (e) {
      expect(mockAxiosPost).toHaveBeenCalled();
      expect(e.message).toBe('a');
    }
  });

  test('getTokenByAuthorizationCode: =! 200', async () => {
    expect.assertions(2);
    mockAxiosPost.mockResolvedValueOnce({
      status: 400,
      statusText: 'statusText',
    });
    try {
      const realm = 'admin';
      const authorizationCode = 'authorizationCode';
      const codeVerifier = 'codeVerifier';
      await keycloak
        .getRequestsInstance()
        .getTokenByAuthorizationCode(realm, authorizationCode, codeVerifier);
    } catch (e) {
      expect(mockAxiosPost).toHaveBeenCalled();
      expect(e.message).toBe('getTokenByAuthorizationCode: The API returns: code=400; message=statusText');
    }
  });

  test('getTokenByRefreshToken: ok', async () => {
    mockAxiosPost.mockResolvedValueOnce({
      status: 200,
      data: {
        access_token: 'accessToken',
        expires_in: 30,
        refresh_expires_in: 120,
        refresh_token: 'refreshToken',
        session_state: 'sessionState',
      },
    });
    Date.now = jest.fn(() => new Date(Date.UTC(2020, 1, 1)).valueOf());

    const realm = 'admin';
    const authorizationCode = 'authorizationCode';
    const codeVerifier = 'codeVerifier';

    const returnData = await keycloak
      .getRequestsInstance()
      .getTokenByRefreshToken(realm, authorizationCode, codeVerifier);

    expect(mockAxiosPost).toHaveBeenCalled();
    expect(returnData).toStrictEqual({
      accessToken: 'accessToken',
      accessTokenExpiresAt: new Date('2020-02-01T00:00:28.000Z'),
      refreshExpiresAt: new Date('2020-02-01T00:01:58.000Z'),
      refreshToken: 'refreshToken',
      sessionState: 'sessionState',
    });
  });

  test('getTokenByRefreshToken: reject', async () => {
    expect.assertions(2);
    mockAxiosPost.mockRejectedValueOnce(new Error('a'));
    try {
      const realm = 'admin';
      const authorizationCode = 'authorizationCode';
      const codeVerifier = 'codeVerifier';
      await keycloak
        .getRequestsInstance()
        .getTokenByRefreshToken(realm, authorizationCode, codeVerifier);
    } catch (e) {
      expect(mockAxiosPost).toHaveBeenCalled();
      expect(e.message).toBe('a');
    }
  });

  test('getTokenByRefreshToken: =! 200', async () => {
    expect.assertions(2);
    mockAxiosPost.mockResolvedValueOnce({
      status: 400,
      statusText: 'statusText',
    });
    try {
      const realm = 'admin';
      const authorizationCode = 'authorizationCode';
      const codeVerifier = 'codeVerifier';
      await keycloak
        .getRequestsInstance()
        .getTokenByRefreshToken(realm, authorizationCode, codeVerifier);
    } catch (e) {
      expect(mockAxiosPost).toHaveBeenCalled();
      expect(e.message).toBe('getTokenByRefreshToken: The API returns: code=400; message=statusText');
    }
  });

  test('getPermissionsByToken: ok', async () => {
    mockAxiosPost.mockResolvedValueOnce({
      status: 200,
      data:
       [{
         rsname: 'x',
         scopes: ['view', 'delete'],
       },
       {
         rsname: 'Default Resource',
         scopes: ['view'],
       },
       ],
    });

    const realm = 'admin';
    const accessToken = 'accessToken';

    const returnData = await keycloak
      .getRequestsInstance()
      .getPermissionsByToken(realm, accessToken);

    expect(mockAxiosPost).toHaveBeenCalled();
    expect(returnData).toStrictEqual([{
      resourceName: 'x',
      scopes: ['view', 'delete'],
    }]);
  });

  test('getPermissionsByToken: reject', async () => {
    expect.assertions(2);
    mockAxiosPost.mockRejectedValueOnce(new Error('a'));
    try {
      const realm = 'admin';
      const accessToken = 'accessToken';

      await keycloak
        .getRequestsInstance()
        .getPermissionsByToken(realm, accessToken);
    } catch (e) {
      expect(mockAxiosPost).toHaveBeenCalled();
      expect(e.message).toBe('a');
    }
  });
  test('getPermissionsByToken: =! 200', async () => {
    expect.assertions(2);
    mockAxiosPost.mockResolvedValueOnce({
      status: 400,
      statusText: 'statusText',
    });
    try {
      const realm = 'admin';
      const accessToken = 'accessToken';
      await keycloak
        .getRequestsInstance()
        .getPermissionsByToken(realm, accessToken);
    } catch (e) {
      expect(mockAxiosPost).toHaveBeenCalled();
      expect(e.message).toBe('getPermissionsByToken: The API returns: code=400; message=statusText');
    }
  });

  test('getUserInfoByToken: ok', async () => {
    mockAxiosGet.mockResolvedValueOnce({
      status: 200,
      data:
       {
         name: 'Name',
         preferred_username: 'username',
         email: 'email',
         email_verified: true,
       },
    });

    const realm = 'realm';
    const accessToken = 'accessToken';

    const returnData = await keycloak
      .getRequestsInstance()
      .getUserInfoByToken(realm, accessToken);

    expect(mockAxiosGet).toHaveBeenCalled();
    expect(returnData).toStrictEqual({
      name: 'Name',
      username: 'username',
      email: 'email',
      emailVerified: true,
      realm: 'realm',
      tenant: 'realm',
    });
  });

  test('getUserInfoByToken: reject', async () => {
    expect.assertions(2);
    mockAxiosGet.mockRejectedValueOnce(new Error('a'));
    try {
      const realm = 'admin';
      const accessToken = 'accessToken';
      await keycloak
        .getRequestsInstance()
        .getUserInfoByToken(realm, accessToken);
    } catch (e) {
      expect(mockAxiosGet).toHaveBeenCalled();
      expect(e.message).toBe('a');
    }
  });


  test('getUserInfoByToken: =! 200', async () => {
    expect.assertions(2);
    mockAxiosGet.mockResolvedValueOnce({
      status: 400,
      statusText: 'statusText',
    });
    try {
      const realm = 'admin';
      const accessToken = 'accessToken';
      await keycloak
        .getRequestsInstance()
        .getUserInfoByToken(realm, accessToken);
    } catch (e) {
      expect(mockAxiosGet).toHaveBeenCalled();
      expect(e.message).toBe('getUserInfoByToken: The API returns: code=400; message=statusText');
    }
  });

  test('getStatus: ok', async () => {
    mockAxiosGet.mockResolvedValueOnce({
      status: 200,
      data: 'anyData',
    });

    const returnData = await keycloak
      .getRequestsInstance()
      .getStatus();

    expect(mockAxiosGet).toHaveBeenCalled();
    expect(returnData).toBe(true);
  });

  test('getStatus: error', async () => {
    mockAxiosGet.mockResolvedValueOnce({
      status: 500,
    });

    const returnData = await keycloak
      .getRequestsInstance()
      .getStatus();

    expect(mockAxiosGet).toHaveBeenCalled();
    expect(returnData).toBe(false);
  });

  test('createInfluxHealthChecker - heath', async () => {
    keycloak.createHealthChecker(serviceStateMock);

    const callback = mockAddHealthChecker.mock.calls[0][1];

    mockAxiosGet.mockResolvedValueOnce({
      status: 200,
      data: 'x',
    });

    const ready = jest.fn();
    const notReady = jest.fn();
    await callback(ready, notReady);

    expect(mockAddHealthChecker).toHaveBeenCalled();
    expect(ready).toHaveBeenCalled();
    expect(notReady).not.toHaveBeenCalled();
  });


  test('createInfluxHealthChecker - not heath ', async () => {
    keycloak.createHealthChecker(serviceStateMock);

    const callback = mockAddHealthChecker.mock.calls[0][1];
    mockAxiosGet.mockRejectedValueOnce(new Error());
    const ready = jest.fn();
    const notReady = jest.fn();
    await callback(ready, notReady);

    expect(mockAddHealthChecker).toHaveBeenCalled();
    expect(ready).not.toHaveBeenCalled();
    expect(notReady).toHaveBeenCalled();
  });

  test('buildUrlLogin', async () => {
    const realm = 'admin';
    const state = 'state';
    const codeChallenge = 'codeChallenge';
    const urlReturn = 'redirectUri';
    const urlLogin = keycloak.buildUrlLogin(realm, state, codeChallenge, urlReturn);

    expect(urlLogin).toBe('http://localhost:8000/auth/realms/admin/protocol/openid-connect/auth?client_id=gui&response_type=code&scope=openid&state=state&code_challenge=codeChallenge&code_challenge_method=S256&redirect_uri=redirectUri');
  });

  test('buildUrlLogout ', async () => {
    const realm = 'admin';
    const redirectUri = 'redirectUri';
    const urlLogout = keycloak.buildUrlLogout(realm, redirectUri);

    expect(urlLogout).toBe('http://localhost:8000/auth/realms/admin/protocol/openid-connect/logout?redirect_uri=redirectUri');
  });
});
