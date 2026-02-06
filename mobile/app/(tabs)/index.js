import { useEffect, useState, useRef, memo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Dimensions, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics'; import { useSafeAreaInsets } from 'react-native-safe-area-context'; import api from '../../lib/api';
import { useCartStore } from '../../store/cartStore';
import { ProductListSkeleton } from '../../components/SkeletonLoader';
import ErrorRetry from '../../components/ErrorRetry';

const { width, height } = Dimensions.get('window');
const BANNER_HEIGHT = Math.min(height * 0.22, 200); // 22% of screen height, max 200px
const PRODUCT_IMAGE_HEIGHT = Math.min((width * 0.48 - 24) * 0.75, 140); // 75% of card width, max 140px
const BANNER_IMAGES = [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=800',
    'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=800',
];

export default function Home() {
    const [refreshing, setRefreshing] = useState(false);
    const [currentBanner, setCurrentBanner] = useState(0);
    const scrollViewRef = useRef(null);
    const { addToCart } = useCartStore();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBanner((prev) => {
                const next = (prev + 1) % BANNER_IMAGES.length;
                scrollViewRef.current?.scrollTo({ x: next * (width - 32), animated: true });
                return next;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const { data: categories, refetch: refetchCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            try {
                const res = await api.get('/categories');
                const categoriesData = res.data.data?.categories || res.data.data || [];
                return categoriesData;
            } catch (err) {
                throw err;
            }
        },
    });

    const { data: featured, refetch: refetchFeatured, isLoading, error } = useQuery({
        queryKey: ['featured-products'],
        queryFn: async () => {
            try {
                const res = await api.get('/products?limit=10');
                const productsData = res.data.data?.products || res.data.data || [];
                return productsData;
            } catch (err) {
                throw err;
            }
        },
    });

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refetchCategories(), refetchFeatured()]);
        setRefreshing(false);
    };

    const handleAddToCart = async (productId) => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const result = await addToCart(productId, 1, null);
            if (result.success) {
                Alert.alert('Success', 'Added to cart!');
            } else {
                Alert.alert('Error', result.error || 'Failed to add item to cart');
            }
        } catch (err) {
            console.error('❌ Add to cart error:', err);
            Alert.alert('Error', 'Failed to add item to cart');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                    <View>
                        <Text style={styles.headerTitle}>LocalBazar</Text>
                        <Text style={styles.headerSubtitle}>Fresh Groceries Delivered</Text>
                    </View>
                    <Ionicons name="notifications-outline" size={24} color="#fff" />
                </View>

                {/* Banner Carousel */}
                <View style={styles.carouselContainer}>
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(event) => {
                            const index = Math.round(event.nativeEvent.contentOffset.x / (width - 32));
                            setCurrentBanner(index);
                        }}
                    >
                        {BANNER_IMAGES.map((img, index) => (
                            <Image
                                key={index}
                                source={{ uri: img }}
                                style={styles.bannerImage}
                                contentFit="cover"
                                transition={300}
                            />
                        ))}
                    </ScrollView>
                    <View style={styles.pagination}>
                        {BANNER_IMAGES.map((_, index) => (
                            <View
                                key={index}
                                style={[styles.paginationDot, currentBanner === index && styles.paginationDotActive]}
                            />
                        ))}
                    </View>
                </View>

                {/* Promo Banner */}
                <View style={styles.banner}>
                    <Text style={styles.bannerText}>🎉 Free Delivery on Orders Above ₹500!</Text>
                </View>

                {/* Categories */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Shop by Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                        {categories?.map((category) => (
                            <TouchableOpacity
                                key={category._id}
                                style={styles.categoryCard}
                                onPress={() => router.push(`/products?category=${category._id}`)}
                            >
                                <View style={styles.categoryIcon}>
                                    <Ionicons name="basket-outline" size={32} color="#f97316" />
                                </View>
                                <Text style={styles.categoryName}>{category.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Featured Products */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Featured Products</Text>
                        <TouchableOpacity onPress={() => router.push('/products')}>
                            <Text style={styles.seeAllText}>See All →</Text>
                        </TouchableOpacity>
                    </View>
                    {isLoading ? (
                        <ProductListSkeleton count={6} />
                    ) : error ? (
                        <ErrorRetry error={error} onRetry={refetchFeatured} />
                    ) : !featured || featured.length === 0 ? (
                        <Text style={styles.noProductsText}>No products available</Text>
                    ) : (
                        <View style={styles.productsGrid}>
                            {featured?.map((product) => (
                                <TouchableOpacity
                                    key={product._id}
                                    style={styles.productCard}
                                    onPress={() => router.push(`/product/${product.slug}`)}
                                >
                                    <Image
                                        source={{ uri: product.images?.[0]?.url || 'https://via.placeholder.com/150' }}
                                        style={styles.productImage}
                                        contentFit="cover"
                                        transition={200}
                                        placeholder={require('../../assets/adaptive-icon.png')}
                                    />
                                    <Text style={styles.productName} numberOfLines={2}>
                                        {product.name}
                                    </Text>
                                    <Text style={styles.productPrice}>₹{product.price || product.variants?.[0]?.price || 0}</Text>
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(product._id);
                                        }}
                                    >
                                        <Ionicons name="cart-outline" size={16} color="#fff" />
                                        <Text style={styles.addButtonText}>Add</Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        backgroundColor: '#f97316',
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#fed7aa',
        marginTop: 4,
    },
    banner: {
        backgroundColor: '#fff3cd',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ffe69c',
    },
    bannerText: {
        textAlign: 'center',
        color: '#664d03',
        fontWeight: '600',
    },
    section: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    carouselContainer: {
        height: BANNER_HEIGHT,
        marginTop: 16,
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    bannerImage: {
        width: width - 32,
        height: BANNER_HEIGHT,
        resizeMode: 'cover',
    },
    pagination: {
        position: 'absolute',
        bottom: 12,
        flexDirection: 'row',
        alignSelf: 'center',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: '#fff',
        width: 24,
    },
    noProductsText: {
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 14,
        marginTop: 20,
    },
    seeAllText: {
        color: '#f97316',
        fontWeight: '600',
    },
    categoriesScroll: {
        marginTop: 12,
    },
    categoryCard: {
        alignItems: 'center',
        marginRight: 16,
        width: 80,
    },
    categoryIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    categoryName: {
        marginTop: 8,
        fontSize: 12,
        textAlign: 'center',
        color: '#4b5563',
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: PRODUCT_IMAGE_HEIGHT,
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
});
