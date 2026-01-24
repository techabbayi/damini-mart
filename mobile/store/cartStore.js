import { create } from 'zustand';
import api from '../lib/api';

export const useCartStore = create((set, get) => ({
    cart: null,
    loading: false,
    error: null,

    // Fetch cart
    fetchCart: async () => {
        set({ loading: true, error: null });
        try {
            const res = await api.get('/cart');
            set({ cart: res.data.data?.cart || res.data.data, loading: false });
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch cart';
            set({ error: errorMsg, loading: false });
        }
    },

    // Add to cart
    addToCart: async (productId, quantity = 1, variantName = null) => {
        try {
            const res = await api.post('/cart/add', {
                productId,
                quantity,
                variantName,
            });
            set({ cart: res.data.data?.cart || res.data.data });
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to add to cart';
            return { success: false, error: errorMsg };
        }
    },

    // Update cart item
    updateCartItem: async (productId, variantName, quantity) => {
        try {
            const res = await api.put('/cart/update', { productId, variantName, quantity });
            set({ cart: res.data.data?.cart || res.data.data });
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to update cart';
            return { success: false, error: errorMsg };
        }
    },

    // Remove from cart
    removeFromCart: async (productId, variantName = null) => {
        try {
            const res = await api.delete('/cart/remove', { data: { productId, variantName } });
            set({ cart: res.data.data?.cart || res.data.data });
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to remove item';
            return { success: false, error: errorMsg };
        }
    },

    // Clear cart
    clearCart: async () => {
        try {
            await api.delete('/cart/clear');
            set({ cart: null });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to clear cart',
            };
        }
    },

    // Get cart count
    getCartCount: () => {
        const cart = get().cart;
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    },

    // Get cart total
    getCartTotal: () => {
        const cart = get().cart;
        return cart?.pricing?.total || 0;
    },
}));
