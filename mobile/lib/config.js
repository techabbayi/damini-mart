import Constants from 'expo-constants';

// Environment-based configuration
const ENV = {
    dev: {
        apiUrl: 'https://damini-mart.onrender.com/api',
    },
    staging: {
        apiUrl: 'https://damini-mart.onrender.com/api',
    },
    prod: {
        apiUrl: 'https://damini-mart.onrender.com/api',
    }
};

// Get environment from EAS build or default to dev
const getEnvVars = () => {
    // Check if running in EAS build with environment variables
    if (Constants.expoConfig?.extra?.apiUrl) {
        return { apiUrl: Constants.expoConfig.extra.apiUrl };
    }

    // Check for environment variable from EAS build
    if (process.env.API_URL) {
        return { apiUrl: process.env.API_URL };
    }

    // Default to development
    return ENV.dev;
};

export default getEnvVars();
