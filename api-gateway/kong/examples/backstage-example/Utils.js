
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
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
  }

const extractTenantByIssuer = (iss) => {
  return iss.match(/(realms\/)(\w+)/)[2];
};

const middlewareJWTExtract = (accessToken) => {
  const rawToken = accessToken;

  if (rawToken === undefined) {
    console.error('Missing JWT token');
    return null;
  }

  const token = rawToken.split('.');
  if (token.length !== 3) {
    console.error('Invalid JWT token', rawToken);
    return null;
  }

  const tokenData = JSON.parse(b64decode(rawToken.split('.')[1]));
  const { iss, exp, auth_time } = tokenData;

  const tokenInformation = {
    token: rawToken,
    realm: extractTenantByIssuer(iss),
    iss,
    exp, //Expiration time (Seconds since unix time)
    iat, //Issued at (Seconds since unix time)
    auth_time, //Time when auth occurred
  }

  console.log('tokenInformation', tokenInformation);

  return tokenInformation;
};


module.exports = { generatePKCEChallenge, loggingErrorsAxios, middlewareJWTExtract };
