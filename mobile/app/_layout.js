import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from '../components/ErrorBoundary';
import notificationService from '../lib/notificationService';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

function CustomSplashScreen() {
    return (
        <View style={styles.splashContainer}>
            <View style={styles.logoContainer}>
                <Ionicons name="storefront" size={100} color="#f97316" />
            </View>
            <Text style={styles.appName}>Damini Mart</Text>
            <Text style={styles.appTagline}>Fresh Groceries Delivered</Text>
            <ActivityIndicator size="large" color="#f97316" style={styles.loader} />
            <View style={styles.footer}>
                <Text style={styles.footerText}>Built by</Text>
                <Text style={styles.footerBrand}>AKMultivision Multimedia Services</Text>
            </View>
        </View>
    );
}

export default function RootLayout() {
    const [appIsReady, setAppIsReady] = useState(false);
    const [showSplash, setShowSplash] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function prepare() {
            try {
                // Initialize push notifications (gracefully handles Expo Go limitations)
                const notificationResult = await notificationService.registerForPushNotifications();

                // Only log result in development
                if (__DEV__ && notificationResult) {
                    if (notificationResult === 'expo-go-local-only') {
                        // Local notifications only in Expo Go
                    } else if (notificationResult === 'local-only') {
                        // Local notifications only due to push token issues
                    } else {
                        // Full push notification support
                    }
                }

                // Set up notification listeners (works in all environments)
                notificationService.setupListeners(
                    (notification) => {
                        // Handle notification received while app is open
                    },
                    (response) => {
                        // Handle notification tap
                        const data = response.notification.request.content.data;
                        if (data?.orderId) {
                            router.push(`/order/${data.orderId}`);
                        } else if (data?.screen) {
                            router.push(data.screen);
                        }
                    }
                );

                // Simulate loading resources
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (e) {
                // Silently handle notification setup errors
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();

        // Cleanup
        return () => {
            notificationService.removeListeners();
        };
    }, []);

    useEffect(() => {
        if (appIsReady) {
            // Hide splash screen after app is ready
            setTimeout(async () => {
                await SplashScreen.hideAsync();
                setShowSplash(false);
            }, 500);
        }
    }, [appIsReady]);

    if (!appIsReady || showSplash) {
        return <CustomSplashScreen />;
    }

    return (
        <ErrorBoundary>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <SafeAreaProvider>
                    <QueryClientProvider client={queryClient}>
                        <StatusBar style="light" />
                        <Slot />
                    </QueryClientProvider>
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#fff7ed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    appName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    appTagline: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 32,
    },
    loader: {
        marginTop: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 4,
    },
    footerBrand: {
        fontSize: 14,
        fontWeight: '600',
        color: '#f97316',
    },
});

