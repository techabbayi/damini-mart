import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export default function Cart() {
    const { cart, fetchCart, updateCartItem, removeFromCart, clearCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated]);

    const handleUpdateQuantity = async (item, newQuantity) => {
        if (newQuantity < 1) return;
        await updateCartItem(item.product._id, item.variantName, newQuantity);
    };

    const handleRemoveItem = async (item) => {
        await removeFromCart(item.product._id, item.variantName);
    };

    const handleClearCart = async () => {
        await clearCart();
    };

    const handleCheckout = () => {
        if (!isAuthenticated) {
            router.push('/auth/login');
        } else {
            router.push('/checkout');
        }
    };

    if (!isAuthenticated) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
                <View style={styles.container}>
                    <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                        <Text style={styles.headerTitle}>Shopping Cart</Text>
                    </View>
                    <View style={styles.emptyState}>
                        <Ionicons name="cart-outline" size={80} color="#d1d5db" />
                        <Text style={styles.emptyTitle}>Please login to view your cart</Text>
                        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login')}>
                            <Text style={styles.loginButtonText}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    if (!cart || cart.items?.length === 0) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
                <View style={styles.container}>
                    <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                        <Text style={styles.headerTitle}>Shopping Cart</Text>
                    </View>
                    <View style={styles.emptyState}>
                        <Ionicons name="cart-outline" size={80} color="#d1d5db" />
                        <Text style={styles.emptyTitle}>Your cart is empty</Text>
                        <Text style={styles.emptySubtitle}>Add some products to get started</Text>
                        <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/products')}>
                            <Text style={styles.shopButtonText}>Start Shopping</Text>
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
                    <Text style={styles.headerTitle}>Shopping Cart</Text>
                    <TouchableOpacity onPress={handleClearCart}>
                        <Text style={styles.clearText}>Clear All</Text>
                    </TouchableOpacity>
                </View>

                {/* Cart Items */}
                <ScrollView style={styles.itemsContainer}>
                    {(Array.isArray(cart.items) ? cart.items : []).map((item) => (
                        <View key={item._id} style={styles.cartItem}>
                            <Image
                                source={{ uri: item.product?.images?.[0]?.url || 'https://via.placeholder.com/80' }}
                                style={styles.itemImage}
                            />
                            <View style={styles.itemDetails}>
                                <Text style={styles.itemName} numberOfLines={2}>
                                    {item.product?.name}
                                </Text>
                                {item.variantName && (
                                    <Text style={styles.itemVariant}>{item.variantName}</Text>
                                )}
                                <Text style={styles.itemPrice}>₹{item.price}</Text>

                                {/* Quantity Controls */}
                                <View style={styles.quantityContainer}>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => handleUpdateQuantity(item, item.quantity - 1)}
                                    >
                                        <Ionicons name="remove" size={20} color="#f97316" />
                                    </TouchableOpacity>
                                    <Text style={styles.quantityText}>{item.quantity}</Text>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => handleUpdateQuantity(item, item.quantity + 1)}
                                    >
                                        <Ionicons name="add" size={20} color="#f97316" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleRemoveItem(item)}
                            >
                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>

                {/* Cart Summary */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>₹{cart.pricing?.subtotal || cart.subtotal || 0}</Text>
                    </View>
                    {(cart.pricing?.discount || cart.discount || 0) > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, styles.discountText]}>Discount</Text>
                            <Text style={[styles.summaryValue, styles.discountText]}>-₹{cart.pricing?.discount || cart.discount || 0}</Text>
                        </View>
                    )}
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>₹{cart.pricing?.total || cart.total || 0}</Text>
                    </View>
                    <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                        <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    clearText: {
        color: '#ef4444',
        fontWeight: '600',
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
    emptySubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 8,
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
    itemsContainer: {
        flex: 1,
        padding: 16,
    },
    cartItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    itemDetails: {
        flex: 1,
        marginLeft: 12,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    itemVariant: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f97316',
        marginBottom: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    quantityButton: {
        padding: 8,
    },
    quantityText: {
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    deleteButton: {
        padding: 8,
    },
    summaryContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#4b5563',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    discountText: {
        color: '#10b981',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 12,
        marginTop: 4,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f97316',
    },
    checkoutButton: {
        backgroundColor: '#f97316',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
        gap: 8,
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
