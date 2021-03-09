const { default: axios } = require('axios');
const querystring = require('querystring');
const { loggingErrorsAxios } = require('./Utils');

// const KEYCLOAK_URL="http://apigw:8000/auth";
const KEYCLOAK_URL="http://keycloak:8080/auth";

const pathKeycloackToken = (realm) =>{
    return "/realms/"+realm+"/protocol/openid-connect/token"
}

const axiosKeyCloack = axios.create({
    baseURL: KEYCLOAK_URL,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
});


const getTokenByAuthorizationCode = async (realm, authorizationCode, codeVerifier) => {
try{
  const  result = await axiosKeyCloack.post(
      pathKeycloackToken(realm),
      querystring.stringify({
            grant_type: 'authorization_code',
            redirect_uri: 'http://localhost:8000/flow_auth/?' ,
            client_id: 'gui',
            code_verifier: codeVerifier,
            code: authorizationCode
      })
    );

    // console.log('result', result)

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
    loggingErrorsAxios(error);
    if (error.response && error.response.status && error.response.data){
      throw new Error(error.response.status+': '+ JSON.stringify(error.response.data));
    }
    throw error;
  }
};

const getPermissionsByToken = async (realm, accessToken) => {
try{
  console.log("realm, accessToken", realm, accessToken);

  const axiosPromise = axiosKeyCloack.post(
    pathKeycloackToken(realm),
    querystring.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
      audience: 'kong',
      // response_mode: 'permissions',
    }),
    {
      headers:{ Authorization: 'Bearer ' + accessToken ,
               'content-type': 'application/x-www-form-urlencoded'}
    }
  );

  const result = await axiosPromise;

  if(result.status===200){

    // [
    //   "scopes":["view","create","update","delete"],
    //   "rsid":"940196f6-6dac-4345-85b4-368613a38c5a",
    //   "rsname":"server-api-example-sec"}
    // ]

    const permissionsArrF = result.data.map((value, index)=>{
        return {
            resourceName: value.rsname,
            permissions: value.scopes
        }

    });

    // console.log(result.status);
    // console.log(result.data);
    // console.log(result.statusText);

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

module.exports = { getTokenByAuthorizationCode, getPermissionsByToken };