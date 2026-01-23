import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorageAdapter } from '../lib/secureStorage';
import api, { setAuthStoreRef } from '../lib/api';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,

            // Login
            login: async (email, password) => {
                try {
                    const res = await api.post('/auth/login', { email, password });
                    const { user, accessToken, refreshToken } = res.data.data;

                    set({
                        user,
                        token: accessToken,
                        refreshToken,
                        isAuthenticated: true,
                    });

                    return { success: true };
                } catch (error) {
                    return {
                        success: false,
                        error: error.response?.data?.message || 'Login failed',
                    };
                }
            },

            // Register
            register: async (userData) => {
                try {
                    const res = await api.post('/auth/register', userData);
                    const { user, accessToken, refreshToken } = res.data.data;

                    set({
                        user,
                        token: accessToken,
                        refreshToken,
                        isAuthenticated: true,
                    });

                    return { success: true };
                } catch (error) {
                    return {
                        success: false,
                        error: error.response?.data?.message || 'Registration failed',
                    };
                }
            },

            // Logout
            logout: async () => {
                try {
                    await api.post('/auth/logout');
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    set({
                        user: null,
                        token: null,
                        refreshToken: null,
                        isAuthenticated: false,
                    });
                }
            },

            // Set token (for token refresh)
            setToken: (token) => set({ token }),

            // Update user
            updateUser: (user) => set({ user }),

            // Get user profile
            getProfile: async () => {
                try {
                    const res = await api.get('/auth/me');
                    set({ user: res.data.data });
                    return { success: true, user: res.data.data };
                } catch (error) {
                    return {
                        success: false,
                        error: error.response?.data?.message || 'Failed to fetch profile',
                    };
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => secureStorageAdapter),
        }
    )
);

// Set auth store reference in api to avoid circular dependency
setAuthStoreRef(useAuthStore);
