import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,

            // Login
            login: async (credentials) => {
                set({ isLoading: true });
                try {
                    const { data } = await api.post('/auth/login', credentials);

                    localStorage.setItem('accessToken', data.data.accessToken);
                    localStorage.setItem('refreshToken', data.data.refreshToken);

                    set({
                        user: data.data.user,
                        accessToken: data.data.accessToken,
                        refreshToken: data.data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    toast.success('Login successful!');
                    return data.data;
                } catch (error) {
                    set({ isLoading: false });
                    toast.error(error.response?.data?.message || 'Login failed');
                    throw error;
                }
            },

            // Register
            register: async (userData) => {
                set({ isLoading: true });
                try {
                    const { data } = await api.post('/auth/register', userData);

                    localStorage.setItem('accessToken', data.data.accessToken);
                    localStorage.setItem('refreshToken', data.data.refreshToken);

                    set({
                        user: data.data.user,
                        accessToken: data.data.accessToken,
                        refreshToken: data.data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    toast.success('Registration successful!');
                    return data.data;
                } catch (error) {
                    set({ isLoading: false });
                    toast.error(error.response?.data?.message || 'Registration failed');
                    throw error;
                }
            },

            // Logout
            logout: async () => {
                try {
                    await api.post('/auth/logout');
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');

                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                    });

                    toast.success('Logged out successfully');
                }
            },

            // Get current user
            fetchUser: async () => {
                try {
                    const { data } = await api.get('/auth/me');
                    set({ user: data.data.user, isAuthenticated: true });
                    return data.data.user;
                } catch (error) {
                    set({ user: null, isAuthenticated: false });
                    throw error;
                }
            },

            // Update profile
            updateProfile: async (userData) => {
                try {
                    const { data } = await api.put('/auth/update-profile', userData);
                    set({ user: data.data.user });
                    toast.success('Profile updated!');
                    return data.data.user;
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Update failed');
                    throw error;
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
