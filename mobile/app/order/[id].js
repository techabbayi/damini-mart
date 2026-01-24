import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import api from '../../lib/api';

export default function OrderDetails() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const { data: order, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const res = await api.get(`/orders/${id}`);
            return res.data.data?.order || res.data.data;
        },
    });

    const handleWhatsAppContact = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const phoneNumber = '919390639065'; // Damini Mart contact
        const message = `Hi, I need help with my order #${order?.orderNumber || id}`;
        const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        Linking.openURL(url).catch(() => {
            alert('Please install WhatsApp to contact us');
        });
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

    const getStatusIcon = (status) => {
        const icons = {
            placed: 'checkmark-circle',
            confirmed: 'checkmark-done-circle',
            processing: 'hourglass',
            out_for_delivery: 'bicycle',
            delivered: 'checkmark-done-circle',
            cancelled: 'close-circle',
        };
        return icons[status] || 'information-circle';
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
                <View style={styles.container}>
                    <Stack.Screen
                        options={{
                            title: 'Order Details',
                            headerShown: true,
                            headerStyle: { backgroundColor: '#f97316' },
                            headerTintColor: '#fff',
                        }}
                    />
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#f97316" />
                        <Text style={styles.loadingText}>Loading order details...</Text>
                    </View>
                </View>
            </View>
        );
    }

    if (!order) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
                <View style={styles.container}>
                    <Stack.Screen
                        options={{
                            title: 'Order Not Found',
                            headerShown: true,
                            headerStyle: { backgroundColor: '#f97316' },
                            headerTintColor: '#fff',
                        }}
                    />
                    <View style={styles.emptyState}>
                        <Ionicons name="alert-circle-outline" size={80} color="#d1d5db" />
                        <Text style={styles.emptyTitle}>Order not found</Text>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Text style={styles.backButtonText}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        title: `Order #${order.orderNumber || 'Details'}`,
                        headerShown: true,
                        headerStyle: { backgroundColor: '#f97316' },
                        headerTintColor: '#fff',
                    }}
                />

                <ScrollView style={styles.content}>
                    {/* Order Status */}
                    <View style={styles.statusCard}>
                        <View style={styles.statusHeader}>
                            <Ionicons
                                name={getStatusIcon(order.status)}
                                size={32}
                                color={getStatusColor(order.status)}
                            />
                            <View style={styles.statusInfo}>
                                <Text style={styles.statusTitle}>
                                    {order.status ? order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Order Status'}
                                </Text>
                                <Text style={styles.statusSubtitle}>
                                    Order placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Order Items */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Order Items</Text>
                        {order.items && order.items.map((item, index) => (
                            <View key={index} style={styles.itemCard}>
                                <Image
                                    source={{
                                        uri: item.product?.images?.[0]?.url || 'https://via.placeholder.com/80',
                                    }}
                                    style={styles.itemImage}
                                />
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.product?.name || 'Product'}</Text>
                                    {item.variant && (
                                        <Text style={styles.itemVariant}>Variant: {item.variant}</Text>
                                    )}
                                    <Text style={styles.itemPrice}>₹{item.price || 0}</Text>
                                    <Text style={styles.itemQuantity}>Qty: {item.quantity || 1}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Delivery Address */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                        <View style={styles.addressCard}>
                            <Text style={styles.addressName}>{order.deliveryAddress?.fullName || 'Name'}</Text>
                            <Text style={styles.addressText}>
                                {order.deliveryAddress?.addressLine1 || 'Address'}
                                {order.deliveryAddress?.addressLine2 ? `, ${order.deliveryAddress.addressLine2}` : ''}
                                {order.deliveryAddress?.landmark ? `, ${order.deliveryAddress.landmark}` : ''}
                            </Text>
                            <Text style={styles.addressText}>
                                {order.deliveryAddress?.city || 'City'}, {order.deliveryAddress?.state || 'State'} - {order.deliveryAddress?.pincode || 'Pin'}
                            </Text>
                            <Text style={styles.addressPhone}>Phone: {order.deliveryAddress?.phone || 'Phone'}</Text>
                        </View>
                    </View>

                    {/* Order Summary */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Order Summary</Text>
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Items Total</Text>
                                <Text style={styles.summaryValue}>₹{order.pricing?.subtotal || 0}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Delivery Charges</Text>
                                <Text style={styles.summaryValue}>
                                    {order.pricing?.deliveryCharge > 0 ? `₹${order.pricing.deliveryCharge}` : 'FREE'}
                                </Text>
                            </View>
                            {order.pricing?.discount > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Discount</Text>
                                    <Text style={[styles.summaryValue, styles.discountValue]}>
                                        -₹{order.pricing.discount}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.divider} />
                            <View style={styles.summaryRow}>
                                <Text style={styles.totalLabel}>Total Amount</Text>
                                <Text style={styles.totalValue}>₹{order.pricing?.total || 0}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Payment Method</Text>
                                <Text style={styles.summaryValue}>
                                    {order.payment?.method === 'cod' || order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Contact Support */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Need Help?</Text>
                        <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsAppContact}>
                            <Ionicons name="logo-whatsapp" size={24} color="#fff" />
                            <Text style={styles.whatsappButtonText}>Contact Damini Mart on WhatsApp</Text>
                        </TouchableOpacity>
                        <View style={styles.contactInfo}>
                            <View style={styles.contactRow}>
                                <Ionicons name="call-outline" size={20} color="#f97316" />
                                <Text style={styles.contactText}>+91 93906 39065</Text>
                            </View>
                            <View style={styles.contactRow}>
                                <Ionicons name="time-outline" size={20} color="#f97316" />
                                <Text style={styles.contactText}>Mon-Sat: 8 AM - 10 PM</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 20 }} />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6b7280',
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
    backButton: {
        backgroundColor: '#f97316',
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
    statusCard: {
        backgroundColor: '#fff',
        marginTop: 12,
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusInfo: {
        marginLeft: 12,
        flex: 1,
    },
    statusTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    statusSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 12,
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    itemCard: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    itemInfo: {
        marginLeft: 12,
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    itemVariant: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f97316',
        marginTop: 4,
    },
    itemQuantity: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    addressCard: {
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    addressName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 2,
        lineHeight: 20,
    },
    addressPhone: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    summaryCard: {
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    summaryValue: {
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '500',
    },
    discountValue: {
        color: '#10b981',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f97316',
    },
    whatsappButton: {
        backgroundColor: '#25D366',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    whatsappButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    contactInfo: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
        gap: 12,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    contactText: {
        fontSize: 14,
        color: '#4b5563',
    },
});
