import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';

export default function Checkout() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { cart, fetchCart } = useCartStore();
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [showAddressForm, setShowAddressForm] = useState(false);
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

    const { data: addresses = [], refetch: refetchAddresses } = useQuery({
        queryKey: ['addresses'],
        queryFn: async () => {
            try {
                const res = await api.get('/addresses');
                const data = res.data?.data?.addresses || res.data?.data || [];
                return Array.isArray(data) ? data : [];
            } catch (error) {
                return [];
            }
        }
    });

    // Set default address when addresses load
    useEffect(() => {
        if (addresses && addresses.length > 0 && !selectedAddress) {
            const defaultAddr = addresses.find(addr => addr.isDefault);
            setSelectedAddress(defaultAddr ? defaultAddr._id : addresses[0]._id);
        }
    }, [addresses, selectedAddress]);

    const addAddressMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.post('/addresses', data);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Address added successfully');
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            setShowAddressForm(false);
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
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to add address';
            toast.error(message);
        }
    });

    const createOrderMutation = useMutation({
        mutationFn: async (orderData) => {
            const res = await api.post('/orders', orderData);
            return res.data;
        },
        onSuccess: (data) => {
            toast.success('Order placed successfully!');
            fetchCart();
            navigate(`/orders/${data.data._id}`);
        },
        onError: (error) => {
            // Show specific validation errors if available
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                toast.error(err.message || err);
            });
} else {
    const message = error.response?.data?.message || 'Failed to place order';
    toast.error(message);
}
        }
    });

useEffect(() => {
    if (!cart || cart.items?.length === 0) {
        navigate('/cart');
    }
}, [cart, navigate]);

const handleAddAddress = (e) => {
    e.preventDefault();
    addAddressMutation.mutate(addressForm);
};

const handlePlaceOrder = async () => {
    if (!selectedAddress) {
        toast.error('Please select a delivery address');
        return;
    }

    const selectedAddr = addresses.find(addr => addr._id === selectedAddress);

    if (!selectedAddr) {
        toast.error('Selected address not found');
        return;
    }

    const orderData = {
        items: cart.items.map(item => ({
            product: item.product._id,
            variant: item.variantName || null,
            quantity: item.quantity,
            price: item.price
        })),
        deliveryAddress: {
            fullName: selectedAddr.fullName,
            phone: selectedAddr.phone,
            addressLine1: selectedAddr.addressLine1,
            addressLine2: selectedAddr.addressLine2,
            landmark: selectedAddr.landmark,
            city: selectedAddr.city,
            state: selectedAddr.state,
            pincode: selectedAddr.pincode
        },
        payment: {
            method: paymentMethod
        }
    };

    createOrderMutation.mutate(orderData);
};

if (!cart || cart.items?.length === 0) {
    return null;
}

return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {/* Delivery Address */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Delivery Address</h2>
                        <button
                            onClick={() => setShowAddressForm(!showAddressForm)}
                            className="btn btn-secondary btn-sm flex items-center gap-1"
                        >
                            <FiPlus /> Add New
                        </button>
                    </div>

                    {showAddressForm && (
                        <form onSubmit={handleAddAddress} className="mb-4 p-4 border rounded space-y-3">
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
                                <button type="submit" className="btn btn-primary" disabled={addAddressMutation.isLoading}>
                                    {addAddressMutation.isLoading ? 'Saving...' : 'Save Address'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddressForm(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-3">
                        {addresses?.map((address) => (
                            <label
                                key={address._id}
                                className={`block p-4 border rounded cursor-pointer ${selectedAddress === address._id
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-300 hover:border-orange-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="address"
                                    value={address._id}
                                    checked={selectedAddress === address._id}
                                    onChange={(e) => setSelectedAddress(e.target.value)}
                                    className="mr-3"
                                />
                                <span className="font-semibold">{address.fullName}</span>
                                {address.isDefault && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Default</span>
                                )}
                                <p className="text-sm text-gray-600 mt-1">
                                    {address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}
                                    {address.city}, {address.state} - {address.pincode}
                                </p>
                                <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Payment Method */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                    <div className="space-y-3">
                        <label className={`block p-4 border rounded cursor-pointer ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                            }`}>
                            <input
                                type="radio"
                                name="payment"
                                value="cod"
                                checked={paymentMethod === 'cod'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="mr-3"
                            />
                            <span className="font-medium">Cash on Delivery</span>
                        </label>
                        <label className={`block p-4 border rounded cursor-pointer ${paymentMethod === 'online' ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                            }`}>
                            <input
                                type="radio"
                                name="payment"
                                value="online"
                                checked={paymentMethod === 'online'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="mr-3"
                            />
                            <span className="font-medium">Online Payment (Razorpay)</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Order Summary */}
            <div>
                <div className="card sticky top-4">
                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                    <div className="space-y-2 mb-4">
                        {cart.items?.map((item) => (
                            <div key={item._id} className="flex justify-between text-sm">
                                <span>{item.product?.name} × {item.quantity}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{cart.subtotal || 0}</span>
                        </div>
                        {cart.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-₹{cart.discount}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>Delivery</span>
                            <span className="text-green-600">FREE</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-orange-600">₹{cart.total || 0}</span>
                        </div>
                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        disabled={!selectedAddress || createOrderMutation.isLoading}
                        className="btn btn-primary w-full mt-6"
                    >
                        {createOrderMutation.isLoading ? 'Placing Order...' : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>
    </div>
);
}
