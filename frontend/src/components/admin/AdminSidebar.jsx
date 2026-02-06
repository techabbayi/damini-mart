import { Link } from 'react-router-dom';
import { FiHome, FiPackage, FiShoppingBag, FiUsers, FiGrid, FiTag, FiBarChart2 } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

export default function AdminSidebar() {
    const { user } = useAuthStore();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold">Local<span className="text-orange">Bazar</span></h2>
                <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
            </div>

            <nav className="space-y-2">
                <Link to="/admin" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
                    <FiHome />
                    <span>Dashboard</span>
                </Link>
                <Link to="/admin/orders" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
                    <FiPackage />
                    <span>Orders</span>
                </Link>
                {['manager', 'admin'].includes(user?.role) && (
                    <>
                        <Link to="/admin/products" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
                            <FiShoppingBag />
                            <span>Products</span>
                        </Link>
                        <Link to="/admin/categories" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
                            <FiGrid />
                            <span>Categories</span>
                        </Link>
                        <Link to="/admin/coupons" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
                            <FiTag />
                            <span>Coupons</span>
                        </Link>
                    </>
                )}
                {user?.role === 'admin' && (
                    <Link to="/admin/users" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
                        <FiUsers />
                        <span>Users</span>
                    </Link>
                )}
            </nav>

            <div className="absolute bottom-6 left-6 right-6">
                <Link to="/" className="block text-center py-2 px-4 bg-orange rounded-lg hover:bg-orange-dark transition">
                    Back to Store
                </Link>
            </div>
        </aside>
    );
}
