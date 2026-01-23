import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

export default function AdminCategories() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        displayOrder: '',
        isActive: true
    });

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            // API returns {success: true, data: {categories: []}}
            return res.data?.data?.categories || res.data?.data || [];
        }
    });

    const createCategoryMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.post('/categories', data);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Category created successfully');
            queryClient.invalidateQueries(['admin-categories']);
            closeModal();
        }
    });

    const updateCategoryMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await api.put(`/categories/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Category updated successfully');
            queryClient.invalidateQueries(['admin-categories']);
            closeModal();
        }
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: async (id) => {
            const res = await api.delete(`/categories/${id}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Category deleted successfully');
            queryClient.invalidateQueries(['admin-categories']);
        }
    });

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category._id);
            setFormData({
                name: category.name,
                description: category.description || '',
                displayOrder: category.displayOrder || '',
                isActive: category.isActive
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',
                displayOrder: '',
                isActive: true
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCategory(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : undefined
        };

        if (editingCategory) {
            updateCategoryMutation.mutate({ id: editingCategory, data });
        } else {
            createCategoryMutation.mutate(data);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            deleteCategoryMutation.mutate(id);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Categories</h1>
                <button onClick={() => openModal()} className="btn btn-primary flex items-center gap-2">
                    <FiPlus /> Add Category
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories?.map((category) => (
                        <div key={category._id} className="card">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">{category.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {category.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-4">
                                Order: {category.displayOrder || 'N/A'}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openModal(category)}
                                    className="btn btn-secondary flex-1 flex items-center justify-center gap-1"
                                >
                                    <FiEdit /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(category._id)}
                                    className="btn bg-red-500 text-white hover:bg-red-600 flex-1 flex items-center justify-center gap-1"
                                >
                                    <FiTrash2 /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingCategory ? 'Edit Category' : 'Add New Category'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Category Name</label>
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
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Display Order</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.displayOrder}
                                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
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
                                    disabled={createCategoryMutation.isLoading || updateCategoryMutation.isLoading}
                                >
                                    {editingCategory ? 'Update' : 'Create'}
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
