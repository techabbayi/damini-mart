import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';

export default function AdminProducts() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        stock: '',
        brand: '',
        isActive: true
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            // API returns {success: true, data: {categories: []}}
            return res.data?.data?.categories || res.data?.data || [];
        }
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin-products', page, search],
        queryFn: async () => {
            try {
                const params = new URLSearchParams();
                params.append('page', page);
                params.append('limit', '15');
                if (search) params.append('search', search);

                const res = await api.get(`/products?${params}`);
                console.log('Admin Products API Response:', res.data);

                // API returns {success: true, data: {products: [], pagination: {}}}
                if (res.data?.data?.products) {
                    return {
                        data: res.data.data.products,
                        pagination: res.data.data.pagination
                    };
                }
                // Fallback to old structure
                return res.data?.data || { data: [], pagination: {} };
            } catch (error) {
                console.error('Products fetch error:', error);
                return { data: [], pagination: {} };
            }
        }
    });

    const createProductMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.post('/products', data);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Product created successfully');
            queryClient.invalidateQueries(['admin-products']);
            closeModal();
        }
    });

    const updateProductMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await api.put(`/products/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Product updated successfully');
            queryClient.invalidateQueries(['admin-products']);
            closeModal();
        }
    });

    const deleteProductMutation = useMutation({
        mutationFn: async (id) => {
            const res = await api.delete(`/products/${id}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Product deleted successfully');
            queryClient.invalidateQueries(['admin-products']);
        }
    });

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product._id);
            setFormData({
                name: product.name,
                description: product.description,
                category: product.category?._id || '',
                price: product.price || product.variants?.[0]?.price || '',
                stock: product.stock || product.variants?.[0]?.stock || '',
                brand: product.brand || '',
                isActive: product.isActive
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                category: '',
                price: '',
                stock: '',
                brand: '',
                isActive: true
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock)
        };

        if (editingProduct) {
            updateProductMutation.mutate({ id: editingProduct, data });
        } else {
            createProductMutation.mutate(data);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteProductMutation.mutate(id);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Products</h1>
                <button onClick={() => openModal()} className="btn btn-primary flex items-center gap-2">
                    <FiPlus /> Add Product
                </button>
            </div>

            {/* Search */}
            <div className="card mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="input pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.data?.map((product) => (
                        <div key={product._id} className="card">
                            <img
                                src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
                                alt={product.name}
                                className="w-full h-48 object-cover rounded-t-lg mb-4"
                            />
                            <h3 className="font-semibold mb-2">{product.name}</h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xl font-bold text-orange-600">
                                    ₹{product.price || product.variants?.[0]?.price || 0}
                                </span>
                                <span className="text-sm text-gray-600">
                                    Stock: {product.stock || product.variants?.[0]?.stock || 0}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openModal(product)}
                                    className="btn btn-secondary flex-1 flex items-center justify-center gap-1"
                                >
                                    <FiEdit /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product._id)}
                                    className="btn bg-red-500 text-white hover:bg-red-600 flex-1 flex items-center justify-center gap-1"
                                >
                                    <FiTrash2 /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {data?.pagination?.pages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {page > 1 && (
                        <button onClick={() => setPage(page - 1)} className="btn btn-secondary">
                            Previous
                        </button>
                    )}
                    <span className="flex items-center px-4">
                        Page {page} of {data.pagination.pages}
                    </span>
                    {page < data.pagination.pages && (
                        <button onClick={() => setPage(page + 1)} className="btn btn-secondary">
                            Next
                        </button>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Product Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="input"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    className="input"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories?.map((cat) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Stock</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Brand (Optional)</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-1"
                                    disabled={createProductMutation.isLoading || updateProductMutation.isLoading}
                                >
                                    {editingProduct ? 'Update' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="btn btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
