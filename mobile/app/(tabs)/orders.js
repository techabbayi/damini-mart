import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function Orders() {
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const { isAuthenticated } = useAuthStore();
    const insets = useSafeAreaInsets();

    const { data: orders, refetch, isLoading } = useQuery({
        queryKey: ['orders', statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            params.append('limit', '20');

            const res = await api.get(`/orders/my-orders?${params}`);
            return res.data.data?.orders || res.data.data || [];
        },
        enabled: isAuthenticated,
    });

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const getStatusColor = (status) => {
        const colors = {
            placed: '#3b82f6',
            confirmed: '#8b5cf6',
            processing: '#eab308',
            out_for_delivery: '#f97316',
            delivered: '#10b981',
            cancelled: '#ef4444',
        };
        return colors[status] || '#6b7280';
    };

    const statusFilters = [
        { label: 'All', value: '' },
        { label: 'Processing', value: 'processing' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
    ];

    if (!isAuthenticated) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
                <View style={styles.container}>
                    <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                        <Text style={styles.headerTitle}>My Orders</Text>
                    </View>
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={80} color="#d1d5db" />
                        <Text style={styles.emptyTitle}>Please login to view orders</Text>
                        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login')}>
                            <Text style={styles.loginButtonText}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={styles.container}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                    <Text style={styles.headerTitle}>My Orders</Text>
                </View>

                {/* Status Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
                    {statusFilters.map((filter) => (
                        <TouchableOpacity
                            key={filter.value}
                            style={[styles.filterChip, statusFilter === filter.value && styles.filterChipActive]}
                            onPress={() => setStatusFilter(filter.value)}
                        >
                            <Text style={[styles.filterChipText, statusFilter === filter.value && styles.filterChipTextActive]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Orders List */}
                <ScrollView
                    style={styles.ordersContainer}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {isLoading ? (
                        <Text style={styles.loadingText}>Loading...</Text>
                    ) : !orders || orders.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
                            <Text style={styles.emptyTitle}>No orders found</Text>
                            <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/products')}>
                                <Text style={styles.shopButtonText}>Start Shopping</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        orders.map((order) => (
                            <TouchableOpacity
                                key={order._id}
                                style={styles.orderCard}
                                onPress={() => router.push(`/order/${order._id}`)}
                            >
                                <View style={styles.orderHeader}>
                                    <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                                        <Text style={styles.statusText}>{order.status ? order.status.replace('_', ' ').toUpperCase() : 'PENDING'}</Text>
                                    </View>
                                </View>

                                <Text style={styles.orderDate}>
                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </Text>

                                <View style={styles.orderFooter}>
                                    <Text style={styles.orderItems}>{order.items?.length} item(s)</Text>
                                    <Text style={styles.orderTotal}>₹{order.pricing?.total || 0}</Text>
                                </View>

                                <View style={styles.viewDetailsContainer}>
                                    <Text style={styles.viewDetailsText}>View Details</Text>
                                    <Ionicons name="chevron-forward" size={16} color="#f97316" />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
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
    filtersContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        height: 56,
        flexGrow: 0,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
        height: 36,
    },
    filterChipActive: {
        backgroundColor: '#f97316',
    },
    filterChipText: {
        color: '#4b5563',
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    ordersContainer: {
        flex: 1,
        padding: 16,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    orderDate: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 12,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderItems: {
        fontSize: 14,
        color: '#6b7280',
    },
    orderTotal: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f97316',
    },
    viewDetailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    viewDetailsText: {
        color: '#f97316',
        fontWeight: '600',
        marginRight: 4,
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
    shopButton: {
        backgroundColor: '#f97316',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 24,
    },
    shopButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#6b7280',
    },
});
