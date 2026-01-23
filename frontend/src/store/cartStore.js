import { create } from 'zustand';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const useCartStore = create((set, get) => ({
    cart: null,
    isLoading: false,

    // Fetch cart
    fetchCart: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/cart');
            set({ cart: data.data.cart, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            console.error('Fetch cart error:', error);
        }
    },

    // Add to cart
    addToCart: async (productId, variantName = null, quantity = 1) => {
        try {
            const { data } = await api.post('/cart/add', {
                productId,
                variantName,
                quantity,
            });
            set({ cart: data.data.cart });
            toast.success('Added to cart!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to cart');
            throw error;
        }
    },

    // Update cart item
    updateCartItem: async (productId, variantName, quantity) => {
        try {
            const { data } = await api.put('/cart/item', {
                productId,
                variantName,
                quantity,
            });
            set({ cart: data.data.cart });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update cart');
            throw error;
        }
    },

    // Remove from cart
    removeFromCart: async (productId, variantName = null) => {
        try {
            const { data } = await api.delete('/cart/item', {
                data: { productId, variantName },
            });
            set({ cart: data.data.cart });
            toast.success('Item removed from cart');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove item');
            throw error;
        }
    },

    // Clear cart
    clearCart: async () => {
        try {
            await api.delete('/cart/clear');
            set({ cart: null });
            toast.success('Cart cleared');
        } catch (error) {
            toast.error('Failed to clear cart');
            throw error;
        }
    },

    // Apply coupon
    applyCoupon: async (couponCode) => {
        try {
            const { data } = await api.post('/cart/apply-coupon', { couponCode });
            set({ cart: data.data.cart });
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid coupon');
            throw error;
        }
    },

    // Remove coupon
    removeCoupon: async () => {
        try {
            await api.delete('/cart/remove-coupon');
            await get().fetchCart();
            toast.success('Coupon removed');
        } catch (error) {
            toast.error('Failed to remove coupon');
            throw error;
        }
    },

    // Get cart count
    getCartCount: () => {
        const cart = get().cart;
        return cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    },
}));
