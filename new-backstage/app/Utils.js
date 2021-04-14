/* eslint-disable security/detect-non-literal-fs-filename */

const randomString = require('randomstring');
const crypto = require('crypto');
const base64url = require('base64url');
const { flatten, unflatten } = require('flat');
const camelCase = require('lodash.camelcase');
const {
  ConfigManager: { transformObjectKeys },
} = require('@dojot/microservice-sdk');
const fs = require('fs');

/**
 * Generate Proof Key for Code Exchange (PKCE) challenge pair.
 *
 * https://www.oauth.com/oauth2-servers/pkce/authorization-request/
 *
 * @param {string} [hash='sha256']
 * @param {number} [stringSize=128] 43 and 128 characters long.
 * @returns {{codeChallenge:string,codeVerifier:string}} PKCE challenge pair
 */
const generatePKCEChallenge = (hash = 'sha256', stringSize = 128) => {
  const codeVerifier = randomString.generate({
    length: stringSize,
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~',
  });

  const base64Digest = crypto.createHash(hash)
    .update(codeVerifier)
    .digest('base64');

  const codeChallenge = base64url.fromBase64(base64Digest);

  return {
    codeChallenge,
    codeVerifier,
  };
};


/**
 * Loads files for cert, key, and CA, and transforms some settings to camelcase
 *
 * Receives an object with the key `tls.`or `ssl.` in flatten inside
 * and recreates them in carmelcase in addition to uploading
 * ca, key and cert files
 *
 * If it is not possible to find the key tls, returns the same value as the entry
 *
 * For example 'tls.request.cert' will become tls.requestCert and tls.request.cert will be excluded
 *
 * Supports all tls.connect options(https://nodejs.org/api/tls.html#tls_tls_connect_port_host_options_callback)
 *
 * @param {Object} config with keys prefixed `tls.` or `ssl.`
 *
 * @returns {Object} new object with with keys prefixed `tls.` or `ssl.`
 *                        deleted and recreated within the key tls with in carmelcase
 */
const replaceTLSFlattenConfigs = (config) => {
  const configUn = unflatten(config);
  let configUnTLS = null;
  let keyType = null;

  if (configUn.tls) {
    configUnTLS = configUn.tls;
    keyType = 'tls';
  } else if (configUn.ssl) {
    configUnTLS = configUn.ssl;
    keyType = 'ssl';
  }

  if (configUnTLS && keyType) {
    const tlsConfig = transformObjectKeys(flatten(configUnTLS), camelCase);

    delete configUn.tls;
    delete configUn.ssl;

    if (tlsConfig.cert) {
      tlsConfig.cert = fs.readFileSync(tlsConfig.cert);
    }
    if (tlsConfig.key) {
      tlsConfig.key = fs.readFileSync(tlsConfig.key);
    }
    if (tlsConfig.ca) {
      if (!Array.isArray(tlsConfig.ca)) {
        tlsConfig.ca = [tlsConfig.ca];
      }
      tlsConfig.ca = tlsConfig.ca.map((filename) => fs.readFileSync(filename));
    }

    if (keyType === 'tls') {
      return {
        ...flatten(configUn),
        tls: tlsConfig,
      };
    }
    return {
      ...flatten(configUn),
      ssl: tlsConfig,
    };
  }

  return config;
};

module.exports = {
  replaceTLSFlattenConfigs,
  generatePKCEChallenge,
};
