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
    error: mockLogError,
    info: jest.fn(),
    warn: jest.fn(),
  })),
};
jest.mock('@dojot/microservice-sdk', () => mockSdk);
