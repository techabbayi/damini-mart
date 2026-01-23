import { useAuthStore } from '../../store/authStore';
import { FiLogOut } from 'react-icons/fi';

export default function AdminHeader() {
    const { user, logout } = useAuthStore();

    return (
        <header className="bg-white shadow-sm py-4 px-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <button onClick={logout} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <FiLogOut className="text-xl text-gray-700" />
                    </button>
                </div>
            </div>
        </header>
    );
}
