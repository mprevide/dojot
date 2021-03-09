import axios from 'axios'

const urlBackStage = "http://localhost:8000"

const instance = axios.create({
    baseURL: urlBackStage
});

function getSecure(token) {
    return instance.get(`/secure`, {
      headers: { 'Authorization': bearerAuth(token) }
    })
}

instance.interceptors.response.use(response => {
    return response;
}, function (error) {
if (error.response.status === 404) {
    return { status: error.response.status };
}
    return Promise.reject(error.response);
});

function bearerAuth(token) {
    return `Bearer ${token}`
}

export const BackApi = {
    getSecure,
}