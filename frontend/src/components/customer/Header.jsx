import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiSearch, FiX } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useEffect, useState } from 'react';

export default function Header() {
    const { isAuthenticated, user, logout } = useAuthStore();
    const { fetchCart, getCartCount } = useCartStore();
    const cartCount = getCartCount();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated, fetchCart]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

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

                        {/* Mobile Menu Button */}
                        <button 
                            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open menu"
                        >
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

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    
                    {/* Drawer */}
                    <div className="fixed top-0 right-0 bottom-0 w-80 max-w-full bg-white shadow-xl z-50 md:hidden overflow-y-auto">
                        {/* Drawer Header */}
                        <div className="bg-orange text-white p-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Menu</h2>
                            <button 
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 hover:bg-orange-600 rounded-lg transition"
                                aria-label="Close menu"
                            >
                                <FiX className="text-2xl" />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="p-4">
                            {/* User Info or Auth Buttons */}
                            {isAuthenticated ? (
                                <div className="mb-6 pb-6 border-b border-gray-200">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-12 h-12 bg-orange rounded-full flex items-center justify-center">
                                            <FiUser className="text-white text-xl" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{user?.name}</p>
                                            <p className="text-sm text-gray-500">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-6 pb-6 border-b border-gray-200 space-y-2">
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full px-4 py-2 text-center font-medium text-orange border border-orange rounded-lg hover:bg-orange hover:text-white transition-all"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full px-4 py-2 text-center font-medium text-white bg-orange rounded-lg hover:bg-orange-600 transition-all"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}

                            {/* Navigation Links */}
                            <nav className="space-y-1 mb-6">
                                <Link
                                    to="/"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/products"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                >
                                    All Products
                                </Link>
                                <Link
                                    to="/cart"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center justify-between"
                                >
                                    <span>Cart</span>
                                    {cartCount > 0 && (
                                        <span className="bg-orange text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            </nav>

                            {/* Categories */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 px-4">Categories</h3>
                                <div className="space-y-1">
                                    <Link
                                        to="/products?category=fruits"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        Fruits & Vegetables
                                    </Link>
                                    <Link
                                        to="/products?category=grocery"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        Grocery
                                    </Link>
                                    <Link
                                        to="/products?category=dairy"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        Dairy Products
                                    </Link>
                                    <Link
                                        to="/products?category=snacks"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        Snacks
                                    </Link>
                                    <Link
                                        to="/products?category=beverages"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        Beverages
                                    </Link>
                                </div>
                            </div>

                            {/* User Actions */}
                            {isAuthenticated && (
                                <div className="pt-6 border-t border-gray-200">
                                    <div className="space-y-1">
                                        <Link
                                            to="/account"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                        >
                                            My Account
                                        </Link>
                                        <Link
                                            to="/orders"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                        >
                                            My Orders
                                        </Link>
                                        {['cashier', 'manager', 'admin'].includes(user?.role) && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                            >
                                                Admin Panel
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => {
                                                logout();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}
