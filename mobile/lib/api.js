import axios from 'axios';
import config from './config';

// Get API URL from environment configuration
const API_URL = config.apiUrl;

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Store reference for auth store to avoid circular dependency
let authStoreRef = null;

export const setAuthStoreRef = (store) => {
    authStoreRef = store;
};

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        if (authStoreRef) {
            const token = authStoreRef.getState().token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle network errors
        if (!error.response) {
            return Promise.reject(new Error('Network error. Please check your internet connection.'));
        }

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                if (authStoreRef) {
                    const refreshToken = authStoreRef.getState().refreshToken;
                    if (refreshToken) {
                        // Try to refresh token
                        const res = await axios.post(`${API_URL}/auth/refresh`, {
                            refreshToken,
                        });

                        const { accessToken, refreshToken: newRefreshToken } = res.data.data;
                        authStoreRef.getState().setToken(accessToken);

                        // Retry original request with new token
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                if (authStoreRef) {
                    authStoreRef.getState().logout();
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
