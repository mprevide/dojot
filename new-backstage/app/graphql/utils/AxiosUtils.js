const {
  ConfigManager: { getConfig },
} = require('@dojot/microservice-sdk');

const {
  app: configApp,
} = getConfig('BACKSTAGE');
class AxiosUtils {
  static get GET() {
    return 'GET';
  }

  static get POST() {
    return 'POST';
  }

  static get DELETE() {
    return 'DELETE';
  }

  static optionsAxios(method, url, token, baseUrl = configApp['app.internal.base.url']) {
    const promise = {
      method,
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      url: `${baseUrl}${url}`,
    };
    return promise;
  }
}

module.exports = AxiosUtils;
