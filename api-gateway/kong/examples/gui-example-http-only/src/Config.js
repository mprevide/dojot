const DOMAIN_URL = "http://localhost:8000";
const config ={
    PKCE_URL: DOMAIN_URL+ "/backstage/v1/auth",
    LOGOUT_URL: DOMAIN_URL+ "/backstage/v1/auth/logout",
    INTERNAL_DATA_URL:  DOMAIN_URL+ "/internal-test",
    USER_INFO_URL:  DOMAIN_URL+ "/backstage/v1/auth/userInfo",
    // CURRENT_SESSION_URL:  DOMAIN_URL+ "/pkce/current",
}

export default config;
