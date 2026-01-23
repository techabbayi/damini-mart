import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { FiShoppingBag, FiDollarSign, FiPackage, FiUsers, FiTrendingUp } from 'react-icons/fi';

export default function Dashboard() {
    const { data: stats = {} } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/analytics/dashboard');
            return res.data?.data || {};
        }
    });

    const { data: recentOrders = [] } = useQuery({
        queryKey: ['recent-orders'],
        queryFn: async () => {
            try {
                const res = await api.get('/orders/all/list?limit=5');
                const data = res.data?.data || [];
                return Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('Recent orders fetch error:', error);
                return [];
            }
        }
    });

    const { data: lowStockProducts = [] } = useQuery({
        queryKey: ['low-stock'],
        queryFn: async () => {
            try {
                const res = await api.get('/inventory/low-stock?limit=5');
                const data = res.data?.data || [];
                return Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('Low stock fetch error:', error);
                return [];
            }
        }
    });

    const getStatusColor = (status) => {
        const colors = {
            placed: 'bg-blue-100 text-blue-700',
            confirmed: 'bg-purple-100 text-purple-700',
            processing: 'bg-yellow-100 text-yellow-700',
            out_for_delivery: 'bg-orange-100 text-orange-700',
            delivered: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 text-sm">Total Orders</h3>
                            <p className="text-3xl font-bold mt-2">{stats?.totalOrders || 0}</p>
                            <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                                <FiTrendingUp /> +{stats?.ordersGrowth || 0}% this month
                            </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <FiShoppingBag className="text-blue-600 text-2xl" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 text-sm">Revenue</h3>
                            <p className="text-3xl font-bold mt-2">₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}</p>
                            <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                                <FiTrendingUp /> +{stats?.revenueGrowth || 0}% this month
                            </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <FiDollarSign className="text-green-600 text-2xl" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 text-sm">Products</h3>
                            <p className="text-3xl font-bold mt-2">{stats?.totalProducts || 0}</p>
                            <p className="text-yellow-600 text-sm mt-1">{stats?.lowStockCount || 0} low stock</p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-full">
                            <FiPackage className="text-orange-600 text-2xl" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 text-sm">Customers</h3>
                            <p className="text-3xl font-bold mt-2">{stats?.totalCustomers || 0}</p>
                            <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                                <FiTrendingUp /> +{stats?.newCustomers || 0} new
                            </p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <FiUsers className="text-purple-600 text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Recent Orders</h2>
                        <Link to="/admin/orders" className="text-orange-600 hover:text-orange-700 text-sm">
                            View All
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentOrders?.map((order) => (
                            <Link
                                key={order._id}
                                to={`/orders/${order._id}`}
                                className="block p-3 border rounded hover:border-orange-300"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">#{order.orderNumber}</p>
                                        <p className="text-sm text-gray-600">
                                            {order.user?.name || 'Guest'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-orange-600">₹{order.pricing?.total}</p>
                                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                                            {order.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {(!recentOrders || recentOrders.length === 0) && (
                            <p className="text-gray-500 text-center py-4">No recent orders</p>
                        )}
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Low Stock Alert</h2>
                        <Link to="/admin/products" className="text-orange-600 hover:text-orange-700 text-sm">
                            View All
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {lowStockProducts?.map((product) => (
                            <div key={product._id} className="flex items-center gap-3 p-3 border rounded">
                                <img
                                    src={product.images?.[0]?.url || 'https://via.placeholder.com/50'}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{product.name}</p>
                                    <p className="text-xs text-gray-600">
                                        Stock: {product.stock || product.variants?.[0]?.stock || 0}
                                    </p>
                                </div>
                                <span className="text-red-600 font-bold text-sm">Low Stock!</span>
                            </div>
                        ))}
                        {(!lowStockProducts || lowStockProducts.length === 0) && (
                            <p className="text-gray-500 text-center py-4">All products well stocked</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
