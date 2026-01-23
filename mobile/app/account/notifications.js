import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Switch, ActivityIndicator, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import notificationService from '../../lib/notificationService';

export default function Notifications() {
    const [refreshing, setRefreshing] = useState(false);
    const [enableNotifications, setEnableNotifications] = useState(true);
    const [enableOrderUpdates, setEnableOrderUpdates] = useState(true);
    const [enablePromotions, setEnablePromotions] = useState(true);
    const { isAuthenticated } = useAuthStore();

    // Load saved preferences
    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const prefs = await AsyncStorage.getItem('notificationPreferences');
            if (prefs) {
                const parsed = JSON.parse(prefs);
                setEnableNotifications(parsed.enableNotifications ?? true);
                setEnableOrderUpdates(parsed.enableOrderUpdates ?? true);
                setEnablePromotions(parsed.enablePromotions ?? true);
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    };

    const savePreferences = async (key, value) => {
        try {
            const prefs = {
                enableNotifications,
                enableOrderUpdates,
                enablePromotions,
                [key]: value,
            };
            await AsyncStorage.setItem('notificationPreferences', JSON.stringify(prefs));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    };

    const handleNotificationToggle = async (value) => {
        setEnableNotifications(value);
        await savePreferences('enableNotifications', value);

        if (value) {
            const token = await notificationService.registerForPushNotifications();
            if (token) {
                // Optionally send token to backend
                try {
                    await api.post('/users/push-token', { token });
                } catch (error) {
                    console.error('Failed to save push token:', error);
                }
            }
        } else {
            Alert.alert(
                'Disable Notifications',
                'You will not receive any push notifications. You can re-enable them anytime.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleOrderUpdatesToggle = async (value) => {
        setEnableOrderUpdates(value);
        await savePreferences('enableOrderUpdates', value);
    };

    const handlePromotionsToggle = async (value) => {
        setEnablePromotions(value);
        await savePreferences('enablePromotions', value);
    };

    const { data: notifications = [], refetch, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await api.get('/notifications');
            return res.data.data?.notifications || res.data.data || [];
        },
        enabled: isAuthenticated,
    });

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order':
                return 'receipt-outline';
            case 'promotion':
                return 'pricetag-outline';
            case 'delivery':
                return 'bicycle-outline';
            default:
                return 'notifications-outline';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'order':
                return '#3b82f6';
            case 'promotion':
                return '#10b981';
            case 'delivery':
                return '#f97316';
            default:
                return '#6b7280';
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        title: 'Notifications',
                        headerShown: true,
                        headerStyle: { backgroundColor: '#f97316' },
                        headerTintColor: '#fff',
                    }}
                />

                <ScrollView
                    style={styles.content}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {/* Notification Settings */}
                    <View style={styles.settingsSection}>
                        <Text style={styles.sectionTitle}>Notification Settings</Text>

                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="notifications" size={24} color="#f97316" />
                                <View style={styles.settingText}>
                                    <Text style={styles.settingTitle}>Push Notifications</Text>
                                    <Text style={styles.settingSubtitle}>Receive push notifications</Text>
                                </View>
                            </View>
                            <Switch
                                value={enableNotifications}
                                onValueChange={handleNotificationToggle}
                                trackColor={{ false: '#d1d5db', true: '#fed7aa' }}
                                thumbColor={enableNotifications ? '#f97316' : '#f3f4f6'}
                            />
                        </View>

                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="receipt" size={24} color="#f97316" />
                                <View style={styles.settingText}>
                                    <Text style={styles.settingTitle}>Order Updates</Text>
                                    <Text style={styles.settingSubtitle}>Get notified about your orders</Text>
                                </View>
                            </View>
                            <Switch
                                value={enableOrderUpdates}
                                onValueChange={handleOrderUpdatesToggle}
                                trackColor={{ false: '#d1d5db', true: '#fed7aa' }}
                                thumbColor={enableOrderUpdates ? '#f97316' : '#f3f4f6'}
                            />
                        </View>

                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="pricetag" size={24} color="#f97316" />
                                <View style={styles.settingText}>
                                    <Text style={styles.settingTitle}>Promotions & Offers</Text>
                                    <Text style={styles.settingSubtitle}>Receive special offers</Text>
                                </View>
                            </View>
                            <Switch
                                value={enablePromotions}
                                onValueChange={handlePromotionsToggle}
                                trackColor={{ false: '#d1d5db', true: '#fed7aa' }}
                                thumbColor={enablePromotions ? '#f97316' : '#f3f4f6'}
                            />
                        </View>
                    </View>

                    {/* Notifications List */}
                    <View style={styles.notificationsSection}>
                        <Text style={styles.sectionTitle}>Recent Notifications</Text>
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#f97316" />
                                <Text style={styles.loadingText}>Loading notifications...</Text>
                            </View>
                        ) : notifications.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="notifications-outline" size={64} color="#d1d5db" />
                                <Text style={styles.emptyTitle}>No notifications</Text>
                                <Text style={styles.emptySubtitle}>You're all caught up!</Text>
                            </View>
                        ) : (
                            (Array.isArray(notifications) ? notifications : []).map((notification) => (
                                <TouchableOpacity key={notification._id} style={styles.notificationCard}>
                                    <View
                                        style={[
                                            styles.notificationIcon,
                                            { backgroundColor: getNotificationColor(notification.type) + '20' },
                                        ]}
                                    >
                                        <Ionicons
                                            name={getNotificationIcon(notification.type)}
                                            size={24}
                                            color={getNotificationColor(notification.type)}
                                        />
                                    </View>
                                    <View style={styles.notificationContent}>
                                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                                        <Text style={styles.notificationMessage}>{notification.message}</Text>
                                        <Text style={styles.notificationTime}>
                                            {new Date(notification.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    content: {
        flex: 1,
    },
    settingsSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingText: {
        marginLeft: 12,
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    settingSubtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    notificationsSection: {
        padding: 16,
    },
    notificationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    notificationIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
        color: '#9ca3af',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#6b7280',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 8,
    },
});
