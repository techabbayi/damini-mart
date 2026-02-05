import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { FiShoppingCart, FiTrendingUp, FiPackage } from 'react-icons/fi';

export default function Home() {
    // Fetch featured products
    const { data: featuredData = [] } = useQuery({
        queryKey: ['featured-products'],
        queryFn: async () => {
            const { data } = await api.get('/products/featured');
            return data.data?.products || [];
        },
    });

    // Fetch categories
    const { data: categoriesData = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await api.get('/categories');
            // API returns {success: true, data: {categories: []}}
            return data?.data?.categories || data?.data || [];
        },
    });

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-orange-50 to-orange-100">
                <div className="container mx-auto px-4 py-16">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="md:w-1/2 mb-8 md:mb-0">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                                Everything You Need
                                <span className="text-orange"> Delivered to Your Door</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 mb-6">
                                Home essentials, toys, gifts & more. Free delivery on orders above ₹500
                            </p>
                            <Link to="/products" className="btn-primary text-base md:text-lg px-6 md:px-8 py-2 md:py-3 inline-block">
                                Shop Now
                            </Link>
                        </div>
                        <div className="md:w-1/2">
                            <img
                                src="https://images.unsplash.com/photo-1542838132-92c53300491e"
                                alt="Fresh Groceries"
                                className="rounded-2xl shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiShoppingCart className="text-3xl text-orange" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Easy Shopping</h3>
                            <p className="text-gray-600">Browse & order your favorite products with ease</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiPackage className="text-3xl text-orange" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                            <p className="text-gray-600">Get your orders delivered within 24 hours</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiTrendingUp className="text-3xl text-orange" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
                            <p className="text-gray-600">Quality products at competitive prices</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {categoriesData?.slice(0, 6).map((category) => (
                            <Link
                                key={category._id}
                                to={`/products?category=${category._id}`}
                                className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition"
                            >
                                <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                                    <span className="text-2xl">{category.icon || '📦'}</span>
                                </div>
                                <h3 className="font-semibold text-sm">{category.name}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold">Featured Products</h2>
                        <Link to="/products" className="text-orange font-medium hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {featuredData?.map((product) => (
                            <Link
                                key={product._id}
                                to={`/products/${product.slug}`}
                                className="card hover:shadow-xl transition"
                            >
                                <img
                                    src={product.images[0]?.url || 'https://via.placeholder.com/300'}
                                    alt={product.name}
                                    className="w-full h-40 object-cover rounded-lg mb-3"
                                />
                                <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-orange font-bold">₹{product.variants?.[0]?.price || product.price || 0}</span>
                                    <button className="bg-orange text-white px-3 py-1 rounded text-xs hover:bg-orange-dark">
                                        Add
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-orange text-white py-12 md:py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Start Shopping Today!</h2>
                    <p className="text-lg md:text-xl mb-6 md:mb-8">Join thousands of happy customers</p>
                    <Link to="/register" className="bg-white text-orange px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block">
                        Create Account
                    </Link>
                </div>
            </section>
        </div>
    );
}
