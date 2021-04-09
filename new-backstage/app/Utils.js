
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
 * TODO
 * @param {string} [hash='sha256']
 * @returns {{codeChallenge:string,codeVerifier:string}} PKCE challenge pair
 */
const generatePKCEChallenge = (hash = 'sha256') => {
  const codeVerifier = randomString.generate(128);
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
 * Receives an object with the key `tls.` in flatten inside and recreates them in carmelcase
 * in addition to uploading ca, key and cert files
 *
 * If it is not possible to find the key tls, returns the same value as the entry
 *
 * For example 'tls.request.cert' will become tls.requestCert and tls.request.cert will be excluded
 *
 * Supports all tls.connect options(https://nodejs.org/api/tls.html#tls_tls_connect_port_host_options_callback)
 *
 * @param {Object} config with keys prefixed `tls.`
 *
 * @returns {Object} new object with with keys prefixed `tls.`
 *                        deleted and recreated within the key tls with in carmelcase
 */
const replaceTLSFlattenConfigs = (config) => {
  const configUn = unflatten(config);
  if (configUn.tls) {
    const tlsConfig = transformObjectKeys(flatten(configUn.tls), camelCase);
    delete configUn.tls;

    if (tlsConfig.cert) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
      tlsConfig.cert = fs.readFileSync(tlsConfig.cert);
    }
    if (tlsConfig.key) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      tlsConfig.key = fs.readFileSync(tlsConfig.key);
    }
    if (tlsConfig.ca) {
      if (!Array.isArray(tlsConfig.ca)) {
        tlsConfig.ca = [tlsConfig.ca];
      }
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      tlsConfig.ca = tlsConfig.ca.map((filename) => fs.readFileSync(filename));
    }

    const replacedConfig = {
      ...flatten(configUn),
      tls: tlsConfig,
    };

    return replacedConfig;
  }

  return config;
};

module.exports = {
  replaceTLSFlattenConfigs,
  generatePKCEChallenge,
};
