const baseUrl = 'http://localhost:8000';
const clientId = 'gui';
const codeChallengeMethod = 'S256';

const buildUrlLogin = (
  realm,
  state,
  codeChallenge,
) => {
  const url = new URL(`${baseUrl}/auth/realms/${
    realm}/protocol/openid-connect/auth?`);

  url.searchParams.append('client_id', clientId);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', 'openid');
  url.searchParams.append('state', state);
  url.searchParams.append('code_challenge', codeChallenge);
  url.searchParams.append('code_challenge_method', codeChallengeMethod);
  url.searchParams.append('redirect_uri', `${baseUrl}/backstage/v1/auth/return`);

  return url.href;
};

const buildUrlLogout = (realm) => {
  const url = new URL(`${baseUrl}/auth/realms/${
    realm}/protocol/openid-connect/logout?`);
  url.searchParams.append('redirect_uri', baseUrl);

  return url.href;
};

module.exports = {
  buildUrlLogin,
  buildUrlLogout,
};
