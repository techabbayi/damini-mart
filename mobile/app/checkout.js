import { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import api from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import locationService from '../lib/locationService';

export default function Checkout() {
    const insets = useSafeAreaInsets();
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const { cart, fetchCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();

    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
    });

    // Fetch addresses
    const { data: addresses, isLoading: addressesLoading } = useQuery({
        queryKey: ['addresses'],
        queryFn: async () => {
            const res = await api.get('/addresses');
            return res.data.data?.addresses || res.data.data || [];
        },
        enabled: isAuthenticated,
    });

    // Validate coupon mutation
    const validateCouponMutation = useMutation({
        mutationFn: async (code) => {
            const res = await api.get(`/coupons/${code}`);
            return res.data.data;
        },
        onSuccess: (data) => {
            setAppliedCoupon(data);
            Alert.alert('Success', 'Coupon applied successfully!');
        },
        onError: () => {
            Alert.alert('Error', 'Invalid or expired coupon code');
        },
    });

    // Create address mutation
    const createAddressMutation = useMutation({
        mutationFn: async (addressData) => {
            const res = await api.post('/addresses', addressData);
            return res.data.data;
        },
        onSuccess: (newAddress) => {
            setSelectedAddress(newAddress);
            setShowAddressForm(false);
            Alert.alert('Success', 'Address added successfully!');
        },
        onError: () => {
            Alert.alert('Error', 'Failed to add address');
        },
    });

    // Place order mutation
    const placeOrderMutation = useMutation({
        mutationFn: async (orderData) => {
            const res = await api.post('/orders', orderData);
            return res.data.data;
        },
        onSuccess: (order) => {
            Alert.alert(
                'Order Placed!',
                `Your order #${order.orderNumber} has been placed successfully!`,
                [
                    {
                        text: 'View Orders',
                        onPress: () => router.replace('/orders'),
                    },
                ]
            );
        },
        onError: () => {
            Alert.alert('Error', 'Failed to place order. Please try again.');
        },
    });

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (addresses && addresses.length > 0 && !selectedAddress) {
            // Select default address or first address
            const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0];
            setSelectedAddress(defaultAddr);
        }
    }, [addresses]);

    const handleApplyCoupon = () => {
        if (couponCode.trim()) {
            validateCouponMutation.mutate(couponCode.trim());
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
    };

    const handleAddAddress = () => {
        if (!addressForm.fullName || !addressForm.phone || !addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        createAddressMutation.mutate(addressForm);
    };

    const handleUseCurrentLocation = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const address = await locationService.getCurrentAddress();
        if (address) {
            setAddressForm(prev => ({
                ...prev,
                addressLine1: address.street || prev.addressLine1,
                city: address.city || prev.city,
                state: address.region || prev.state,
                pincode: address.postalCode || prev.pincode,
            }));
            Alert.alert('Success', 'Location detected! Please verify and fill remaining details.');
        }
    };

    const calculateDiscount = () => {
        if (!appliedCoupon || !cart) return 0;

        const subtotal = cart.pricing?.subtotal || 0;

        if (appliedCoupon.discountType === 'percentage') {
            return (subtotal * appliedCoupon.discount) / 100;
        } else {
            return appliedCoupon.discount;
        }
    };

    const handlePlaceOrder = () => {
        if (!selectedAddress) {
            Alert.alert('Error', 'Please select a delivery address');
            return;
        }

        if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
            Alert.alert('Error', 'Your cart is empty');
            return;
        }

        const orderData = {
            items: (Array.isArray(cart.items) ? cart.items : []).map(item => ({
                product: item.product._id,
                variant: item.variantName || null,
                quantity: item.quantity,
                price: item.price,
            })),
            deliveryAddress: selectedAddress,
            paymentMethod,
            couponCode: appliedCoupon?.code,
        };

        placeOrderMutation.mutate(orderData);
    };

    if (!isAuthenticated) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
                <View style={styles.container}>
                    <Stack.Screen
                        options={{
                            title: 'Checkout',
                            headerShown: true,
                            headerStyle: { backgroundColor: '#f97316' },
                            headerTintColor: '#fff',
                        }}
                    />
                    <View style={styles.emptyState}>
                        <Ionicons name="lock-closed-outline" size={80} color="#d1d5db" />
                        <Text style={styles.emptyTitle}>Please login to checkout</Text>
                        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login')}>
                            <Text style={styles.loginButtonText}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    if (!cart || cart.items?.length === 0) {
        return (<View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>            <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Checkout',
                    headerShown: true,
                    headerStyle: { backgroundColor: '#f97316' },
                    headerTintColor: '#fff',
                }}
            />
            <View style={styles.emptyState}>
                <Ionicons name="cart-outline" size={80} color="#d1d5db" />
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/products')}>
                    <Text style={styles.shopButtonText}>Start Shopping</Text>
                </TouchableOpacity>
            </View>
        </View>
        </View>
        );
    }

    const discount = calculateDiscount();
    const finalTotal = (cart.pricing?.total || 0) - discount;

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        title: 'Checkout',
                        headerShown: true,
                        headerStyle: { backgroundColor: '#f97316' },
                        headerTintColor: '#fff',
                    }}
                />

                <ScrollView style={styles.content}>
                    {/* Delivery Address */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="location-outline" size={24} color="#f97316" />
                            <Text style={styles.sectionTitle}>Delivery Address</Text>
                        </View>

                        {addressesLoading ? (
                            <ActivityIndicator color="#f97316" />
                        ) : showAddressForm ? (
                            <View style={styles.addressForm}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name *"
                                    value={addressForm.fullName}
                                    onChangeText={(text) => setAddressForm({ ...addressForm, fullName: text })}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Phone Number *"
                                    value={addressForm.phone}
                                    onChangeText={(text) => setAddressForm({ ...addressForm, phone: text })}
                                    keyboardType="phone-pad"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Address Line 1 *"
                                    value={addressForm.addressLine1}
                                    onChangeText={(text) => setAddressForm({ ...addressForm, addressLine1: text })}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Address Line 2"
                                    value={addressForm.addressLine2}
                                    onChangeText={(text) => setAddressForm({ ...addressForm, addressLine2: text })}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Landmark"
                                    value={addressForm.landmark}
                                    onChangeText={(text) => setAddressForm({ ...addressForm, landmark: text })}
                                />
                                <View style={styles.inputRow}>
                                    <TextInput
                                        style={[styles.input, styles.inputHalf]}
                                        placeholder="City *"
                                        value={addressForm.city}
                                        onChangeText={(text) => setAddressForm({ ...addressForm, city: text })}
                                    />
                                    <TextInput
                                        style={[styles.input, styles.inputHalf]}
                                        placeholder="State *"
                                        value={addressForm.state}
                                        onChangeText={(text) => setAddressForm({ ...addressForm, state: text })}
                                    />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Pincode *"
                                    value={addressForm.pincode}
                                    onChangeText={(text) => setAddressForm({ ...addressForm, pincode: text })}
                                    keyboardType="number-pad"
                                />
                                <View style={styles.addressFormButtons}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => setShowAddressForm(false)}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={handleAddAddress}
                                        disabled={createAddressMutation.isPending}
                                    >
                                        {createAddressMutation.isPending ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.saveButtonText}>Save Address</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <>
                                {addresses && addresses.length > 0 ? (
                                    (Array.isArray(addresses) ? addresses : []).map((address) => (
                                        <TouchableOpacity
                                            key={address._id}
                                            style={[
                                                styles.addressCard,
                                                selectedAddress?._id === address._id && styles.addressCardSelected,
                                            ]}
                                            onPress={() => setSelectedAddress(address)}
                                        >
                                            <View style={styles.addressCardHeader}>
                                                <Ionicons
                                                    name={selectedAddress?._id === address._id ? 'radio-button-on' : 'radio-button-off'}
                                                    size={20}
                                                    color="#f97316"
                                                />
                                                <Text style={styles.addressName}>{address.fullName}</Text>
                                            </View>
                                            <Text style={styles.addressText}>
                                                {`${address.addressLine1}${address.addressLine2 ? `, ${address.addressLine2}` : ''}${address.landmark ? `, ${address.landmark}` : ''}, ${address.city}, ${address.state} - ${address.pincode}`}
                                            </Text>
                                            <Text style={styles.addressPhone}>Phone: {address.phone}</Text>
                                        </TouchableOpacity>
                                    ))
                                ) : null}
                                <TouchableOpacity style={styles.addAddressButton} onPress={() => setShowAddressForm(true)}>
                                    <Ionicons name="add-circle-outline" size={20} color="#f97316" />
                                    <Text style={styles.addAddressText}>Add New Address</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Payment Method */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="card-outline" size={24} color="#f97316" />
                            <Text style={styles.sectionTitle}>Payment Method</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionSelected]}
                            onPress={() => setPaymentMethod('cod')}
                        >
                            <Ionicons
                                name={paymentMethod === 'cod' ? 'radio-button-on' : 'radio-button-off'}
                                size={20}
                                color="#f97316"
                            />
                            <Text style={styles.paymentText}>Cash on Delivery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.paymentOption, paymentMethod === 'online' && styles.paymentOptionSelected]}
                            onPress={() => setPaymentMethod('online')}
                        >
                            <Ionicons
                                name={paymentMethod === 'online' ? 'radio-button-on' : 'radio-button-off'}
                                size={20}
                                color="#f97316"
                            />
                            <Text style={styles.paymentText}>Online Payment</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Apply Coupon */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="pricetag-outline" size={24} color="#f97316" />
                            <Text style={styles.sectionTitle}>Apply Coupon</Text>
                        </View>

                        {appliedCoupon ? (
                            <View style={styles.appliedCoupon}>
                                <Text style={styles.appliedCouponText}>
                                    {appliedCoupon.code} - ₹{discount.toFixed(2)} discount applied
                                </Text>
                                <TouchableOpacity onPress={handleRemoveCoupon}>
                                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.couponInput}>
                                <TextInput
                                    style={styles.couponField}
                                    placeholder="Enter coupon code"
                                    value={couponCode}
                                    onChangeText={setCouponCode}
                                    autoCapitalize="characters"
                                />
                                <TouchableOpacity
                                    style={styles.applyButton}
                                    onPress={handleApplyCoupon}
                                    disabled={validateCouponMutation.isPending}
                                >
                                    {validateCouponMutation.isPending ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.applyButtonText}>Apply</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Order Summary */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="receipt-outline" size={24} color="#f97316" />
                            <Text style={styles.sectionTitle}>Order Summary</Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Items ({cart.items.length})</Text>
                            <Text style={styles.summaryValue}>₹{cart.pricing?.subtotal || 0}</Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Charges</Text>
                            <Text style={styles.summaryValue}>
                                {cart.pricing?.deliveryCharge > 0 ? `₹${cart.pricing?.deliveryCharge}` : 'FREE'}
                            </Text>
                        </View>

                        {discount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Coupon Discount</Text>
                                <Text style={[styles.summaryValue, styles.discountValue]}>-₹{discount.toFixed(2)}</Text>
                            </View>
                        )}

                        <View style={styles.divider} />

                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>₹{finalTotal.toFixed(2)}</Text>
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Place Order Button */}
                <View style={styles.bottomBar}>
                    <View style={styles.bottomTotal}>
                        <Text style={styles.bottomTotalLabel}>Total</Text>
                        <Text style={styles.bottomTotalValue}>₹{finalTotal.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.placeOrderButton}
                        onPress={handlePlaceOrder}
                        disabled={placeOrderMutation.isPending || !selectedAddress}
                    >
                        {placeOrderMutation.isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.placeOrderText}>Place Order</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>        </View>);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    content: {
        flex: 1,
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
    section: {
        backgroundColor: '#fff',
        marginTop: 12,
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    addressCard: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    addressCardSelected: {
        borderColor: '#f97316',
        backgroundColor: '#fff7ed',
    },
    addressCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    addressName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    addressText: {
        fontSize: 14,
        color: '#6b7280',
        marginLeft: 28,
        marginBottom: 4,
    },
    addressPhone: {
        fontSize: 14,
        color: '#6b7280',
        marginLeft: 28,
    },
    addAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#f97316',
        borderRadius: 8,
        borderStyle: 'dashed',
        gap: 8,
    },
    addAddressText: {
        color: '#f97316',
        fontWeight: '600',
    },
    addressForm: {
        gap: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    inputHalf: {
        flex: 1,
    },
    addressFormButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#6b7280',
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f97316',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        marginBottom: 12,
        gap: 12,
    },
    paymentOptionSelected: {
        borderColor: '#f97316',
        backgroundColor: '#fff7ed',
    },
    paymentText: {
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '500',
    },
    couponInput: {
        flexDirection: 'row',
        gap: 12,
    },
    couponField: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
    applyButton: {
        backgroundColor: '#f97316',
        paddingHorizontal: 24,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
    },
    applyButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    appliedCoupon: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#dcfce7',
        borderRadius: 8,
    },
    appliedCouponText: {
        color: '#16a34a',
        fontWeight: '600',
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f97316',
    },
    bottomBar: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 12,
        alignItems: 'center',
    },
    bottomTotal: {
        flex: 1,
    },
    bottomTotalLabel: {
        fontSize: 12,
        color: '#6b7280',
    },
    bottomTotalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f97316',
    },
    placeOrderButton: {
        backgroundColor: '#f97316',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        minWidth: 150,
        alignItems: 'center',
    },
    placeOrderText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
