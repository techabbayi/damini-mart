import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

export default function Account() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const insets = useSafeAreaInsets();

    if (!isAuthenticated) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
                <View style={styles.container}>
                    <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                        <Text style={styles.headerTitle}>My Account</Text>
                    </View>
                    <View style={styles.emptyState}>
                        <Ionicons name="person-outline" size={80} color="#d1d5db" />
                        <Text style={styles.emptyTitle}>Please login to continue</Text>
                        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login')}>
                            <Text style={styles.loginButtonText}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    const handleLogout = async () => {
        await logout();
        router.replace('/');
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={styles.container}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                    <Text style={styles.headerTitle}>My Account</Text>
                </View>

                {/* User Info Card */}
                <View style={styles.userCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                <ScrollView style={styles.content}>
                    {/* Menu Items */}
                    <View style={styles.menuSection}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/account/profile')}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="person-outline" size={24} color="#f97316" />
                                <Text style={styles.menuItemText}>Edit Profile</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/account/addresses')}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="location-outline" size={24} color="#f97316" />
                                <Text style={styles.menuItemText}>Manage Addresses</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/orders')}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="receipt-outline" size={24} color="#f97316" />
                                <Text style={styles.menuItemText}>My Orders</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/account/wishlist')}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="heart-outline" size={24} color="#f97316" />
                                <Text style={styles.menuItemText}>Wishlist</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.menuSection}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/account/notifications')}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="notifications-outline" size={24} color="#f97316" />
                                <Text style={styles.menuItemText}>Notifications</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/account/settings')}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="settings-outline" size={24} color="#f97316" />
                                <Text style={styles.menuItemText}>Settings</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/account/help')}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="help-circle-outline" size={24} color="#f97316" />
                                <Text style={styles.menuItemText}>Help & Support</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/account/about')}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="information-circle-outline" size={24} color="#f97316" />
                                <Text style={styles.menuItemText}>About Us</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>

                    {/* Branding Footer */}
                    <View style={styles.brandingFooter}>
                        <Ionicons name="code-slash" size={20} color="#f97316" />
                        <Text style={styles.brandingText}>Built by AKMultivision Multimedia Services</Text>
                    </View>

                    <View style={{ height: 40 }} />
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
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    userCard: {
        backgroundColor: '#fff',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f97316',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#6b7280',
    },
    content: {
        flex: 1,
    },
    menuSection: {
        backgroundColor: '#fff',
        marginTop: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuItemText: {
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 16,
        marginTop: 12,
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        color: '#ef4444',
        fontWeight: '600',
    },
    brandingFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        gap: 8,
        marginTop: 12,
    },
    brandingText: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 16,
    },
    loginButton: {
        backgroundColor: '#f97316',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 24,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
