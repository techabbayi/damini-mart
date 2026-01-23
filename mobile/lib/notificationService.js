import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

class NotificationService {
    constructor() {
        this.expoPushToken = null;
        this.notificationListener = null;
        this.responseListener = null;
        // Better Expo Go detection
        this.isExpoGo = !Device.isDevice || Constants.executionEnvironment === 'storeClient';
    }

    // Check if running in Expo Go
    isRunningInExpoGo() {
        return this.isExpoGo;
    }

    // Register for push notifications with Expo Go safety
    async registerForPushNotifications() {
        try {
            // Skip push notification registration in Expo Go
            if (this.isRunningInExpoGo()) {
                console.warn('Push notifications are not fully supported in Expo Go. Use a development build for full functionality.');
                return null;
            }

            if (!Device.isDevice) {
                return null;
            }

            try {
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;

                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }

                if (finalStatus !== 'granted') {
                    return null;
                }

                // Only try to get push token in development builds or standalone apps
                const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.expoConfig?.projectId;

                if (projectId) {
                    const token = await Notifications.getExpoPushTokenAsync({
                        projectId: projectId,
                    });
                    this.expoPushToken = token.data;

                    if (Platform.OS === 'android') {
                        await this.setupAndroidChannels();
                    }

                    return token.data;
                }

                return 'local-only';
            } catch (error) {
                console.error('Error registering for push notifications:', error);
                return null;
            }
        } catch (error) {
            console.error('Error in registerForPushNotifications:', error);
            return null;
        }
    }

    // Setup Android notification channels
    async setupAndroidChannels() {
        if (Platform.OS !== 'android') return;

        try {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#f97316',
            });

            // Create channels for different notification types
            await Notifications.setNotificationChannelAsync('orders', {
                name: 'Order Updates',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#f97316',
            });

            await Notifications.setNotificationChannelAsync('promotions', {
                name: 'Promotions & Offers',
                importance: Notifications.AndroidImportance.DEFAULT,
                lightColor: '#10b981',
            });

            await Notifications.setNotificationChannelAsync('delivery', {
                name: 'Delivery Updates',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#3b82f6',
            });
        } catch (error) {
            console.error('Error setting up Android channels:', error);
        }
    }

    // Schedule a local notification
    async scheduleNotification(title, body, data = {}, trigger = null) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: true,
                },
                trigger: trigger || null, // null = show immediately
            });
        } catch (error) {
            console.error('Error scheduling notification:', error);
        }
    }

    // Show instant notification
    async showNotification(title, body, data = {}) {
        await this.scheduleNotification(title, body, data, null);
    }

    // Set up notification listeners
    setupListeners(onNotificationReceived, onNotificationResponse) {
        // Listener for when notification is received while app is foregrounded
        this.notificationListener = Notifications.addNotificationReceivedListener(
            (notification) => {
                if (onNotificationReceived) {
                    onNotificationReceived(notification);
                }
            }
        );

        // Listener for when user taps on notification
        this.responseListener = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                if (onNotificationResponse) {
                    onNotificationResponse(response);
                }
            }
        );
    }

    // Remove listeners
    removeListeners() {
        if (this.notificationListener) {
            Notifications.removeNotificationSubscription(this.notificationListener);
        }
        if (this.responseListener) {
            Notifications.removeNotificationSubscription(this.responseListener);
        }
    }

    // Get notification badge count
    async getBadgeCount() {
        try {
            return await Notifications.getBadgeCountAsync();
        } catch (error) {
            return 0;
        }
    }

    // Set notification badge count
    async setBadgeCount(count) {
        try {
            await Notifications.setBadgeCountAsync(count);
        } catch (error) {
            console.error('Error setting badge count:', error);
        }
    }

    // Clear all notifications
    async clearAllNotifications() {
        try {
            await Notifications.dismissAllNotificationsAsync();
            await this.setBadgeCount(0);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    }

    // Cancel scheduled notification
    async cancelNotification(notificationId) {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
        } catch (error) {
            console.error('Error canceling notification:', error);
        }
    }

    // Get expo push token
    getExpoPushToken() {
        return this.expoPushToken;
    }
}

export default new NotificationService();