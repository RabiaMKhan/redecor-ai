// Library Imports
import axios from 'axios';

// Local Imports
import { endPoints } from './constants';

const axiosInstance = axios.create({
    baseURL: endPoints.baseURL,
    timeout: 180000, // AI analysis and image generation can take a while
});

// Set once on login / rehydrate (see src/index.js). Interceptors are added
// once at module load, not every time the token changes.
export const setAuthToken = (token) => {
    if (token) {
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete axiosInstance.defaults.headers.common.Authorization;
    }
};

let onUnauthorized = () => { };
export const registerUnauthorizedHandler = (handler) => {
    onUnauthorized = handler;
};

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const hadToken = Boolean(error?.config?.headers?.Authorization);
        // An expired or revoked token: sign the user out locally.
        if (status === 401 && hadToken) {
            onUnauthorized();
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
