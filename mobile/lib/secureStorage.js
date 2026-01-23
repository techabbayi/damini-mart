import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use SecureStore on native platforms, AsyncStorage on web
const isNative = Platform.OS !== 'web';

const secureStorage = {
    async setItem(key, value) {
        try {
            if (isNative) {
                await SecureStore.setItemAsync(key, value);
            } else {
                await AsyncStorage.setItem(key, value);
            }
        } catch (error) {
            console.error('Error saving to secure storage:', error);
            throw error;
        }
    },

    async getItem(key) {
        try {
            if (isNative) {
                return await SecureStore.getItemAsync(key);
            } else {
                return await AsyncStorage.getItem(key);
            }
        } catch (error) {
            console.error('Error reading from secure storage:', error);
            return null;
        }
    },

    async removeItem(key) {
        try {
            if (isNative) {
                await SecureStore.deleteItemAsync(key);
            } else {
                await AsyncStorage.removeItem(key);
            }
        } catch (error) {
            console.error('Error removing from secure storage:', error);
            throw error;
        }
    },
};

// Storage implementation for Zustand persist
export const secureStorageAdapter = {
    getItem: async (name) => {
        const value = await secureStorage.getItem(name);
        return value ? JSON.parse(value) : null;
    },
    setItem: async (name, value) => {
        await secureStorage.setItem(name, JSON.stringify(value));
    },
    removeItem: async (name) => {
        await secureStorage.removeItem(name);
    },
};

export default secureStorage;
