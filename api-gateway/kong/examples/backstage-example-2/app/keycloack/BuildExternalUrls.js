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
