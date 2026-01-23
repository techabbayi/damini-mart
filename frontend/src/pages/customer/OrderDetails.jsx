import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { FiPackage, FiMapPin, FiCreditCard, FiCheck } from 'react-icons/fi';

export default function OrderDetails() {
    const { id } = useParams();
    const queryClient = useQueryClient();

    const { data: order, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const res = await api.get(`/orders/${id}`);
            return res.data.data;
        }
    });

    const cancelOrderMutation = useMutation({
        mutationFn: async () => {
            const res = await api.put(`/orders/${id}/cancel`);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Order cancelled successfully');
            queryClient.invalidateQueries(['order', id]);
            queryClient.invalidateQueries(['orders']);
        }
    });

    const handleCancelOrder = () => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            cancelOrderMutation.mutate();
        }
    };

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

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="bg-gray-200 h-40 rounded"></div>
                    <div className="bg-gray-200 h-60 rounded"></div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold">Order not found</h2>
            </div>
        );
    }

    const canCancel = ['placed', 'confirmed'].includes(order.status);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <Link to="/orders" className="text-orange-600 hover:text-orange-700 mb-2 inline-block">
                    ← Back to Orders
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
                        <p className="text-gray-600">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(order.status)
                            }`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {canCancel && (
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelOrderMutation.isLoading}
                                className="btn bg-red-500 text-white hover:bg-red-600"
                            >
                                {cancelOrderMutation.isLoading ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FiPackage /> Order Items
                        </h2>
                        <div className="space-y-4">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                                    <img
                                        src={item.image || 'https://via.placeholder.com/80'}
                                        alt={item.name}
                                        className="w-20 h-20 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{item.name}</h3>
                                        {item.variantName && (
                                            <p className="text-sm text-gray-600">Variant: {item.variantName}</p>
                                        )}
                                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                        <p className="font-bold text-orange-600 mt-1">
                                            ₹{item.price} × {item.quantity} = ₹{item.total}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Tracking */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Order Tracking</h2>
                        <div className="space-y-4">
                            {order.statusHistory?.map((history, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-orange-500 text-white' : 'bg-gray-200'
                                            }`}>
                                            <FiCheck />
                                        </div>
                                        {idx < order.statusHistory.length - 1 && (
                                            <div className="w-0.5 h-12 bg-gray-200"></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold capitalize">
                                            {history.status.replace('_', ' ')}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(history.timestamp).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Delivery Address */}
                    <div className="card">
                        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                            <FiMapPin /> Delivery Address
                        </h2>
                        <div className="text-sm space-y-1">
                            <p className="font-semibold">{order.deliveryAddress?.fullName}</p>
                            <p>{order.deliveryAddress?.addressLine1}</p>
                            {order.deliveryAddress?.addressLine2 && (
                                <p>{order.deliveryAddress.addressLine2}</p>
                            )}
                            <p>
                                {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                            </p>
                            <p className="font-medium mt-2">Phone: {order.deliveryAddress?.phone}</p>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="card">
                        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                            <FiCreditCard /> Payment
                        </h2>
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span>Method:</span>
                                <span className="font-medium uppercase">{order.payment?.method}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Status:</span>
                                <span className={`font-medium ${order.payment?.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                                    }`}>
                                    {order.payment?.status?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="card">
                        <h2 className="text-lg font-bold mb-3">Price Details</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{order.pricing?.subtotal}</span>
                            </div>
                            {order.pricing?.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-₹{order.pricing.discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Delivery Charges</span>
                                <span className={order.pricing?.deliveryCharge === 0 ? 'text-green-600' : ''}>
                                    {order.pricing?.deliveryCharge === 0 ? 'FREE' : `₹${order.pricing?.deliveryCharge}`}
                                </span>
                            </div>
                            {order.pricing?.tax > 0 && (
                                <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>₹{order.pricing.tax}</span>
                                </div>
                            )}
                            <div className="border-t pt-2 flex justify-between font-bold text-base">
                                <span>Total</span>
                                <span className="text-orange-600">₹{order.pricing?.total}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
