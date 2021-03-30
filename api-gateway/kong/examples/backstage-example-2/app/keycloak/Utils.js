// const baseUrl = 'http://localhost:8000';
// // const baseUrl = '';
// const clientId = 'gui';
// const codeChallengeMethod = 'S256';
// const mountPoint = '/backstage/v1';

// const { app: configApp } = getConfig('BACKSTAGE');

const pathT = (url, realm) => `${url}/auth/realms/${realm}/protocol/openid-connect`;


// const URL_RETURN_INTERNAL = `${baseUrl}${mountPoint}/auth/return`;
const buildUrlLogin = ({
  baseUrl,
  clientId,
  realm,
  state,
  codeChallenge,
  codeChallengeMethod,
  urlReturn,
}) => {
  const url = new URL(`${pathT(baseUrl, realm)}/auth?`);

  url.searchParams.append('client_id', clientId);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', 'openid');
  url.searchParams.append('state', state);
  url.searchParams.append('code_challenge', codeChallenge);
  url.searchParams.append('code_challenge_method', codeChallengeMethod);
  url.searchParams.append('redirect_uri', urlReturn);

  return url.href;
};

const buildUrlLogout = ({
  baseUrl,
  realm,
}) => {
  const url = new URL(`${pathT(baseUrl, realm)}/logout?`);
  url.searchParams.append('redirect_uri', baseUrl);

  return url.href;
};

module.exports = {
  buildUrlLogin,
  buildUrlLogout,
};
