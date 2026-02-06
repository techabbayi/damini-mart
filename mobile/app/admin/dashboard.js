import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();

    // Fetch dashboard stats
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await api.get('/orders/stats');
            return res.data.data || {};
        },
    });

    // Check if user has admin access
    if (!user || !['admin', 'manager', 'cashier'].includes(user.role)) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.accessDenied}>
                    <Ionicons name="lock-closed" size={80} color="#ef4444" />
                    <Text style={styles.accessDeniedText}>Access Denied</Text>
                    <Text style={styles.accessDeniedSubtext}>You don't have permission to access admin panel</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen 
                options={{
                    headerShown: true,
                    title: 'Admin Dashboard',
                    headerStyle: { backgroundColor: '#3b82f6' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />

            <ScrollView style={styles.content}>
                {/* Welcome Header */}
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeText}>Welcome back, {user?.name}!</Text>
                    <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={styles.loadingText}>Loading dashboard...</Text>
                    </View>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <View style={styles.statsGrid}>
                            <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
                                <Ionicons name="cart" size={32} color="#fff" />
                                <Text style={styles.statValue}>{stats?.totalOrders || 0}</Text>
                                <Text style={styles.statLabel}>Total Orders</Text>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
                                <Ionicons name="checkmark-circle" size={32} color="#fff" />
                                <Text style={styles.statValue}>{stats?.completedOrders || 0}</Text>
                                <Text style={styles.statLabel}>Completed</Text>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
                                <Ionicons name="time" size={32} color="#fff" />
                                <Text style={styles.statValue}>{stats?.pendingOrders || 0}</Text>
                                <Text style={styles.statLabel}>Pending</Text>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: '#8b5cf6' }]}>
                                <Ionicons name="cash" size={32} color="#fff" />
                                <Text style={styles.statValue}>₹{stats?.totalRevenue || 0}</Text>
                                <Text style={styles.statLabel}>Revenue</Text>
                            </View>
                        </View>

                        {/* Quick Actions */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Quick Actions</Text>
                            
                            <TouchableOpacity 
                                style={styles.actionCard}
                                onPress={() => router.push('/admin/orders')}
                            >
                                <View style={styles.actionIcon}>
                                    <Ionicons name="cart" size={24} color="#3b82f6" />
                                </View>
                                <View style={styles.actionContent}>
                                    <Text style={styles.actionTitle}>Manage Orders</Text>
                                    <Text style={styles.actionSubtitle}>View and process customer orders</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.actionCard}
                                onPress={() => router.push('/admin/products')}
                            >
                                <View style={styles.actionIcon}>
                                    <Ionicons name="cube" size={24} color="#10b981" />
                                </View>
                                <View style={styles.actionContent}>
                                    <Text style={styles.actionTitle}>Manage Products</Text>
                                    <Text style={styles.actionSubtitle}>Add, edit or remove products</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
                            </TouchableOpacity>

                            {user?.role === 'admin' && (
                                <TouchableOpacity 
                                    style={styles.actionCard}
                                    onPress={() => router.push('/admin/users')}
                                >
                                    <View style={styles.actionIcon}>
                                        <Ionicons name="people" size={24} color="#8b5cf6" />
                                    </View>
                                    <View style={styles.actionContent}>
                                        <Text style={styles.actionTitle}>Manage Users</Text>
                                        <Text style={styles.actionSubtitle}>Manage customer accounts and staff</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
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
        padding: 16,
    },
    accessDenied: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    accessDeniedText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 16,
    },
    accessDeniedSubtext: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 8,
    },
    backButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 24,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    welcomeCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    roleText: {
        fontSize: 14,
        color: '#3b82f6',
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        width: (width - 48) / 2,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 12,
    },
    statLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
    },
    actionCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    actionSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
});
