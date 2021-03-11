const config = require('../Config');
const REDIRECT_URL_ENCODE = encodeURIComponent(config.REDIRECT_URL_BACK);

const pathKeycloakToken = (realm) =>{
    return config.KEYCLOAK_URL_APIGW +
            "/realms/"+realm+"/protocol/openid-connect/token"
};

const pathKeycloakInfo = (realm) =>{
    return config.KEYCLOAK_URL_APIGW +
            "/realms/"+realm+"/protocol/openid-connect/userinfo"
};

const urlLoginKeycloack = (clientId,
                           state,
                           realm,
                           codeChallenge,
                           codeChallengeMethod) =>{

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
};

const urlLogoutKeycloack = (realm) =>{
  return config.KEYCLOAK_URL_EXTERNAL+
              "/realms/"
              +realm+"/protocol/openid-connect/logout?"+
              "&redirect_uri="+config.HOME_FRONT;
};

module.exports = {
    pathKeycloakToken,
    pathKeycloakInfo,
    urlLoginKeycloack,
    urlLogoutKeycloack,
};