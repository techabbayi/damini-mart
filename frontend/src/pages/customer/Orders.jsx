import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { FiPackage, FiTruck, FiCheck } from 'react-icons/fi';

export default function Orders() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['orders', page, status],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', '10');
            if (status) params.append('status', status);

            const res = await api.get(`/orders/my-orders?${params}`);
            return res.data;
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
            cancelled: 'bg-red-100 text-red-700',
            returned: 'bg-gray-100 text-gray-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusIcon = (status) => {
        if (status === 'delivered') return <FiCheck />;
        if (status === 'out_for_delivery') return <FiTruck />;
        return <FiPackage />;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">My Orders</h1>

            {/* Status Filter */}
            <div className="mb-6 flex flex-wrap gap-2">
                <button
                    onClick={() => setStatus('')}
                    className={`px-4 py-2 rounded ${status === '' ? 'bg-orange-500 text-white' : 'bg-gray-200'
                        }`}
                >
                    All
                </button>
                {['placed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`px-4 py-2 rounded capitalize ${status === s ? 'bg-orange-500 text-white' : 'bg-gray-200'
                            }`}
                    >
                        {s.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="card animate-pulse">
                            <div className="bg-gray-200 h-20 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : data?.data?.length === 0 ? (
                <div className="card text-center py-12">
                    <FiPackage className="mx-auto text-6xl text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No orders found</p>
                    <Link to="/products" className="btn btn-primary mt-4">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {data?.data?.map((order) => (
                        <Link
                            key={order._id}
                            to={`/orders/${order._id}`}
                            className="card hover:shadow-lg transition block"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-bold text-lg">#{order.orderNumber}</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(order.status)
                                            }`}>
                                            {getStatusIcon(order.status)}
                                            {order.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {order.items?.slice(0, 3).map((item, idx) => (
                                            <img
                                                key={idx}
                                                src={item.image || 'https://via.placeholder.com/50'}
                                                alt={item.name}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                        ))}
                                        {order.items?.length > 3 && (
                                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-sm">
                                                +{order.items.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Total Amount</p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        ₹{order.pricing?.total || 0}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {order.items?.length} item(s)
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* Pagination */}
                    {data?.pagination?.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            {page > 1 && (
                                <button
                                    onClick={() => setPage(page - 1)}
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
                                    onClick={() => setPage(page + 1)}
                                    className="btn btn-secondary"
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
