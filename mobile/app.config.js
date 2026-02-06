export default {
    expo: {
        name: "LocalBazar",
        slug: "localbazar",
        version: "1.1.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        splash: {
            image: "./assets/splash.png",
            resizeMode: "contain",
            backgroundColor: "#f97316"
        },
        assetBundlePatterns: [
            "**/*"
        ],
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.localbazar.app"
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#f97316"
            },
            package: "com.localbazar.app",
            versionCode: 5,
            softwareKeyboardLayoutMode: "pan",
            permissions: [
                "ACCESS_COARSE_LOCATION",
                "ACCESS_FINE_LOCATION",
                "CAMERA",
                "READ_EXTERNAL_STORAGE",
                "WRITE_EXTERNAL_STORAGE"
            ]
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        plugins: [
            "expo-router",
            [
                "expo-notifications",
                {
                    icon: "./assets/icon.png",
                    color: "#f97316"
                }
            ],
            [
                "expo-location",
                {
                    locationAlwaysAndWhenInUsePermission: "Allow LocalBazar to access your location for accurate delivery."
                }
            ],
            "expo-font"
        ],
        scheme: "localbazar",
        extra: {
            apiUrl: process.env.API_URL || "https://localbazar.onrender.com/api",
            eas: {
                projectId: "9ab527a9-5908-46c4-83ca-57cae68fc5f7"
            }
        },
        updates: {
            enabled: true,
            checkAutomatically: "ON_LOAD",
            fallbackToCacheTimeout: 0,
            url: "https://u.expo.dev/9ab527a9-5908-46c4-83ca-57cae68fc5f7"
        },
        runtimeVersion: {
            policy: "appVersion"
        }
    }
};
