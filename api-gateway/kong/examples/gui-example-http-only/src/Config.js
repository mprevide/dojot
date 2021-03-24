const DOMAIN_URL = "http://localhost:8000";
const config ={
    LOGIN_URL: DOMAIN_URL+ "/backstage/v1/auth",
    LOGOUT_URL: DOMAIN_URL+ "/backstage/v1/auth/logout",
    EXAMPLE_DATA_URL:  DOMAIN_URL+ "/backstage/v1/example",
    USER_INFO_URL:  DOMAIN_URL+ "/backstage/v1/auth/userInfo",
}

export default config;
