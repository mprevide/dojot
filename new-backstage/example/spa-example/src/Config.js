const BASE_URL =  window.location.origin;
const config ={
    LOGIN_URL: BASE_URL+"/backstage/v1/auth",
    LOGOUT_URL: BASE_URL+"/backstage/v1/auth/logout",
    USER_INFO_URL: BASE_URL+"/backstage/v1/auth/userInfo",
    GQ_URL: BASE_URL+"/backstage/v1/graphql",
}

export default config;
