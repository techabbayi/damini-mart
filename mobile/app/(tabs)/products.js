import { useState, memo } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../lib/api';
import { useCartStore } from '../../store/cartStore';
import { ProductCardSkeleton } from '../../components/SkeletonLoader';

// Memoized product card component for better performance
const ProductCard = memo(({ product, onAddToCart }) => (
    <TouchableOpacity
        style={styles.productCard}
        onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/product/${product.slug}`);
        }}
    >
        <Image
            source={{ uri: product.images?.[0]?.url || 'https://via.placeholder.com/150' }}
            style={styles.productImage}
            contentFit="cover"
            transition={200}
        />
        <Text style={styles.productName} numberOfLines={2}>
            {product.name}
        </Text>
        <Text style={styles.productPrice}>
            ₹{product.price || product.variants?.[0]?.price || 0}
        </Text>
        <TouchableOpacity
            style={styles.addButton}
            onPress={(e) => {
                e.stopPropagation();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onAddToCart(product._id);
            }}
        >
            <Ionicons name="cart-outline" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
    </TouchableOpacity>
));

export default function Products() {
    const params = useLocalSearchParams();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(params.category || '');
    const { addToCart } = useCartStore();
    const insets = useSafeAreaInsets();

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data.data?.categories || res.data.data || [];
        },
    });

    // Use infinite query for pagination
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ['products', selectedCategory, search],
        queryFn: async ({ pageParam = 1 }) => {
            const queryParams = new URLSearchParams();
            if (selectedCategory) queryParams.append('category', selectedCategory);
            if (search) queryParams.append('search', search);
            queryParams.append('page', pageParam);
            queryParams.append('limit', '20');

            const res = await api.get(`/products?${queryParams}`);
            return res.data.data?.products || res.data.data || [];
        },
        getNextPageParam: (lastPage, pages) => {
            return lastPage.length === 20 ? pages.length + 1 : undefined;
        },
    });

    const products = data?.pages.flat() || [];

    const handleAddToCart = async (productId) => {
        try {
            const result = await addToCart(productId, 1, null);
            if (result.success) {
                Alert.alert('Success', 'Product added to cart');
            } else {
                Alert.alert('Error', result.error || 'Failed to add product');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to add product to cart');
        }
    };

    const loadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={styles.container}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                    <Text style={styles.headerTitle}>Products</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                {/* Categories Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesFilter}>
                    <TouchableOpacity
                        style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
                        onPress={() => setSelectedCategory('')}
                    >
                        <Text style={[styles.filterChipText, !selectedCategory && styles.filterChipTextActive]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    {categories?.map((category) => (
                        <TouchableOpacity
                            key={category._id}
                            style={[styles.filterChip, selectedCategory === category._id && styles.filterChipActive]}
                            onPress={() => setSelectedCategory(category._id)}
                        >
                            <Text style={[styles.filterChipText, selectedCategory === category._id && styles.filterChipTextActive]}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Products List with Infinite Scroll */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ProductCardSkeleton />
                        <ProductCardSkeleton />
                        <ProductCardSkeleton />
                    </View>
                ) : products?.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="cube-outline" size={64} color="#d1d5db" />
                        <Text style={styles.emptyStateText}>No products found</Text>
                    </View>
                ) : (
                    <FlatList
                        data={products}
                        renderItem={({ item }) => (
                            <ProductCard product={item} onAddToCart={handleAddToCart} />
                        )}
                        keyExtractor={(item) => item._id}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.listContent}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            isFetchingNextPage ? (
                                <ActivityIndicator size="small" color="#f97316" style={{ marginVertical: 20 }} />
                            ) : null
                        }
                    />
                )}
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    categoriesFilter: {
        paddingHorizontal: 16,
        marginBottom: 16,
        height: 50,
        flexGrow: 0,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterChipActive: {
        backgroundColor: '#f97316',
        borderColor: '#f97316',
    },
    filterChipText: {
        color: '#4b5563',
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    productsContainer: {
        flex: 1,
    },
    listContent: {
        padding: 8,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        gap: 12,
    },
    productCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        marginTop: 60,
    },
    emptyStateText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
});
