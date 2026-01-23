import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function Settings() {
    const { user, logout } = useAuthStore();
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [smsEnabled, setSmsEnabled] = useState(false);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    router.replace('/');
                },
            },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Coming Soon', 'Account deletion will be available soon');
                    },
                },
            ]
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        title: 'Settings',
                        headerShown: true,
                        headerStyle: { backgroundColor: '#f97316' },
                        headerTintColor: '#fff',
                    }}
                />

                <ScrollView style={styles.content}>
                    {/* Account Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account</Text>

                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/account/profile')}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="person-outline" size={24} color="#f97316" />
                                <Text style={styles.menuItemText}>Edit Profile</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="lock-closed-outline" size={24} color="#f97316" />
                                <Text style={styles.menuItemText}>Change Password</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    {/* Notifications Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notifications</Text>

                        <View style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="notifications-outline" size={24} color="#f97316" />
                                <Text style={styles.menuItemText}>Push Notifications</Text>
                            </View>
                            <Switch
                                value={pushEnabled}
                                onValueChange={setPushEnabled}
                                trackColor={{ false: '#d1d5db', true: '#fed7aa' }}
                                thumbColor={pushEnabled ? '#f97316' : '#f3f4f6'}
                            />
                        </View>

                        <View style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="mail-outline" size={24} color="#f97316" />
                                <Text style={styles.menuItemText}>Email Notifications</Text>
                            </View>
                            <Switch
                                value={emailEnabled}
                                onValueChange={setEmailEnabled}
                                trackColor={{ false: '#d1d5db', true: '#fed7aa' }}
                                thumbColor={emailEnabled ? '#f97316' : '#f3f4f6'}
                            />
                        </View>

                        <View style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="chatbubble-outline" size={24} color="#f97316" />
                                <Text style={styles.menuItemText}>SMS Notifications</Text>
                            </View>
                            <Switch
                                value={smsEnabled}
                                onValueChange={setSmsEnabled}
                                trackColor={{ false: '#d1d5db', true: '#fed7aa' }}
                                thumbColor={smsEnabled ? '#f97316' : '#f3f4f6'}
                            />
                        </View>
                    </View>

                    {/* App Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>App</Text>

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="language-outline" size={24} color="#f97316" />
                                <View>
                                    <Text style={styles.menuItemText}>Language</Text>
                                    <Text style={styles.menuItemSubtext}>English</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="moon-outline" size={24} color="#f97316" />
                                <Text style={styles.menuItemText}>Dark Mode</Text>
                            </View>
                            <Switch
                                value={false}
                                onValueChange={() => Alert.alert('Coming Soon', 'Dark mode will be available soon')}
                                trackColor={{ false: '#d1d5db', true: '#fed7aa' }}
                                thumbColor="#f3f4f6"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="trash-outline" size={24} color="#f97316" />
                                <Text style={styles.menuItemText}>Clear Cache</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    {/* Privacy & Security */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Privacy & Security</Text>

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="shield-checkmark-outline" size={24} color="#f97316" />
                                <Text style={styles.menuItemText}>Privacy Policy</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="document-text-outline" size={24} color="#f97316" />
                                <Text style={styles.menuItemText}>Terms of Service</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    {/* Danger Zone */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Danger Zone</Text>

                        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                                <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Logout</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="warning-outline" size={24} color="#ef4444" />
                                <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Delete Account</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Version 1.0.0</Text>
                        <Text style={styles.footerText}>Built by AKMultivision Multimedia Services</Text>
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
    section: {
        backgroundColor: '#fff',
        marginBottom: 8,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuItemText: {
        fontSize: 16,
        color: '#1f2937',
        marginLeft: 12,
        fontWeight: '500',
    },
    menuItemSubtext: {
        fontSize: 12,
        color: '#6b7280',
        marginLeft: 12,
        marginTop: 2,
    },
    footer: {
        padding: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 4,
        textAlign: 'center',
    },
});
