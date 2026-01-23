import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { FiSearch, FiEdit } from 'react-icons/fi';

export default function AdminUsers() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', page, search, roleFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', '20');
            if (search) params.append('search', search);
            if (roleFilter) params.append('role', roleFilter);

            const res = await api.get(`/users?${params}`);
            return res.data;
        }
    });

    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, role }) => {
            const res = await api.put(`/users/${userId}/role`, { role });
            return res.data;
        },
        onSuccess: () => {
            toast.success('User role updated');
            queryClient.invalidateQueries(['admin-users']);
        }
    });

    const toggleActiveMutation = useMutation({
        mutationFn: async (userId) => {
            const res = await api.put(`/users/${userId}/toggle-active`);
            return res.data;
        },
        onSuccess: () => {
            toast.success('User status updated');
            queryClient.invalidateQueries(['admin-users']);
        }
    });

    const getRoleBadge = (role) => {
        const colors = {
            customer: 'bg-blue-100 text-blue-700',
            cashier: 'bg-purple-100 text-purple-700',
            manager: 'bg-orange-100 text-orange-700',
            admin: 'bg-red-100 text-red-700'
        };
        return colors[role] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Users</h1>

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name, email or phone..."
                                className="input pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </div>
                    <select
                        className="input md:w-48"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="customer">Customer</option>
                        <option value="cashier">Cashier</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="card overflow-x-auto">
                {isLoading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : data?.data?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No users found</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data?.data?.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{user.name}</td>
                                    <td className="px-4 py-3 text-sm">{user.email}</td>
                                    <td className="px-4 py-3 text-sm">{user.phone}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={user.role}
                                            onChange={(e) => updateRoleMutation.mutate({
                                                userId: user._id,
                                                role: e.target.value
                                            })}
                                            className={`px-2 py-1 rounded text-sm font-medium border-0 ${getRoleBadge(user.role)}`}
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="cashier">Cashier</option>
                                            <option value="manager">Manager</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => toggleActiveMutation.mutate(user._id)}
                                            className={`px-3 py-1 rounded text-xs font-medium ${user.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {new Date(user.createdAt).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button className="text-orange-600 hover:text-orange-700">
                                            <FiEdit className="inline" /> Edit
                                        </button>
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
