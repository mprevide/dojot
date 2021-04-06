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

  // TODO get baseURl from config
  static optionsAxios(method, url, token, baseUrl = 'http://apigw:8000') {
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
