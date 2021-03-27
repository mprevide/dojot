
const randomString = require("randomstring");
const crypto = require("crypto");
const base64url = require("base64url");

/**
 *
 * @param {string} [hash='sha256']
 * @param {number} [length=43] Length of the verifier (between 43-128) TODO
 * @returns {{codeChallenge:string,codeVerifier:string}} PKCE challenge pair
 */
const generatePKCEChallenge = (hash = "sha256", length=43)=>{
    const codeVerifier = randomString.generate(128);
    const base64Digest = crypto.createHash(hash)
                                .update(codeVerifier)
                                .digest("base64");

    const codeChallenge = base64url.fromBase64(base64Digest);

    return {
        codeChallenge,
        codeVerifier,
    }
};

const handleErrorAxios = (error) => {
  if (error.response && error.response.status && error.response.data) {
      throw new Error(error.response.status + ': ' + JSON.stringify(error.response.data));
  }
  throw error;
}

module.exports = {  generatePKCEChallenge,
                    handleErrorAxios,};
