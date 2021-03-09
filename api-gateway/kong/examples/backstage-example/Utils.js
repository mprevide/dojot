
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
    console.log('generatePKCEChallenge');
    const codeVerifier = randomString.generate(128);
    const base64Digest = crypto.createHash(hash)
                                .update(codeVerifier)
                                .digest("base64");

                                //base64UrlEncode(
    const codeChallenge = base64url.fromBase64(base64Digest);
    console.log(codeVerifier);
    console.log(base64Digest);

    console.log(codeChallenge);

    return {
        codeChallenge,
        codeVerifier,
    }
};

const  loggingErrorsAxios = (error) =>  {
    if (error.response) {
      // Request made and server responded
      // console.log(error.response.data);
      // console.log(error.response.status);
      // console.log(error.response.headers);
      console.log(error.request);
      // console.log('Error', error.message);
      // console.log('Error', error.stack);
    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
  }

module.exports = { generatePKCEChallenge, loggingErrorsAxios };
