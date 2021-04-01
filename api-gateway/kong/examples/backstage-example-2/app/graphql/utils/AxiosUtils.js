// const config = require('../../config');

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

  static optionsAxios(method, url, token, baseUrl = 'http://apigw:8000') {
    return {
      method,
      headers: { 'content-type': 'application/json', Authorization: `${token}` },
      url: `${baseUrl}${url}`,
    };
  }
}

module.exports = AxiosUtils;
