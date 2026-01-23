import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

export default function EditProfile() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showPasswordSection, setShowPasswordSection] = useState(false);

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.put('/auth/profile', data);
            return res.data;
        },
        onSuccess: (data) => {
            Alert.alert('Success', 'Profile updated successfully!');
            queryClient.invalidateQueries(['user']);
            useAuthStore.setState({ user: data.data });
        },
        onError: (error) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        },
    });

    // Change password mutation
    const changePasswordMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.put('/auth/change-password', data);
            return res.data;
        },
        onSuccess: () => {
            Alert.alert('Success', 'Password changed successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setShowPasswordSection(false);
        },
        onError: (error) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
        },
    });

    const handleUpdateProfile = () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        if (!formData.email.trim()) {
            Alert.alert('Error', 'Email is required');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        if (formData.phone && formData.phone.trim()) {
            if (!/^\d{10}$/.test(formData.phone.trim())) {
                Alert.alert('Error', 'Please enter a valid 10-digit phone number');
                return;
            }
        }

        updateProfileMutation.mutate(formData);
    };

    const handleChangePassword = () => {
        if (!passwordData.currentPassword) {
            Alert.alert('Error', 'Current password is required');
            return;
        }

        if (!passwordData.newPassword) {
            Alert.alert('Error', 'New password is required');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        changePasswordMutation.mutate({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
        });
    };

    const isLoading = updateProfileMutation.isPending || changePasswordMutation.isPending;

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        title: 'Edit Profile',
                        headerShown: true,
                        headerStyle: { backgroundColor: '#f97316' },
                        headerTintColor: '#fff',
                    }}
                />

                <ScrollView style={styles.content}>
                    {/* Profile Information */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="person-outline" size={20} color="#f97316" />
                            <Text style={styles.sectionTitle}>Personal Information</Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Full Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Enter your name"
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Email Address *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                placeholder="Enter your phone number"
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                            onPress={handleUpdateProfile}
                            disabled={isLoading}
                        >
                            {updateProfileMutation.isPending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Change Password */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.sectionHeader}
                            onPress={() => setShowPasswordSection(!showPasswordSection)}
                        >
                            <Ionicons name="lock-closed-outline" size={20} color="#f97316" />
                            <Text style={styles.sectionTitle}>Change Password</Text>
                            <Ionicons
                                name={showPasswordSection ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="#6b7280"
                                style={styles.chevron}
                            />
                        </TouchableOpacity>

                        {showPasswordSection && (
                            <>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Current Password *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={passwordData.currentPassword}
                                        onChangeText={(text) =>
                                            setPasswordData({ ...passwordData, currentPassword: text })
                                        }
                                        placeholder="Enter current password"
                                        secureTextEntry
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>New Password *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={passwordData.newPassword}
                                        onChangeText={(text) =>
                                            setPasswordData({ ...passwordData, newPassword: text })
                                        }
                                        placeholder="Enter new password"
                                        secureTextEntry
                                        autoCapitalize="none"
                                    />
                                    <Text style={styles.hint}>Password must be at least 6 characters</Text>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Confirm New Password *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={passwordData.confirmPassword}
                                        onChangeText={(text) =>
                                            setPasswordData({ ...passwordData, confirmPassword: text })
                                        }
                                        placeholder="Confirm new password"
                                        secureTextEntry
                                        autoCapitalize="none"
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.passwordButton, isLoading && styles.saveButtonDisabled]}
                                    onPress={handleChangePassword}
                                    disabled={isLoading}
                                >
                                    {changePasswordMutation.isPending ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <Ionicons name="key" size={20} color="#fff" />
                                            <Text style={styles.passwordButtonText}>Update Password</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Account Information */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="information-circle-outline" size={20} color="#f97316" />
                            <Text style={styles.sectionTitle}>Account Information</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Account Type</Text>
                            <Text style={styles.infoValue}>{user?.role?.toUpperCase()}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Member Since</Text>
                            <Text style={styles.infoValue}>
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                                        month: 'long',
                                        year: 'numeric',
                                    })
                                    : 'N/A'}
                            </Text>
                        </View>
                    </View>

                    {/* Danger Zone */}
                    <View style={styles.dangerSection}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="warning-outline" size={20} color="#ef4444" />
                            <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => {
                                Alert.alert(
                                    'Delete Account',
                                    'Are you sure you want to delete your account? This action cannot be undone.',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Delete',
                                            style: 'destructive',
                                            onPress: () => {
                                                Alert.alert('Feature', 'Account deletion will be implemented soon');
                                            },
                                        },
                                    ]
                                );
                            }}
                        >
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                            <Text style={styles.deleteButtonText}>Delete Account</Text>
                        </TouchableOpacity>
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
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
    },
    dangerSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        flex: 1,
    },
    dangerTitle: {
        color: '#ef4444',
    },
    chevron: {
        marginLeft: 'auto',
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        backgroundColor: '#fff',
    },
    hint: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: '#f97316',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 8,
        gap: 8,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    passwordButton: {
        backgroundColor: '#8b5cf6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 8,
        gap: 8,
    },
    passwordButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    infoLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ef4444',
        gap: 8,
    },
    deleteButtonText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
    },
});
