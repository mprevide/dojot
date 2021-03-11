const { default: axios } = require('axios');
const querystring = require('querystring');
const { loggingErrorsAxios } = require('./Utils');
const config = require('./Config');

const REDIRECT_URL_ENCODE = encodeURIComponent(config.REDIRECT_URL);

const pathKeycloakToken = (realm) =>{
    return "/realms/"+realm+"/protocol/openid-connect/token"
}

const urlLoginKeycloack = (realm, codeChallenge, codeChallengeMethod) =>{
  const clientId = 'gui'
  const state='125f9cf4-f643-4856-b4df-b8da56878b2d';
  return config.KEYCLOAK_URL_EXTERNAL+
              "/realms/"
              +realm+"/protocol/openid-connect/auth?"+
              "client_id="+clientId+
              "&redirect_uri="+REDIRECT_URL_ENCODE+
              "&state="+state+
              "&response_type=code"+
              "&scope=openid"+
              "&code_challenge="+codeChallenge+
              "&code_challenge_method="+codeChallengeMethod;
}

const urlLogoutKeycloack = (realm) =>{
  return config.KEYCLOAK_URL_EXTERNAL+
              "/realms/"
              +realm+"/protocol/openid-connect/logout?"+
              "&redirect_uri="+'http://localhost:8000/';
}

const axiosKeyCloack = axios.create({
    baseURL: config.KEYCLOAK_URL,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
});


const getTokenByAuthorizationCode = async (realm, authorizationCode, codeVerifier) => {
try{
  console.log('getTokenByAuthorizationCode ');
  console.log('authorizationCode ', authorizationCode);
  console.log('codeVerifier ', codeVerifier);
  const  result = await axiosKeyCloack.post(
      pathKeycloakToken(realm),
      querystring.stringify({
            grant_type: 'authorization_code',
            redirect_uri: 'http://localhost:8000/pkce/return',
            client_id: 'gui',
            code_verifier: codeVerifier,
            code: authorizationCode
      })
      // ,
      // {
      //   maxRedirects: 0,
      // }
    );

  if(result.status===200){
    const {
      access_token : accessToken,
      expires_in: expiresIn,
      refresh_expires_in: refreshExpiresIn,
      refresh_token: refreshToken,
      token_type: tokenType,
      id_token: idToken,
      session_state: sessionState,
      scope,
      'not-before-policy': notBeforePolicy
    } = result.data;

    console.log(result.status);
    console.log(result.data);
    console.log(result.statusText);

    return {
      accessToken,
      expiresIn,
      refreshExpiresIn,
      refreshToken
    };
  }
  }catch(error){
    console.log('getTokenByAuthorizationCode catch' );
    loggingErrorsAxios(error);
    if (error.response && error.response.status && error.response.data){
      throw new Error(error.response.status+': '+ JSON.stringify(error.response.data));
    }
    throw error;
  }
};

/**
 *
 * @param {*} realm
 * @param {*} accessToken
 * @returns
 */
const getPermissionsByToken = async (realm, accessToken) => {
try{
  console.log("realm, accessToken", realm, accessToken);

  const axiosPromise = axiosKeyCloack.post(
    pathKeycloakToken(realm),
    querystring.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
      audience: 'kong',
      response_mode: 'permissions',
    }),
    {
      headers:{ Authorization: 'Bearer ' + accessToken ,
               'content-type': 'application/x-www-form-urlencoded'}
    }
  );

  const result = await axiosPromise;

  if(result.status===200){
    const permissionsArrF = result.data.reduce((filtered, value)=>{
      if(value.rsname!=='Default Resource'){
        filtered.push({
          resourceName: value.rsname,
          permissions: value.scopes
      });
      }
      return filtered;
    }, []);

    return permissionsArrF;
  }
  }catch(error){
    // loggingErrorsAxios(error);
    if (error.response && error.response.status && error.response.data){
      throw new Error(error.response.status+': '+ JSON.stringify(error.response.data));
    }
    throw error;
  }
};

module.exports = {
  getTokenByAuthorizationCode,
  getPermissionsByToken,
  urlLoginKeycloack,
  urlLogoutKeycloack
};