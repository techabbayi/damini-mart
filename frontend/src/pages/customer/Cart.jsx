import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';

export default function Cart() {
    const { cart, fetchCart, updateCartItem, removeFromCart, clearCart, applyCoupon, removeCoupon } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated, fetchCart]);

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        await updateCartItem(itemId, newQuantity);
    };

    const handleRemoveItem = async (itemId) => {
        await removeFromCart(itemId);
    };

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (couponCode.trim()) {
            await applyCoupon(couponCode);
            setCouponCode('');
        }
    };

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/checkout');
        } else {
            navigate('/checkout');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Please login to view your cart</h2>
                <Link to="/login" className="btn btn-primary">
                    Login
                </Link>
            </div>
        );
    }

    if (!cart || cart.items?.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <FiShoppingBag className="mx-auto text-6xl text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <Link to="/products" className="btn btn-primary">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.items.map((item) => (
                        <div key={item._id} className="card flex gap-4">
                            <img
                                src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/100'}
                                alt={item.product?.name}
                                className="w-24 h-24 object-cover rounded"
                            />
                            <div className="flex-1">
                                <Link
                                    to={`/products/${item.product?.slug}`}
                                    className="font-semibold hover:text-orange-600"
                                >
                                    {item.product?.name}
                                </Link>
                                {item.variantName && (
                                    <p className="text-sm text-gray-600">Variant: {item.variantName}</p>
                                )}
                                <p className="text-orange-600 font-bold mt-1">₹{item.price}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <button
                                    onClick={() => handleRemoveItem(item._id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <FiTrash2 />
                                </button>
                                <div className="flex items-center gap-2 border rounded">
                                    <button
                                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                        className="px-2 py-1"
                                    >
                                        -
                                    </button>
                                    <span className="px-3">{item.quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                        className="px-2 py-1"
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="font-bold">₹{item.price * item.quantity}</p>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={clearCart}
                        className="text-red-500 hover:text-red-700 font-medium"
                    >
                        Clear Cart
                    </button>
                </div>

                {/* Order Summary */}
                <div>
                    <div className="card sticky top-4">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                        {/* Coupon */}
                        <form onSubmit={handleApplyCoupon} className="mb-4">
                            <label className="block text-sm font-medium mb-2">Have a coupon?</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Coupon code"
                                    className="input flex-1"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                />
                                <button type="submit" className="btn btn-secondary">
                                    Apply
                                </button>
                            </div>
                        </form>

                        {cart.appliedCoupon && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded flex justify-between items-center">
                                <span className="text-green-700 font-medium">
                                    {cart.appliedCoupon.code} applied
                                </span>
                                <button
                                    onClick={removeCoupon}
                                    className="text-red-500 text-sm hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        )}

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{cart.subtotal || 0}</span>
                            </div>
                            {cart.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-₹{cart.discount}</span>
                                </div>
                            )}
                            <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span className="text-orange-600">₹{cart.total || 0}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="btn btn-primary w-full"
                        >
                            Proceed to Checkout
                        </button>

                        <Link
                            to="/products"
                            className="block text-center mt-3 text-orange-600 hover:text-orange-700"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
