import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

export default function AdminCoupons() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderValue: '',
        maxDiscount: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
        isActive: true
    });

    const { data: coupons, isLoading } = useQuery({
        queryKey: ['admin-coupons'],
        queryFn: async () => {
            const res = await api.get('/coupons/all');
            return res.data.data;
        }
    });

    const createCouponMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.post('/coupons', data);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Coupon created successfully');
            queryClient.invalidateQueries(['admin-coupons']);
            closeModal();
        }
    });

    const updateCouponMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await api.put(`/coupons/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Coupon updated successfully');
            queryClient.invalidateQueries(['admin-coupons']);
            closeModal();
        }
    });

    const deleteCouponMutation = useMutation({
        mutationFn: async (id) => {
            const res = await api.delete(`/coupons/${id}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Coupon deleted successfully');
            queryClient.invalidateQueries(['admin-coupons']);
        }
    });

    const openModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon._id);
            setFormData({
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                minOrderValue: coupon.minOrderValue || '',
                maxDiscount: coupon.maxDiscount || '',
                startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
                endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
                usageLimit: coupon.usageLimit || '',
                isActive: coupon.isActive
            });
        } else {
            setEditingCoupon(null);
            setFormData({
                code: '',
                discountType: 'percentage',
                discountValue: '',
                minOrderValue: '',
                maxDiscount: '',
                startDate: '',
                endDate: '',
                usageLimit: '',
                isActive: true
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCoupon(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            code: formData.code.toUpperCase(),
            discountType: formData.discountType,
            discountValue: parseFloat(formData.discountValue),
            minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : undefined,
            maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
            startDate: formData.startDate ? new Date(formData.startDate) : undefined,
            endDate: formData.endDate ? new Date(formData.endDate) : undefined,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
            isActive: formData.isActive
        };

        if (editingCoupon) {
            updateCouponMutation.mutate({ id: editingCoupon, data });
        } else {
            createCouponMutation.mutate(data);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            deleteCouponMutation.mutate(id);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Coupons</h1>
                <button onClick={() => openModal()} className="btn btn-primary flex items-center gap-2">
                    <FiPlus /> Add Coupon
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {coupons?.map((coupon) => (
                        <div key={coupon._id} className="card">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-xl text-orange-600">{coupon.code}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {coupon.discountType === 'percentage'
                                            ? `${coupon.discountValue}% OFF`
                                            : `₹${coupon.discountValue} OFF`}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {coupon.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                {coupon.minOrderValue && (
                                    <p>• Min Order: ₹{coupon.minOrderValue}</p>
                                )}
                                {coupon.maxDiscount && (
                                    <p>• Max Discount: ₹{coupon.maxDiscount}</p>
                                )}
                                {coupon.usageLimit && (
                                    <p>• Usage: {coupon.usedCount || 0}/{coupon.usageLimit}</p>
                                )}
                                {coupon.endDate && (
                                    <p>• Valid till: {new Date(coupon.endDate).toLocaleDateString('en-IN')}</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openModal(coupon)}
                                    className="btn btn-secondary flex-1 flex items-center justify-center gap-1"
                                >
                                    <FiEdit /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(coupon._id)}
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
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Coupon Code</label>
                                <input
                                    type="text"
                                    className="input uppercase"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Discount Type</label>
                                    <select
                                        className="input"
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    >
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Value</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Min Order Value</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.minOrderValue}
                                        onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Max Discount</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.maxDiscount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Usage Limit</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
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
                                    disabled={createCouponMutation.isLoading || updateCouponMutation.isLoading}
                                >
                                    {editingCoupon ? 'Update' : 'Create'}
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
