import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

export default function AdminLayout() {
    return (
        <div className="min-h-screen bg-gray-100 flex">
            <AdminSidebar />
            <div className="flex-1 flex flex-col ml-64">
                <AdminHeader />
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
