import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiSearch } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useEffect } from 'react';

export default function Header() {
    const { isAuthenticated, user, logout } = useAuthStore();
    const { fetchCart, getCartCount } = useCartStore();
    const cartCount = getCartCount();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated, fetchCart]);

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            {/* Top Bar */}
            <div className="bg-orange text-white py-2">
                <div className="container mx-auto px-4 text-sm text-center">
                    Free delivery on orders above ₹500
                </div>
            </div>

            {/* Main Header */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-orange rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">D</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-800">
                            Damini <span className="text-orange">Mart</span>
                        </span>
                    </Link>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search for products..."
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange"
                            />
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="relative p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <FiShoppingCart className="text-2xl text-gray-700" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="relative group">
                                <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition">
                                    <FiUser className="text-2xl text-gray-700" />
                                    <span className="hidden lg:block text-sm font-medium">
                                        {user?.name}
                                    </span>
                                </button>

                                {/* Dropdown */}
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    <Link
                                        to="/account"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        My Account
                                    </Link>
                                    <Link
                                        to="/orders"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        My Orders
                                    </Link>
                                    {['cashier', 'manager', 'admin'].includes(user?.role) && (
                                        <Link
                                            to="/admin"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Admin Panel
                                        </Link>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-orange border border-orange rounded-lg hover:bg-orange hover:text-white transition-all"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-orange rounded-lg hover:bg-orange-600 transition-all shadow-md"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu */}
                        <button className="md:hidden p-2">
                            <FiMenu className="text-2xl text-gray-700" />
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden mt-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="border-t border-gray-200">
                <div className="container mx-auto px-4">
                    <div className="flex space-x-8 py-3 overflow-x-auto scrollbar-hide">
                        <Link
                            to="/products?category=fruits"
                            className="text-sm font-medium text-gray-700 hover:text-orange whitespace-nowrap"
                        >
                            Fruits & Vegetables
                        </Link>
                        <Link
                            to="/products?category=grocery"
                            className="text-sm font-medium text-gray-700 hover:text-orange whitespace-nowrap"
                        >
                            Grocery
                        </Link>
                        <Link
                            to="/products?category=dairy"
                            className="text-sm font-medium text-gray-700 hover:text-orange whitespace-nowrap"
                        >
                            Dairy Products
                        </Link>
                        <Link
                            to="/products?category=snacks"
                            className="text-sm font-medium text-gray-700 hover:text-orange whitespace-nowrap"
                        >
                            Snacks
                        </Link>
                        <Link
                            to="/products?category=beverages"
                            className="text-sm font-medium text-gray-700 hover:text-orange whitespace-nowrap"
                        >
                            Beverages
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}
