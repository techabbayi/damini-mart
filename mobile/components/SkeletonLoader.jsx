import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 4, style }) {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                { width, height, borderRadius, opacity },
                style,
            ]}
        />
    );
}

export function ProductCardSkeleton() {
    return (
        <View style={styles.productCard}>
            <SkeletonLoader width="100%" height={150} borderRadius={8} />
            <View style={styles.productInfo}>
                <SkeletonLoader width="80%" height={16} style={{ marginTop: 8 }} />
                <SkeletonLoader width="40%" height={14} style={{ marginTop: 6 }} />
            </View>
        </View>
    );
}

export function ProductListSkeleton({ count = 6 }) {
    return (
        <View style={styles.grid}>
            {Array.from({ length: count }).map((_, index) => (
                <ProductCardSkeleton key={index} />
            ))}
        </View>
    );
}

export function OrderCardSkeleton() {
    return (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <SkeletonLoader width={100} height={20} />
                <SkeletonLoader width={80} height={24} borderRadius={12} />
            </View>
            <SkeletonLoader width="60%" height={14} style={{ marginTop: 8 }} />
            <View style={styles.orderFooter}>
                <SkeletonLoader width={80} height={14} />
                <SkeletonLoader width={60} height={16} />
            </View>
        </View>
    );
}

export function CartItemSkeleton() {
    return (
        <View style={styles.cartItem}>
            <SkeletonLoader width={80} height={80} borderRadius={8} />
            <View style={styles.cartItemInfo}>
                <SkeletonLoader width="80%" height={16} />
                <SkeletonLoader width="40%" height={14} style={{ marginTop: 6 }} />
                <SkeletonLoader width={60} height={20} style={{ marginTop: 8 }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#e5e7eb',
    },
    productCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 8,
        marginBottom: 12,
    },
    productInfo: {
        marginTop: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 16,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    cartItemInfo: {
        flex: 1,
        marginLeft: 12,
    },
});
