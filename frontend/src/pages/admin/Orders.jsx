import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { FiSearch, FiEye } from 'react-icons/fi';

export default function AdminOrders() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-orders', page, search, status],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', '20');
            if (search) params.append('search', search);
            if (status) params.append('status', status);

            const res = await api.get(`/orders/all/list?${params}`);
            return res.data;
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ orderId, status }) => {
            const res = await api.put(`/orders/${orderId}/status`, { status });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Order status updated');
            queryClient.invalidateQueries(['admin-orders']);
        }
    });

    const getStatusColor = (status) => {
        const colors = {
            placed: 'bg-blue-100 text-blue-700',
            confirmed: 'bg-purple-100 text-purple-700',
            processing: 'bg-yellow-100 text-yellow-700',
            packed: 'bg-indigo-100 text-indigo-700',
            out_for_delivery: 'bg-orange-100 text-orange-700',
            delivered: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const statusOptions = [
        'placed', 'confirmed', 'processing', 'packed', 'out_for_delivery', 'delivered', 'cancelled'
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by order number or customer name..."
                                className="input pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </div>
                    <select
                        className="input md:w-48"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        {statusOptions.map(s => (
                            <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="card overflow-x-auto">
                {isLoading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : data?.data?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No orders found</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Order #</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Items</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Payment</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data?.data?.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">#{order.orderNumber}</td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium">{order.user?.name || 'Guest'}</p>
                                            <p className="text-sm text-gray-600">{order.user?.phone}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="px-4 py-3">{order.items?.length}</td>
                                    <td className="px-4 py-3 font-bold text-orange-600">
                                        ₹{order.pricing?.total}
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatusMutation.mutate({
                                                orderId: order._id,
                                                status: e.target.value
                                            })}
                                            className={`px-2 py-1 rounded text-sm font-medium border-0 ${getStatusColor(order.status)}`}
                                        >
                                            {statusOptions.map(s => (
                                                <option key={s} value={s}>
                                                    {s.replace('_', ' ').toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-1 rounded ${order.payment?.status === 'completed'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {order.payment?.method?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            to={`/orders/${order._id}`}
                                            className="text-orange-600 hover:text-orange-700"
                                        >
                                            <FiEye className="inline" /> View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {data?.pagination?.pages > 1 && (
                    <div className="flex justify-center gap-2 mt-6 pb-4">
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
            </div>
        </div>
    );
}
