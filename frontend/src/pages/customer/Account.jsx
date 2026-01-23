import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { FiUser, FiMapPin, FiLock, FiTrash2, FiEdit } from 'react-icons/fi';

export default function Account() {
    const { user, updateProfile } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');

    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        type: 'home'
    });

    const { data: addresses, refetch: refetchAddresses } = useQuery({
        queryKey: ['addresses'],
        queryFn: async () => {
            const res = await api.get('/addresses');
            return res.data.data;
        }
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.put('/auth/update-profile', data);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Profile updated successfully');
            updateProfile(profileForm);
        }
    });

    const changePasswordMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.put('/auth/change-password', data);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Password changed successfully');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
    });

    const saveAddressMutation = useMutation({
        mutationFn: async (data) => {
            if (editingAddress) {
                const res = await api.put(`/addresses/${editingAddress}`, data);
                return res.data;
            } else {
                const res = await api.post('/addresses', data);
                return res.data;
            }
        },
        onSuccess: () => {
            toast.success(editingAddress ? 'Address updated' : 'Address added');
            refetchAddresses();
            setEditingAddress(null);
            setAddressForm({
                fullName: '',
                phone: '',
                addressLine1: '',
                addressLine2: '',
                landmark: '',
                city: '',
                state: '',
                pincode: '',
                type: 'home'
            });
        }
    });

    const deleteAddressMutation = useMutation({
        mutationFn: async (id) => {
            const res = await api.delete(`/addresses/${id}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Address deleted');
            refetchAddresses();
        }
    });

    const setDefaultAddressMutation = useMutation({
        mutationFn: async (id) => {
            const res = await api.put(`/addresses/${id}/set-default`);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Default address updated');
            refetchAddresses();
        }
    });

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        updateProfileMutation.mutate(profileForm);
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        changePasswordMutation.mutate({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
        });
    };

    const handleSaveAddress = (e) => {
        e.preventDefault();
        saveAddressMutation.mutate(addressForm);
    };

    const handleEditAddress = (address) => {
        setEditingAddress(address._id);
        setAddressForm({
            fullName: address.fullName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || '',
            landmark: address.landmark || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            type: address.type
        });
        setActiveTab('addresses');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">My Account</h1>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="card">
                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full text-left px-4 py-2 rounded flex items-center gap-2 ${activeTab === 'profile' ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100'
                                    }`}
                            >
                                <FiUser /> Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('addresses')}
                                className={`w-full text-left px-4 py-2 rounded flex items-center gap-2 ${activeTab === 'addresses' ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100'
                                    }`}
                            >
                                <FiMapPin /> Addresses
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`w-full text-left px-4 py-2 rounded flex items-center gap-2 ${activeTab === 'password' ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100'
                                    }`}
                            >
                                <FiLock /> Change Password
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    {activeTab === 'profile' && (
                        <div className="card">
                            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="input"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        className="input"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={updateProfileMutation.isLoading}
                                >
                                    {updateProfileMutation.isLoading ? 'Updating...' : 'Update Profile'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'addresses' && (
                        <div className="space-y-6">
                            <div className="card">
                                <h2 className="text-2xl font-bold mb-4">
                                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                                </h2>
                                <form onSubmit={handleSaveAddress} className="space-y-3">
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            className="input"
                                            value={addressForm.fullName}
                                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone Number"
                                            className="input"
                                            value={addressForm.phone}
                                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Address Line 1"
                                        className="input"
                                        value={addressForm.addressLine1}
                                        onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Address Line 2 (Optional)"
                                        className="input"
                                        value={addressForm.addressLine2}
                                        onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                                    />
                                    <div className="grid md:grid-cols-3 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Landmark"
                                            className="input"
                                            value={addressForm.landmark}
                                            onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="City"
                                            className="input"
                                            value={addressForm.city}
                                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="State"
                                            className="input"
                                            value={addressForm.state}
                                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Pincode"
                                        className="input"
                                        value={addressForm.pincode}
                                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                        required
                                    />
                                    <select
                                        className="input"
                                        value={addressForm.type}
                                        onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                                    >
                                        <option value="home">Home</option>
                                        <option value="work">Work</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={saveAddressMutation.isLoading}
                                        >
                                            {saveAddressMutation.isLoading ? 'Saving...' : (editingAddress ? 'Update' : 'Save')}
                                        </button>
                                        {editingAddress && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingAddress(null);
                                                    setAddressForm({
                                                        fullName: '',
                                                        phone: '',
                                                        addressLine1: '',
                                                        addressLine2: '',
                                                        landmark: '',
                                                        city: '',
                                                        state: '',
                                                        pincode: '',
                                                        type: 'home'
                                                    });
                                                }}
                                                className="btn btn-secondary"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            <div className="card">
                                <h2 className="text-2xl font-bold mb-4">Saved Addresses</h2>
                                <div className="space-y-3">
                                    {addresses?.map((address) => (
                                        <div key={address._id} className="p-4 border rounded">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="font-semibold">{address.fullName}</span>
                                                    {address.isDefault && (
                                                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                            Default
                                                        </span>
                                                    )}
                                                    <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                                                        {address.type}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditAddress(address)}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        <FiEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Delete this address?')) {
                                                                deleteAddressMutation.mutate(address._id);
                                                            }
                                                        }}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}
                                                {address.city}, {address.state} - {address.pincode}
                                            </p>
                                            <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                                            {!address.isDefault && (
                                                <button
                                                    onClick={() => setDefaultAddressMutation.mutate(address._id)}
                                                    className="text-sm text-orange-600 hover:text-orange-700 mt-2"
                                                >
                                                    Set as Default
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'password' && (
                        <div className="card">
                            <h2 className="text-2xl font-bold mb-6">Change Password</h2>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        className="input"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">New Password</label>
                                    <input
                                        type="password"
                                        className="input"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="input"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={changePasswordMutation.isLoading}
                                >
                                    {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
