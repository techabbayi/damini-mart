import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import api from '../../lib/api';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { shareProduct } from '../../lib/sharing';

export default function ProductDetails() {
    const { slug } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const queryClient = useQueryClient();

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', slug],
        queryFn: async () => {
            const res = await api.get(`/products/slug/${slug}`);
            const productData = res.data.data?.product || res.data.data;
            // Set first variant as default if variants exist
            if (productData.variants && productData.variants.length > 0) {
                setSelectedVariant(productData.variants[0]);
            }
            return productData;
        },
    });

    // Check if product is in wishlist
    const { data: wishlistStatus } = useQuery({
        queryKey: ['wishlist-check', product?._id],
        queryFn: async () => {
            if (!product?._id) return { isInWishlist: false };
            const res = await api.get(`/wishlist/check/${product._id}`);
            return res.data.data;
        },
        enabled: isAuthenticated && !!product?._id,
    });

    // Add to wishlist mutation
    const addToWishlistMutation = useMutation({
        mutationFn: async (productId) => {
            await api.post('/wishlist', { productId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['wishlist']);
            queryClient.invalidateQueries(['wishlist-check', product._id]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Added to wishlist!');
        },
        onError: (error) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to add to wishlist');
        },
    });

    // Remove from wishlist mutation
    const removeFromWishlistMutation = useMutation({
        mutationFn: async (productId) => {
            await api.delete(`/wishlist/${productId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['wishlist']);
            queryClient.invalidateQueries(['wishlist-check', product._id]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Removed from wishlist!');
        },
        onError: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to remove from wishlist');
        },
    });

    const handleToggleWishlist = () => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (wishlistStatus?.isInWishlist) {
            removeFromWishlistMutation.mutate(product._id);
        } else {
            addToWishlistMutation.mutate(product._id);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const result = await addToCart(
            product._id,
            quantity,
            selectedVariant?.name
        );

        if (result.success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Added to cart successfully!');
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', result.error || 'Failed to add to cart');
        }
    };

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await shareProduct(product);
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        await handleAddToCart();
        router.push('/cart');
    };

    const incrementQuantity = () => {
        const maxStock = selectedVariant?.stock || product?.stock || 99;
        if (quantity < maxStock) {
            setQuantity(quantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
                <View style={styles.container}>
                    <Stack.Screen
                        options={{
                            title: 'Product Details',
                            headerShown: true,
                            headerStyle: { backgroundColor: '#f97316' },
                            headerTintColor: '#fff',
                        }}
                    />
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#f97316" />
                        <Text style={styles.loadingText}>Loading product...</Text>
                    </View>
                </View>
            </View>
        );
    }

    if (!product) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
                <View style={styles.container}>
                    <Stack.Screen
                        options={{
                            title: 'Product Not Found',
                            headerShown: true,
                            headerStyle: { backgroundColor: '#f97316' },
                            headerTintColor: '#fff',
                        }}
                    />
                    <View style={styles.emptyState}>
                        <Ionicons name="alert-circle-outline" size={80} color="#d1d5db" />
                        <Text style={styles.emptyTitle}>Product not found</Text>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Text style={styles.backButtonText}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    const currentPrice = selectedVariant?.price || product.price;
    const currentStock = selectedVariant?.stock || product.stock;
    const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url;

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        title: product.name,
                        headerShown: true,
                        headerStyle: { backgroundColor: '#f97316' },
                        headerTintColor: '#fff',
                        headerRight: () => (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                                <TouchableOpacity onPress={handleToggleWishlist} style={{ marginRight: 16 }}>
                                    <Ionicons
                                        name={wishlistStatus?.isInWishlist ? 'heart' : 'heart-outline'}
                                        size={24}
                                        color={wishlistStatus?.isInWishlist ? '#fff' : '#fff'}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleShare} style={{ marginRight: 8 }}>
                                    <Ionicons name="share-social-outline" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ),
                    }}
                />

                <ScrollView style={styles.content}>
                    {/* Product Image */}
                    <View style={styles.imageContainer}>
                        {primaryImage ? (
                            <Image
                                source={{ uri: primaryImage }}
                                style={styles.productImage}
                                contentFit="contain"
                                transition={300}
                                placeholder={require('../../assets/adaptive-icon.png')}
                            />
                        ) : (
                            <View style={styles.noImageContainer}>
                                <Ionicons name="image-outline" size={80} color="#d1d5db" />
                            </View>
                        )}
                    </View>

                    {/* Product Info */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.productName}>{product.name}</Text>

                        {product.brand && (
                            <Text style={styles.brandText}>By {product.brand}</Text>
                        )}

                        <View style={styles.priceRow}>
                            <Text style={styles.price}>₹{currentPrice}</Text>
                            {product.comparePrice && product.comparePrice > currentPrice && (
                                <>
                                    <Text style={styles.comparePrice}>₹{product.comparePrice}</Text>
                                    <View style={styles.discountBadge}>
                                        <Text style={styles.discountText}>
                                            {Math.round(((product.comparePrice - currentPrice) / product.comparePrice) * 100)}% OFF
                                        </Text>
                                    </View>
                                </>
                            )}
                        </View>

                        {/* Stock Status */}
                        <View style={styles.stockContainer}>
                            {currentStock > 0 ? (
                                <Text style={styles.inStock}>
                                    <Ionicons name="checkmark-circle" size={16} color="#10b981" /> In Stock ({currentStock} available)
                                </Text>
                            ) : (
                                <Text style={styles.outOfStock}>
                                    <Ionicons name="close-circle" size={16} color="#ef4444" /> Out of Stock
                                </Text>
                            )}
                        </View>

                        {/* Variants */}
                        {product.variants && product.variants.length > 0 && (
                            <View style={styles.variantsContainer}>
                                <Text style={styles.sectionTitle}>Select Variant</Text>
                                <View style={styles.variantsList}>
                                    {(Array.isArray(product.variants) ? product.variants : []).map((variant) => (
                                        <TouchableOpacity
                                            key={variant._id}
                                            style={[
                                                styles.variantChip,
                                                selectedVariant?._id === variant._id && styles.variantChipSelected,
                                            ]}
                                            onPress={() => setSelectedVariant(variant)}
                                        >
                                            <Text
                                                style={[
                                                    styles.variantText,
                                                    selectedVariant?._id === variant._id && styles.variantTextSelected,
                                                ]}
                                            >
                                                {variant.name}
                                            </Text>
                                            {variant.stock === 0 && (
                                                <Text style={styles.variantOutOfStock}>(Out of Stock)</Text>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Quantity Selector */}
                        {currentStock > 0 && (
                            <View style={styles.quantityContainer}>
                                <Text style={styles.sectionTitle}>Quantity</Text>
                                <View style={styles.quantityControls}>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={decrementQuantity}
                                        disabled={quantity <= 1}
                                    >
                                        <Ionicons name="remove" size={20} color={quantity <= 1 ? '#d1d5db' : '#1f2937'} />
                                    </TouchableOpacity>
                                    <Text style={styles.quantityText}>{quantity}</Text>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={incrementQuantity}
                                        disabled={quantity >= currentStock}
                                    >
                                        <Ionicons name="add" size={20} color={quantity >= currentStock ? '#d1d5db' : '#1f2937'} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Description */}
                        {product.shortDescription && (
                            <View style={styles.descriptionContainer}>
                                <Text style={styles.sectionTitle}>Description</Text>
                                <Text style={styles.descriptionText}>{product.shortDescription}</Text>
                            </View>
                        )}

                        {product.description && (
                            <View style={styles.descriptionContainer}>
                                <Text style={styles.sectionTitle}>Full Description</Text>
                                <Text style={styles.descriptionText}>{product.description}</Text>
                            </View>
                        )}
                    </View>

                    {/* Add some bottom padding */}
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Bottom Action Buttons */}
                {currentStock > 0 && (
                    <View style={styles.bottomBar}>
                        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                            <Ionicons name="cart-outline" size={20} color="#fff" />
                            <Text style={styles.addToCartText}>Add to Cart</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
                            <Text style={styles.buyNowText}>Buy Now</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 24,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    imageContainer: {
        backgroundColor: '#f9fafb',
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    noImageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        padding: 16,
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    brandText: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    price: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f97316',
        marginRight: 12,
    },
    comparePrice: {
        fontSize: 18,
        color: '#9ca3af',
        textDecorationLine: 'line-through',
        marginRight: 8,
    },
    discountBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    discountText: {
        color: '#16a34a',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stockContainer: {
        marginBottom: 20,
    },
    inStock: {
        color: '#10b981',
        fontSize: 14,
        fontWeight: '600',
    },
    outOfStock: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '600',
    },
    variantsContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
    },
    variantsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    variantChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#fff',
    },
    variantChipSelected: {
        backgroundColor: '#f97316',
        borderColor: '#f97316',
    },
    variantText: {
        color: '#1f2937',
        fontWeight: '600',
    },
    variantTextSelected: {
        color: '#fff',
    },
    variantOutOfStock: {
        fontSize: 10,
        color: '#ef4444',
        marginTop: 2,
    },
    quantityContainer: {
        marginBottom: 20,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    quantityButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#d1d5db',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    quantityText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        minWidth: 40,
        textAlign: 'center',
    },
    descriptionContainer: {
        marginBottom: 20,
    },
    descriptionText: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
    },
    bottomBar: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: '#fff',
        gap: 12,
    },
    addToCartButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#f97316',
        paddingVertical: 14,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    addToCartText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buyNowButton: {
        flex: 1,
        backgroundColor: '#1f2937',
        paddingVertical: 14,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buyNowText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
