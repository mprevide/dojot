const DOMAIN_URL =  "http://localhost:8000";

const configs = {
    KEYCLOAK_URL_APIGW: "http://apigw:8000/auth",
    KEYCLOAK_URL_EXTERNAL: DOMAIN_URL+"/auth",
    REDIRECT_URL_BACK: DOMAIN_URL+"/pkce/return",
    REDIRECT_URL_FRONT: DOMAIN_URL+"/return",
    HOME_FRONT: DOMAIN_URL,
    PUBLIC_CLIENT_ID: "gui",
    SECRET: 'keyboard cat',
    HASH_LIB: 'S256'
};

module.exports = configs;