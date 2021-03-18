
const randomString = require("randomstring");
const crypto = require("crypto");
const base64url = require("base64url");

/**
 *
 * @param {string} [hash='sha256']
 * @param {number} [length=43] Length of the verifer (between 43-128)
 * @returns {{codeChallenge:string,codeVerifier:string}} PKCE challenge pair
 */
const generatePKCEChallenge = (hash = "sha256", length=43)=>{
    // console.log('generatePKCEChallenge');
    const codeVerifier = randomString.generate(128);
    const base64Digest = crypto.createHash(hash)
                                .update(codeVerifier)
                                .digest("base64");

                                //base64UrlEncode(
    const codeChallenge = base64url.fromBase64(base64Digest);
    // console.log(codeVerifier);
    // console.log(base64Digest);

    // console.log(codeChallenge);

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
                    handleErrorAxios,
                  };
