import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, RefreshControl, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import api from '../../lib/api';

export default function Wishlist() {
    const [refreshing, setRefreshing] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const { addToCart } = useCartStore();
    const queryClient = useQueryClient();

    const { data: wishlist = [], refetch, isLoading } = useQuery({
        queryKey: ['wishlist'],
        queryFn: async () => {
            const res = await api.get('/wishlist');
            return res.data.data?.wishlist || res.data.data || [];
        },
        enabled: isAuthenticated,
    });

    const removeFromWishlistMutation = useMutation({
        mutationFn: async (productId) => {
            await api.delete(`/wishlist/${productId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['wishlist']);
            Alert.alert('Success', 'Removed from wishlist');
        },
        onError: () => {
            Alert.alert('Error', 'Failed to remove from wishlist');
        },
    });

    const handleRemove = (productId) => {
        Alert.alert('Remove from Wishlist', 'Are you sure you want to remove this item?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => removeFromWishlistMutation.mutate(productId) },
        ]);
    };

    const handleAddToCart = async (productId) => {
        try {
            await addToCart(productId, 1, null);
            Alert.alert('Success', 'Added to cart');
        } catch (err) {
            Alert.alert('Error', 'Failed to add to cart');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    if (!isAuthenticated) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
                <View style={styles.container}>
                    <Stack.Screen
                        options={{
                            title: 'My Wishlist',
                            headerShown: true,
                            headerStyle: { backgroundColor: '#f97316' },
                            headerTintColor: '#fff',
                        }}
                    />
                    <View style={styles.emptyState}>
                        <Ionicons name="heart-outline" size={80} color="#d1d5db" />
                        <Text style={styles.emptyTitle}>Please login to view wishlist</Text>
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
                <Stack.Screen
                    options={{
                        title: 'My Wishlist',
                        headerShown: true,
                        headerStyle: { backgroundColor: '#f97316' },
                        headerTintColor: '#fff',
                    }}
                />

                <ScrollView
                    style={styles.content}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {isLoading ? (
                        <Text style={styles.loadingText}>Loading...</Text>
                    ) : wishlist.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="heart-outline" size={80} color="#d1d5db" />
                            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
                            <Text style={styles.emptySubtitle}>Add products you love to your wishlist</Text>
                            <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/products')}>
                                <Text style={styles.shopButtonText}>Start Shopping</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.wishlistGrid}>
                            {(Array.isArray(wishlist) ? wishlist : []).map((item) => (
                                <View key={item._id} style={styles.productCard}>
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => handleRemove(item.product?._id)}
                                    >
                                        <Ionicons name="close-circle" size={24} color="#ef4444" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => router.push(`/product/${item.product?.slug}`)}
                                    >
                                        <Image
                                            source={{ uri: item.product?.images?.[0]?.url || 'https://via.placeholder.com/150' }}
                                            style={styles.productImage}
                                        />
                                        <Text style={styles.productName} numberOfLines={2}>
                                            {item.product?.name}
                                        </Text>
                                        <Text style={styles.productPrice}>
                                            ₹{item.product?.price || item.product?.variants?.[0]?.price || 0}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => handleAddToCart(item.product?._id)}
                                    >
                                        <Ionicons name="cart-outline" size={16} color="#fff" />
                                        <Text style={styles.addButtonText}>Add to Cart</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
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
    content: {
        flex: 1,
    },
    wishlistGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        gap: 12,
    },
    productCard: {
        width: '47%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        position: 'relative',
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
    },
    productImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
        height: 36,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f97316',
        marginBottom: 8,
    },
    addButton: {
        backgroundColor: '#f97316',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderRadius: 8,
        gap: 4,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#6b7280',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 32,
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
        textAlign: 'center',
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
});
