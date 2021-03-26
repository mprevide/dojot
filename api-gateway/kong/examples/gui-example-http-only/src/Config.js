const BASE_URL =  window.location.origin;
const config ={
    LOGIN_URI: BASE_URL+"/backstage/v1/auth",
    LOGOUT_URI: BASE_URL+"/backstage/v1/auth/logout",
    USER_INFO_URI: BASE_URL+"/backstage/v1/auth/userInfo",
    EXAMPLE_DATA_URI: BASE_URL+"/backstage/v1/example",
}

export default config;
