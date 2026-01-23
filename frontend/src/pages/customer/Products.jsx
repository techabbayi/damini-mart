import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import { useCartStore } from '../../store/cartStore';
import { FiSearch, FiShoppingCart } from 'react-icons/fi';

export default function Products() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const { addToCart } = useCartStore();

    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');

    const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            try {
                const res = await api.get('/categories');
                console.log('Categories API Response:', res.data);

                // Handle different response structures
                let categoriesData;
                if (Array.isArray(res.data)) {
                    categoriesData = res.data;
                } else if (res.data?.data?.categories) {
                    // API returns {success: true, data: {categories: []}}
                    categoriesData = res.data.data.categories;
                } else if (Array.isArray(res.data?.data)) {
                    categoriesData = res.data.data;
                } else {
                    categoriesData = [];
                }

                console.log('Processed categories:', categoriesData);
                return categoriesData;
            } catch (error) {
                console.error('Error fetching categories:', error);
                return [];
            }
        }
    });

    const { data, isLoading } = useQuery({
        queryKey: ['products', category, search, page, priceRange],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (search) params.append('search', search);
            if (priceRange.min) params.append('minPrice', priceRange.min);
            if (priceRange.max) params.append('maxPrice', priceRange.max);
            params.append('page', page);
            params.append('limit', '12');

            const res = await api.get(`/products?${params}`);
            console.log('Products API Response:', res.data);
            // API returns {success: true, data: {products: [], pagination: {}}}
            // We need to return {data: products[], pagination: {}}
            if (res.data?.data?.products) {
                return {
                    data: res.data.data.products,
                    pagination: res.data.data.pagination
                };
            }
            // Fallback to old structure
            return res.data?.data || res.data;
        }
    });

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (search) {
            params.set('search', search);
        } else {
            params.delete('search');
        }
        params.set('page', '1');
        setSearchParams(params);
    };

    const handleCategoryFilter = (catId) => {
        const params = new URLSearchParams(searchParams);
        if (catId) {
            params.set('category', catId);
        } else {
            params.delete('category');
        }
        params.set('page', '1');
        setSearchParams(params);
    };

    const handleAddToCart = async (product) => {
        await addToCart(product._id, null, 1);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Products</h1>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="input pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Search
                    </button>
                </div>
            </form>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Filters Sidebar */}
                <div className="w-full md:w-64">
                    <div className="card">
                        <h3 className="font-bold mb-4">Filters</h3>

                        {/* Categories */}
                        <div className="mb-6">
                            <h4 className="font-medium mb-2">Categories</h4>
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleCategoryFilter(null)}
                                    className={`block w-full text-left px-3 py-2 rounded ${!category ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    All Products
                                </button>
                                {Array.isArray(categories) && categories.map((cat) => (
                                    <button
                                        key={cat._id}
                                        onClick={() => handleCategoryFilter(cat._id)}
                                        className={`block w-full text-left px-3 py-2 rounded ${category === cat._id ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <h4 className="font-medium mb-2">Price Range</h4>
                            <div className="space-y-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="input"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="input"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="flex-1">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="card animate-pulse">
                                    <div className="bg-gray-200 h-48 mb-4 rounded"></div>
                                    <div className="bg-gray-200 h-4 mb-2 rounded"></div>
                                    <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : data?.data?.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No products found</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 text-sm text-gray-600">
                                Showing {data?.data?.length} of {data?.pagination?.total} products
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data?.data?.map((product) => (
                                    <div key={product._id} className="card hover:shadow-lg transition">
                                        <Link to={`/products/${product.slug}`}>
                                            <img
                                                src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
                                                alt={product.name}
                                                className="w-full h-48 object-cover rounded-t-lg mb-4"
                                            />
                                        </Link>
                                        <Link to={`/products/${product.slug}`}>
                                            <h3 className="font-semibold mb-2 hover:text-orange-600">{product.name}</h3>
                                        </Link>
                                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold text-orange-600">
                                                ₹{product.variants?.[0]?.price || product.price || 0}
                                            </span>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="btn btn-primary btn-sm flex items-center gap-1"
                                            >
                                                <FiShoppingCart /> Add
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {data?.pagination?.pages > 1 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    {page > 1 && (
                                        <button
                                            onClick={() => {
                                                const params = new URLSearchParams(searchParams);
                                                params.set('page', page - 1);
                                                setSearchParams(params);
                                            }}
                                            className="btn btn-secondary"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    <span className="flex items-center px-4">
                                        Page {page} of {data.pagination.pages}
                                    </span>
                                    {page < data.pagination.pages && (
                                        <button
                                            onClick={() => {
                                                const params = new URLSearchParams(searchParams);
                                                params.set('page', page + 1);
                                                setSearchParams(params);
                                            }}
                                            className="btn btn-secondary"
                                        >
                                            Next
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
