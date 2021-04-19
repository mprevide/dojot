const buildOIDCURL = (url, realm) => `${url}/realms/${realm}/protocol/openid-connect`;

/**
 * Built external URL for browser login
 * @param {object} param0
 * @returns
 */
const buildUrlLogin = ({
  baseUrl,
  clientId,
  realm,
  state,
  codeChallenge,
  codeChallengeMethod,
  urlReturn,
}) => {
  const url = new URL(`${buildOIDCURL(baseUrl, realm)}/auth?`);

  url.searchParams.append('client_id', clientId);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', 'openid');
  url.searchParams.append('state', state);
  url.searchParams.append('code_challenge', codeChallenge);
  url.searchParams.append('code_challenge_method', codeChallengeMethod);
  url.searchParams.append('redirect_uri', urlReturn);

  return url.href;
};

/**
 * Built external URL for browser logout
 *
 * @param {object} param0
 * @returns
 */
const buildUrlLogout = ({
  baseUrl,
  redirectUri,
  realm,
}) => {
  const url = new URL(`${buildOIDCURL(baseUrl, realm)}/logout?`);
  url.searchParams.append('redirect_uri', redirectUri);

  return url.href;
};

module.exports = {
  buildUrlLogin,
  buildUrlLogout,
};
