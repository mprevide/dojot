// const URL = require('url');

// const config = require('../Config');


// const REDIRECT_URL_ENCODE = encodeURIComponent(config.REDIRECT_URL_BACK);


// const urlLoginKeycloack2 = (clientId,
//   state,
//   realm,
//   codeChallenge,
//   codeChallengeMethod) => `${config.KEYCLOAK_URL_EXTERNAL
// }/realms/${
//   realm}/protocol/openid-connect/auth?`
//               + `client_id=${clientId}&
// redirect_uri=${REDIRECT_URL_ENCODE}&
// state=${state
//               }&response_type=code`
//               + '&scope=openid'
//               + `&code_challenge=${codeChallenge
//               }&code_challenge_method=${codeChallengeMethod}`;


// const urlLogoutKeycloack2 = (realm) => `${config.KEYCLOAK_URL_EXTERNAL
// }/realms/${
//   realm}/protocol/openid-connect/logout?`
//               + `&redirect_uri=${config.HOME_FRONT}`;

const buildUrlLogin = (clientId,
  state,
  realm,
  codeChallenge,
  codeChallengeMethod) => {
  const url = new URL(`http://localhost:8000/auth/realms/${
    realm}/protocol/openid-connect/auth?`);

  url.searchParams.append('client_id', clientId);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', 'openid');
  url.searchParams.append('state', state);
  url.searchParams.append('code_challenge', codeChallenge);
  url.searchParams.append('code_challenge_method', codeChallengeMethod);
  url.searchParams.append('redirect_uri', 'http://localhost:8000/backstage/v1/auth/return');

  return url.href;
  // myUrlWithParams.searchParams.append("price", "200");
};

const buildUrlLogout = (realm) => {
  const url = new URL(`http://localhost:8000/auth/realms/${
    realm}/protocol/openid-connect/logout?`);
  url.searchParams.append('redirect_uri', 'http://localhost:8000');

  return url.href;
  // myUrlWithParams.searchParams.append("price", "200");
};

module.exports = {
  buildUrlLogin,
  buildUrlLogout,
};


// console.log(urlLoginKeycloack('clientId',
//   'state',
//   'realm',
//   'codeChallenge',
//   'codeChallengeMethod'));

//   console.log(urlLogoutKeycloack(
//   'realm'));
